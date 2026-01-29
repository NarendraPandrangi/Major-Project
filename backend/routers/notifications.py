from fastapi import APIRouter, Depends, HTTPException
from typing import List
import auth
from database import get_firestore_db, Collections, FieldFilter

router = APIRouter()

@router.get("/")
async def get_notifications(current_user: dict = Depends(auth.get_current_user_firestore)):
    """Get all notifications for current user"""
    db = get_firestore_db()
    notifications_ref = db.collection(Collections.NOTIFICATIONS)
    
    docs = notifications_ref.where(filter=FieldFilter("user_id", "==", current_user["id"])).get()
    
    results = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id
        results.append(data)
        
    # Sort by created_at desc
    results.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return results

@router.get("/unread")
async def get_unread_notifications(current_user: dict = Depends(auth.get_current_user_firestore)):
    """Get unread notifications count"""
    notifications = await get_notifications(current_user)
    return [n for n in notifications if not n.get("is_read", False)]

@router.put("/{notification_id}/read")
async def mark_as_read(notification_id: str, current_user: dict = Depends(auth.get_current_user_firestore)):
    """Mark notification as read"""
    db = get_firestore_db()
    notif_ref = db.collection(Collections.NOTIFICATIONS).document(notification_id)
    
    doc = notif_ref.get()
    if not doc or not doc.exists():
        raise HTTPException(status_code=404, detail="Notification not found")
        
    if doc.to_dict().get("user_id") != current_user["id"]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    notif_ref.update({"is_read": True})
    return {"status": "success"}
