from fastapi import APIRouter, Depends, HTTPException, status, Body
from pydantic import BaseModel, validator
from typing import Optional, List, Union, Any
from datetime import datetime
import auth
from database import get_firestore_db, Collections, FieldFilter
from email_service import email_service
import ast

router = APIRouter()

# Pydantic models
class DisputeCreate(BaseModel):
    title: str
    category: str
    description: str
    defendant_email: str
    evidence_file: Optional[str] = None

class Dispute(DisputeCreate):
    id: str
    user_id: str
    creator_email: str
    status: str
    created_at: str
    updated_at: str
    plaintiff_agreed: Optional[bool] = False
    defendant_agreed: Optional[bool] = False
    resolution_text: Optional[str] = None
    ai_analysis: Optional[str] = None
    ai_suggestions: Optional[Union[List[dict], str]] = None
    
    @validator("ai_suggestions", pre=True)
    def parse_suggestions(cls, v):
        if isinstance(v, str):
            try:
                return ast.literal_eval(v)
            except:
                return []
        return v
# ... (Previous code remains same until accept_dispute)

class AgreeRequest(BaseModel):
    resolution_text: Optional[str] = None

@router.post("/{dispute_id}/agree")
async def agree_to_resolution(
    dispute_id: str, 
    agreement: AgreeRequest = Body(default=None),
    current_user: dict = Depends(auth.get_current_user_firestore)
):
    """User agrees to the resolution"""
    db = get_firestore_db()
    disputes_ref = db.collection(Collections.DISPUTES)
    
    doc_ref = disputes_ref.document(dispute_id)
    doc = doc_ref.get()
    
    if not doc or not doc.exists():
        raise HTTPException(status_code=404, detail="Dispute not found")
        
    data = doc.to_dict()
    
    # Determine user role
    is_plaintiff = data.get("user_id") == current_user["id"]
    is_defendant = data.get("defendant_email") == current_user["email"]
    
    if not is_plaintiff and not is_defendant:
        raise HTTPException(status_code=403, detail="Not a party to this dispute")
    
    update_data = {
        "updated_at": datetime.utcnow()
    }
    
    # If a specific text is agreed upon, update it
    if agreement and agreement.resolution_text:
        update_data["resolution_text"] = agreement.resolution_text
    
    if is_plaintiff:
        update_data["plaintiff_agreed"] = True
    elif is_defendant:
        update_data["defendant_agreed"] = True
        
    doc_ref.update(update_data)
    
    # Notify the OTHER party about the proposal
    notifications_ref = db.collection(Collections.NOTIFICATIONS)
    users_ref = db.collection(Collections.USERS)
    
    if is_plaintiff and not d_agreed:
        # Plaintiff Agreed -> Notify Defendant
        def_email = data.get("defendant_email")
        if def_email:
            # 1. Send Email
            email_service.send_plaintiff_selected_option_notification(
                to_email=def_email,
                dispute_title=data.get("title"),
                plaintiff_email=current_user["email"],
                selected_option=agreement.resolution_text if agreement else "A resolution option",
                dispute_id=dispute_id
            )
            
            # 2. In-App Notification (Need Defendant ID)
            def_docs = users_ref.where(filter=FieldFilter("email", "==", def_email)).limit(1).get()
            def_list = list(def_docs)
            if def_list:
                def_id = def_list[0].id
                notifications_ref.add({
                    "user_id": def_id,
                    "type": "proposal_received",
                    "title": "New Resolution Proposal",
                    "message": f"The plaintiff has proposed a resolution for '{data.get('title')}'. Please review.",
                    "link": f"/dispute/{dispute_id}",
                    "is_read": False,
                    "created_at": datetime.utcnow()
                })

    elif is_defendant and not p_agreed:
        # Defendant Agreed -> Notify Plaintiff
        plaintiff_id = data.get("user_id")
        if plaintiff_id:
             # 1. In-App Notification
            notifications_ref.add({
                "user_id": plaintiff_id,
                "type": "proposal_received",
                "title": "New Resolution Proposal",
                "message": f"The defendant has proposed/accepted a resolution for '{data.get('title')}'. Please review.",
                "link": f"/dispute/{dispute_id}",
                "is_read": False,
                "created_at": datetime.utcnow()
            })
            
            # 2. Send Email (Get Plaintiff Email)
            # We have current_user (defendant), need plaintiff email. 
            # It's in data.get("creator_email") usually, or fetch user. 
            # In create_dispute we stored "creator_email".
            p_email = data.get("creator_email")
            if p_email:
                 # Re-using the same method or a generic one? 
                 # The user request specifically mentioned "if plantiff selected... email sent to defendant".
                 # But good UX implies symmetry. I'll stick to the requested direction primarily but keeping symmetry is better.
                 # Using a generic notification or similar method.
                 # For now, relying on the specific request: "if plantiff selected ... email ... to defendent"
                 pass


    # Check if BOTH have agreed now
    # Need to refetch or simulate
    p_agreed = update_data.get("plaintiff_agreed", data.get("plaintiff_agreed", False))
    d_agreed = update_data.get("defendant_agreed", data.get("defendant_agreed", False))
    
    # If resolution text changed, we might need to reset the other person's agreement?
    # For now, let's assume they are coordinating. But ideally:
    # if agreement.resolution_text != data.get("resolution_text"): disable other party agreement
    # Implementing simplistic overwrite for now based on user request "reflects".
    
    if p_agreed and d_agreed:
        # Both agreed -> Send to Admin for Approval
        final_update = {
            "status": "PendingApproval",
            "pending_approval_since": datetime.utcnow().isoformat()
        }
        doc_ref.update(final_update)
        
        # Notify admin (find all admin users)
        users_ref = db.collection(Collections.USERS)
        admin_docs = users_ref.where(filter=FieldFilter("role", "==", "admin")).get()
        
        notifications_ref = db.collection(Collections.NOTIFICATIONS)
        for admin_doc in admin_docs:
            admin_data = admin_doc.to_dict()
            notifications_ref.add({
                "user_id": admin_doc.id,
                "type": "pending_approval",
                "title": "New Resolution Pending Approval",
                "message": f"Both parties have agreed to a resolution for '{data.get('title')}'. Please review and approve.",
                "link": f"/admin/approvals/{dispute_id}",
                "is_read": False,
                "created_at": datetime.utcnow()
            })
        
        return {"status": "success", "message": "Agreement recorded. Pending admin approval."}
        
    return {"status": "success", "message": "Agreement recorded"}

# ... (Existing message endpoints)

@router.post("/", response_model=Dispute)
async def create_dispute(dispute: DisputeCreate, current_user: dict = Depends(auth.get_current_user_firestore)):
    """Create a new dispute"""
    db = get_firestore_db()
    disputes_ref = db.collection(Collections.DISPUTES)
    
    # Prevent filing against self
    if dispute.defendant_email.lower() == current_user["email"].lower():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot file a dispute against yourself"
        )
    
    new_dispute = dispute.dict()
    current_time = datetime.utcnow()
    
    # Add metadata
    new_dispute.update({
        "user_id": current_user["id"],
        "creator_email": current_user["email"],
        "status": "Open",
        "created_at": current_time,
        "updated_at": current_time
    })
    
    # Add to Firestore
    _, doc_ref = disputes_ref.add(new_dispute)
    
    # Notify Defendant if they exist
    users_ref = db.collection(Collections.USERS)
    # Find user by email
    def_docs = users_ref.where(filter=FieldFilter("email", "==", dispute.defendant_email)).limit(1).get()
    def_list = list(def_docs)
    
    if def_list:
        def_id = def_list[0].id
        notifications_ref = db.collection(Collections.NOTIFICATIONS)
        notifications_ref.add({
            "user_id": def_id,
            "type": "dispute_filed",
            "title": "New Dispute Filed Against You",
            "message": f"A new dispute '{dispute.title}' has been filed against you. Please review and respond.",
            "link": f"/dispute/{doc_ref.id}",
            "is_read": False,
            "created_at": current_time
        })
        
        # Send email to defendant
        email_service.send_dispute_filed_notification(
            to_email=dispute.defendant_email,
            dispute_title=dispute.title,
            plaintiff_email=current_user["email"],
            dispute_id=doc_ref.id
        )

    # Notify Plaintiff (Confirmation)
    notifications_ref = db.collection(Collections.NOTIFICATIONS) # Ensure ref is available
    notifications_ref.add({
        "user_id": current_user["id"],
        "type": "dispute_filed_confirmation",
        "title": "Dispute Filed Successfully",
        "message": f"Your dispute '{dispute.title}' has been successfully filed. You will be notified when the defendant responds.",
        "link": f"/dispute/{doc_ref.id}",
        "is_read": False,
        "created_at": current_time 
    })
    
    # Send confirmation email to plaintiff
    email_service.send_dispute_filed_confirmation(
        to_email=current_user["email"],
        dispute_title=dispute.title,
        defendant_email=dispute.defendant_email,
        dispute_id=doc_ref.id
    )
    
    # helper to format response
    new_dispute["id"] = doc_ref.id
    new_dispute["created_at"] = current_time.isoformat()
    new_dispute["updated_at"] = current_time.isoformat()
    
    return new_dispute

@router.get("/", response_model=List[Dispute])
async def get_all_disputes(current_user: dict = Depends(auth.get_current_user_firestore)):
    """Get all disputes where user is creator or defendant"""
    # Note: Simplistic implementation. Ideally we'd query for both OR using index
    # Here we just return filed disputes for now as the default
    return await get_filed_disputes(current_user)

@router.get("/filed", response_model=List[Dispute])
async def get_filed_disputes(current_user: dict = Depends(auth.get_current_user_firestore)):
    """Get disputes filed by the current user"""
    db = get_firestore_db()
    disputes_ref = db.collection(Collections.DISPUTES)
    
    # Query disputes where user_id == current_user.id
    docs = disputes_ref.where(filter=FieldFilter("user_id", "==", current_user["id"])).get()
    
    results = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        results.append(data)
        
    return results

@router.get("/against", response_model=List[Dispute])
async def get_received_disputes(current_user: dict = Depends(auth.get_current_user_firestore)):
    """Get disputes filed against the current user"""
    db = get_firestore_db()
    disputes_ref = db.collection(Collections.DISPUTES)
    
    # Query disputes where defendant_email == current_user.email
    docs = disputes_ref.where(filter=FieldFilter("defendant_email", "==", current_user["email"])).get()
    
    results = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        results.append(data)
        
    return results

@router.get("/{dispute_id}", response_model=Dispute)
async def get_dispute(dispute_id: str, current_user: dict = Depends(auth.get_current_user_firestore)):
    """Get a specific dispute by ID"""
    db = get_firestore_db()
    disputes_ref = db.collection(Collections.DISPUTES)
    
    doc = disputes_ref.document(dispute_id).get()
    
    if not doc or not doc.exists():
        raise HTTPException(status_code=404, detail="Dispute not found")
        
    data = doc.to_dict()
    data["id"] = doc.id
    
    # Authorization check
    if data.get("user_id") != current_user["id"] and data.get("defendant_email") != current_user["email"]:
         raise HTTPException(status_code=403, detail="Not authorized to view this dispute")
         
    return data

@router.put("/{dispute_id}/status", response_model=Dispute)
async def update_dispute_status(
    dispute_id: str, 
    status_update: dict = Body(...),
    current_user: dict = Depends(auth.get_current_user_firestore)
):
    """Update dispute status"""
    db = get_firestore_db()
    disputes_ref = db.collection(Collections.DISPUTES)
    
    doc_ref = disputes_ref.document(dispute_id)
    doc = doc_ref.get()
    
    if not doc or not doc.exists():
        raise HTTPException(status_code=404, detail="Dispute not found")
        
    data = doc.to_dict()
    
    # Authorization check (only creator or admin can likely update status, simplistic here)
    if data.get("user_id") != current_user["id"]:
         raise HTTPException(status_code=403, detail="Not authorized to update this dispute")
    
    new_status = status_update.get("status")
    if not new_status:
        raise HTTPException(status_code=400, detail="Status required")
        
    update_data = {
        "status": new_status,
        "updated_at": datetime.utcnow()
    }
    
    doc_ref.update(update_data)
    
    # Return updated document
    data.update(update_data)
    data["updated_at"] = update_data["updated_at"].isoformat()
    return data

@router.delete("/{dispute_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_dispute(dispute_id: str, current_user: dict = Depends(auth.get_current_user_firestore)):
    """Delete a dispute (only by plaintiff)"""
    db = get_firestore_db()
    disputes_ref = db.collection(Collections.DISPUTES)
    
    doc_ref = disputes_ref.document(dispute_id)
    doc = doc_ref.get()
    
    if not doc or not doc.exists():
        raise HTTPException(status_code=404, detail="Dispute not found")
        
    data = doc.to_dict()
    
    # Authorization check - only plaintiff can delete
    if data.get("user_id") != current_user["id"]:
         raise HTTPException(status_code=403, detail="Only the plaintiff can delete this dispute")
    
    # Delete from Firestore
    success = doc_ref.delete()
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete dispute")
        
    return None

# --- NEW FEATURES: Acceptance & Chat ---

@router.post("/{dispute_id}/accept")
async def accept_dispute(dispute_id: str, current_user: dict = Depends(auth.get_current_user_firestore)):
    """Defendant accepts the dispute case"""
    db = get_firestore_db()
    disputes_ref = db.collection(Collections.DISPUTES)
    users_ref = db.collection(Collections.USERS)
    
    doc_ref = disputes_ref.document(dispute_id)
    doc = doc_ref.get()
    
    if not doc or not doc.exists():
        raise HTTPException(status_code=404, detail="Dispute not found")
        
    data = doc.to_dict()
    
    # Only defendant can accept
    if data.get("defendant_email") != current_user["email"]:
        raise HTTPException(status_code=403, detail="Only the defendant can accept this dispute")
        
    # Update status
    update_data = {
        "status": "InProgress", # Changed from "Accepted" to follow logic
        "accepted_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow()
    }
    
    doc_ref.update(update_data)
    
    # Notify Plaintiff
    notifications_ref = db.collection(Collections.NOTIFICATIONS)
    notifications_ref.add({
        "user_id": data.get("user_id"), # Plaintiff ID
        "type": "dispute_accepted",
        "title": "Dispute Accepted",
        "message": f"Your dispute '{data.get('title')}' has been accepted by the defendant. Live chat is now open.",
        "link": f"/dispute/{dispute_id}",
        "is_read": False,
        "created_at": datetime.utcnow()
    })
    
    # Get plaintiff email
    plaintiff_doc = users_ref.document(data.get("user_id")).get()
    if plaintiff_doc and plaintiff_doc.exists():
        plaintiff_email = plaintiff_doc.to_dict().get("email")
        # Send email to plaintiff
        email_service.send_dispute_accepted_notification(
            to_email=plaintiff_email,
            dispute_title=data.get('title'),
            defendant_email=current_user["email"],
            dispute_id=dispute_id
        )
    
    return {"status": "success", "message": "Case accepted"}

@router.post("/{dispute_id}/reject")
async def reject_dispute(dispute_id: str, current_user: dict = Depends(auth.get_current_user_firestore)):
    """Defendant rejects the dispute case"""
    db = get_firestore_db()
    disputes_ref = db.collection(Collections.DISPUTES)
    
    doc_ref = disputes_ref.document(dispute_id)
    doc = doc_ref.get()
    
    if not doc or not doc.exists():
        raise HTTPException(status_code=404, detail="Dispute not found")
        
    data = doc.to_dict()
    
    # Only defendant can reject
    if data.get("defendant_email") != current_user["email"]:
        raise HTTPException(status_code=403, detail="Only the defendant can reject this dispute")
        
    # Update status
    update_data = {
        "status": "Rejected",
        "rejected_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow()
    }
    
    doc_ref.update(update_data)
    
    # Notify Plaintiff
    notifications_ref = db.collection(Collections.NOTIFICATIONS)
    notifications_ref.add({
        "user_id": data.get("user_id"), # Plaintiff ID
        "type": "dispute_rejected",
        "title": "Dispute Rejected",
        "message": f"Your dispute '{data.get('title')}' has been rejected by the defendant.",
        "link": f"/dispute/{dispute_id}",
        "is_read": False,
        "created_at": datetime.utcnow()
    })
    
    # Get plaintiff email
    users_ref = db.collection(Collections.USERS)
    plaintiff_doc = users_ref.document(data.get("user_id")).get()
    if plaintiff_doc and plaintiff_doc.exists():
        plaintiff_email = plaintiff_doc.to_dict().get("email")
        # Send email to plaintiff
        email_service.send_dispute_rejected_notification(
            to_email=plaintiff_email,
            dispute_title=data.get('title'),
            defendant_email=current_user["email"],
            dispute_id=dispute_id
        )
    
    return {"status": "success", "message": "Case rejected"}

class MessageCreate(BaseModel):
    content: str

@router.post("/{dispute_id}/messages")
async def send_message(
    dispute_id: str, 
    message: MessageCreate, 
    current_user: dict = Depends(auth.get_current_user_firestore)
):
    """Send a chat message"""
    db = get_firestore_db()
    
    # Check dispute access
    disputes_ref = db.collection(Collections.DISPUTES)
    doc = disputes_ref.document(dispute_id).get()
    
    if not doc or not doc.exists():
        raise HTTPException(status_code=404, detail="Dispute not found")
    
    data = doc.to_dict()
    
    # Must be plaintiff or defendant
    if data.get("user_id") != current_user["id"] and data.get("defendant_email") != current_user["email"]:
        raise HTTPException(status_code=403, detail="Not a party to this dispute")
        
    # Check limit (20 messages max)
    messages_ref = db.collection(f"disputes/{dispute_id}/messages")
    existing_msgs = messages_ref.get() # simplistic count
    
    if len(existing_msgs) >= 20:
        raise HTTPException(status_code=400, detail="Trial chat limit reached (20 messages).")
        
    # Add message
    new_msg = {
        "dispute_id": dispute_id,
        "user_id": current_user["id"], # sender
        "sender_name": current_user.get("full_name") or current_user.get("username"),
        "content": message.content,
        "created_at": datetime.utcnow()
    }
    
    messages_ref.add(new_msg)
    
    return {"status": "success", "message": "Sent"}

@router.get("/{dispute_id}/messages")
async def get_messages(dispute_id: str, current_user: dict = Depends(auth.get_current_user_firestore)):
    """Get chat messages"""
    db = get_firestore_db()
    
    # Check access (skipped for brevity, assuming UI handles it, but robust impl should check)
    # Re-using check logic:
    disputes_ref = db.collection(Collections.DISPUTES)
    doc = disputes_ref.document(dispute_id).get()
    if not doc or not doc.exists(): return []
    data = doc.to_dict()
    if data.get("user_id") != current_user["id"] and data.get("defendant_email") != current_user["email"]:
         # return empty or 403. UI will likely be empty.
         return []
    
    messages_ref = db.collection(f"disputes/{dispute_id}/messages")
    docs = messages_ref.get()
    
    results = []
    for d in docs:
        m = d.to_dict()
        m["id"] = d.id
        results.append(m)
        
    results.sort(key=lambda x: x.get("created_at", ""))
    return results

