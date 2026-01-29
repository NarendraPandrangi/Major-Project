from fastapi import APIRouter, Depends
import auth
from database import get_firestore_db, Collections, FieldFilter

router = APIRouter()

@router.get("/stats")
async def get_dashboard_stats(current_user: dict = Depends(auth.get_current_user_firestore)):
    db = get_firestore_db()
    disputes_ref = db.collection(Collections.DISPUTES)
    
    # Get disputes filed BY the user
    filed_docs = disputes_ref.where(filter=FieldFilter("user_id", "==", current_user["id"])).get()
    
    # Get disputes filed AGAINST the user
    against_docs = disputes_ref.where(filter=FieldFilter("defendant_email", "==", current_user["email"])).get()
    
    # Combine and process
    all_disputes = []
    unique_ids = set()
    
    # Helper to process docs
    # Note: we use unique_ids to prevent duplicates if user is both (unlikely but possible in testing)
    
    for doc in filed_docs:
        if doc.id not in unique_ids:
            data = doc.to_dict()
            data["id"] = doc.id
            data["role"] = "plaintiff"
            all_disputes.append(data)
            unique_ids.add(doc.id)
        
    for doc in against_docs:
        if doc.id not in unique_ids:
            data = doc.to_dict()
            data["id"] = doc.id
            data["role"] = "defendant"
            all_disputes.append(data)
            unique_ids.add(doc.id)
            
    stats = {
        "total_disputes": len(all_disputes),
        "pending_disputes": 0,
        "resolved_disputes": 0,
        "disputes_filed": len(filed_docs),
        "disputes_against": len(against_docs),
        "recent_disputes": []
    }
    
    for d in all_disputes:
        status = d.get("status", "Open")
        if status == "Resolved":
            stats["resolved_disputes"] += 1
        else:
            stats["pending_disputes"] += 1
            
    # Sort by created_at desc (ISO format strings sort correctly)
    all_disputes.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    
    stats["recent_disputes"] = all_disputes[:5]
    
    return stats
