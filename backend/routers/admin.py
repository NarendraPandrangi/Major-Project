from fastapi import APIRouter, Depends, HTTPException, status, Body
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import auth
from database import get_firestore_db, Collections, FieldFilter
from email_service import email_service

router = APIRouter()

class ApprovalDecision(BaseModel):
    decision: str  # "approve" or "reject"
    admin_notes: Optional[str] = None

@router.get("/pending-approvals")
async def get_pending_approvals(current_user: dict = Depends(auth.get_current_user_firestore)):
    """Get all disputes pending admin approval"""
    # Check if user is admin
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    db = get_firestore_db()
    disputes_ref = db.collection(Collections.DISPUTES)
    
    # Query disputes with status "PendingApproval"
    docs = disputes_ref.where(filter=FieldFilter("status", "==", "PendingApproval")).get()
    
    results = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        results.append(data)
    
    # Sort by updated_at (most recent first)
    results.sort(key=lambda x: x.get("updated_at", ""), reverse=True)
    return results

@router.post("/{dispute_id}/approve-resolution")
async def approve_resolution(
    dispute_id: str,
    decision: ApprovalDecision,
    current_user: dict = Depends(auth.get_current_user_firestore)
):
    """Admin approves or rejects a resolution"""
    # Check if user is admin
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    db = get_firestore_db()
    disputes_ref = db.collection(Collections.DISPUTES)
    users_ref = db.collection(Collections.USERS)
    
    doc_ref = disputes_ref.document(dispute_id)
    doc = doc_ref.get()
    
    if not doc or not doc.exists():
        raise HTTPException(status_code=404, detail="Dispute not found")
    
    data = doc.to_dict()
    
    # Verify dispute is pending approval
    if data.get("status") != "PendingApproval":
        raise HTTPException(status_code=400, detail="Dispute is not pending approval")
    
    current_time = datetime.utcnow()
    
    if decision.decision == "approve":
        # Approve the resolution
        update_data = {
            "status": "Resolved",
            "resolved_at": current_time.isoformat(),
            "admin_approved": True,
            "admin_id": current_user["id"],
            "admin_notes": decision.admin_notes or "",
            "updated_at": current_time
        }
        
        doc_ref.update(update_data)
        
        # Notify both parties
        notifications_ref = db.collection(Collections.NOTIFICATIONS)
        
        # Notify Plaintiff
        notifications_ref.add({
            "user_id": data.get("user_id"),
            "type": "resolution_approved",
            "title": "Resolution Approved",
            "message": f"Your dispute '{data.get('title')}' has been approved by admin. The case is now officially resolved.",
            "link": f"/dispute/{dispute_id}",
            "is_read": False,
            "created_at": current_time
        })
        
        # Notify Defendant (get defendant user_id from email)
        def_docs = users_ref.where(filter=FieldFilter("email", "==", data.get("defendant_email"))).limit(1).get()
        def_list = list(def_docs)
        
        if def_list:
            def_id = def_list[0].id
            notifications_ref.add({
                "user_id": def_id,
                "type": "resolution_approved",
                "title": "Resolution Approved",
                "message": f"The dispute '{data.get('title')}' has been approved by admin. The case is now officially resolved.",
                "link": f"/dispute/{dispute_id}",
                "is_read": False,
                "created_at": current_time
            })
        
        # Send emails to both parties
        email_service.send_resolution_approved_notification(
            plaintiff_email=data.get("creator_email"),
            defendant_email=data.get("defendant_email"),
            dispute_title=data.get("title"),
            resolution_text=data.get("resolution_text", ""),
            dispute_id=dispute_id
        )
        
        return {"status": "success", "message": "Resolution approved", "dispute_status": "Resolved"}
    
    elif decision.decision == "reject":
        # Reject the resolution - send back to InProgress
        update_data = {
            "status": "InProgress",
            "plaintiff_agreed": False,
            "defendant_agreed": False,
            "resolution_text": None,
            "admin_rejected": True,
            "admin_rejection_reason": decision.admin_notes or "Resolution rejected by admin",
            "updated_at": current_time
        }
        
        doc_ref.update(update_data)
        
        # Notify both parties
        notifications_ref = db.collection(Collections.NOTIFICATIONS)
        
        rejection_message = f"The proposed resolution for '{data.get('title')}' was rejected by admin. Reason: {decision.admin_notes or 'No reason provided'}. Please continue negotiations."
        
        # Notify Plaintiff
        notifications_ref.add({
            "user_id": data.get("user_id"),
            "type": "resolution_rejected",
            "title": "Resolution Rejected",
            "message": rejection_message,
            "link": f"/dispute/{dispute_id}",
            "is_read": False,
            "created_at": current_time
        })
        
        # Notify Defendant
        def_docs = users_ref.where(filter=FieldFilter("email", "==", data.get("defendant_email"))).limit(1).get()
        def_list = list(def_docs)
        
        if def_list:
            def_id = def_list[0].id
            notifications_ref.add({
                "user_id": def_id,
                "type": "resolution_rejected",
                "title": "Resolution Rejected",
                "message": rejection_message,
                "link": f"/dispute/{dispute_id}",
                "is_read": False,
                "created_at": current_time
            })
        
        # Send emails to both parties
        email_service.send_resolution_rejected_notification(
            plaintiff_email=data.get("creator_email"),
            defendant_email=data.get("defendant_email"),
            dispute_title=data.get("title"),
            rejection_reason=decision.admin_notes or "No reason provided",
            dispute_id=dispute_id
        )
        
        return {"status": "success", "message": "Resolution rejected, case sent back to negotiation", "dispute_status": "InProgress"}
    
    else:
        raise HTTPException(status_code=400, detail="Invalid decision. Must be 'approve' or 'reject'")

@router.get("/stats")
async def get_admin_stats(current_user: dict = Depends(auth.get_current_user_firestore)):
    """Get admin dashboard statistics"""
    # Check if user is admin
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    db = get_firestore_db()
    disputes_ref = db.collection(Collections.DISPUTES)
    users_ref = db.collection(Collections.USERS)
    
    # Get all disputes
    all_disputes = list(disputes_ref.get())
    
    # Calculate statistics
    total_disputes = len(all_disputes)
    pending_approval = sum(1 for d in all_disputes if d.to_dict().get("status") == "PendingApproval")
    resolved = sum(1 for d in all_disputes if d.to_dict().get("status") == "Resolved")
    in_progress = sum(1 for d in all_disputes if d.to_dict().get("status") == "InProgress")
    open_disputes = sum(1 for d in all_disputes if d.to_dict().get("status") == "Open")
    rejected = sum(1 for d in all_disputes if d.to_dict().get("status") == "Rejected")
    
    # Get total users
    all_users = list(users_ref.get())
    total_users = len(all_users)
    
    return {
        "total_disputes": total_disputes,
        "pending_approval": pending_approval,
        "resolved": resolved,
        "in_progress": in_progress,
        "open_disputes": open_disputes,
        "rejected": rejected,
        "total_users": total_users
    }

@router.get("/all-disputes")
async def get_all_disputes_admin(current_user: dict = Depends(auth.get_current_user_firestore)):
    """Get all disputes (admin view)"""
    # Check if user is admin
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    db = get_firestore_db()
    disputes_ref = db.collection(Collections.DISPUTES)
    
    docs = disputes_ref.get()
    
    results = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        results.append(data)
    
    # Sort by updated_at (most recent first)
    results.sort(key=lambda x: x.get("updated_at", ""), reverse=True)
    return results

@router.get("/all-users")
async def get_all_users_admin(current_user: dict = Depends(auth.get_current_user_firestore)):
    """Get all users (admin view)"""
    # Check if user is admin
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    db = get_firestore_db()
    users_ref = db.collection(Collections.USERS)
    
    docs = users_ref.get()
    
    results = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        # Remove sensitive data
        data.pop("hashed_password", None)
        results.append(data)
    
    # Sort by created_at (most recent first)
    results.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return results
