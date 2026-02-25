from fastapi import APIRouter, Depends, HTTPException, status, Body, Request
from pydantic import BaseModel, validator
from typing import Optional, List, Union, Any
from datetime import datetime
import hashlib
import json
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
    evidence_text: Optional[str] = None # OCR extracted text

class Dispute(DisputeCreate):
    id: str
    user_id: str
    creator_email: str
    status: str
    created_at: str
    updated_at: str
    plaintiff_agreed: Optional[bool] = False
    defendant_agreed: Optional[bool] = False
    plaintiff_escalated: Optional[bool] = False
    defendant_escalated: Optional[bool] = False
    resolution_text: Optional[str] = None
    ai_analysis: Optional[str] = None
    ai_suggestions: Optional[Union[List[dict], str]] = None
    # E-signature and agreement metadata
    agreement_document_version: Optional[int] = None
    agreement_document_hash: Optional[str] = None
    signatures: Optional[Any] = None  # List of signature records (dicts)
    
    @validator("ai_suggestions", pre=True)
    def parse_suggestions(cls, v):
        if isinstance(v, str):
            try:
                return ast.literal_eval(v)
            except:
                return []
        return v
    

def _compute_agreement_hash(dispute_id: str, data: dict) -> str:
    """Compute a stable hash of the agreement content for e-signing.

    The hash is based on core fields that define what is being agreed to,
    not on timestamps or transient metadata.
    """
    core = {
        "id": dispute_id or "",
        "title": data.get("title") or "",
        "description": data.get("description") or "",
        "category": data.get("category") or "",
        "resolution_text": data.get("resolution_text") or "",
    }
    canonical = json.dumps(core, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


class SigningInfoResponse(BaseModel):
    dispute_id: str
    agreement_document_version: int
    agreement_document_hash: str
    resolution_text: Optional[str] = None
    plaintiff_signed: bool
    defendant_signed: bool
    is_plaintiff: bool
    is_defendant: bool


class SignatureRequest(BaseModel):
    party_role: str  # "plaintiff" or "defendant"
    signature_type: str  # "TYPED" or "DRAWN"
    typed_name: Optional[str] = None
    signature_image_data: Optional[str] = None  # base64 PNG if DRAWN
    document_version: int
    document_hash: str
    resolution_text: Optional[str] = None

class AgreeRequest(BaseModel):
    resolution_text: Optional[str] = None


@router.get("/{dispute_id}/signing-info", response_model=SigningInfoResponse)
async def get_signing_info(
    dispute_id: str,
    current_user: dict = Depends(auth.get_current_user_firestore)
):
    """Return the current agreement hash/version and signing status for each party."""
    db = get_firestore_db()
    disputes_ref = db.collection(Collections.DISPUTES)

    doc_ref = disputes_ref.document(dispute_id)
    doc = doc_ref.get()

    if not doc or not doc.exists():
        raise HTTPException(status_code=404, detail="Dispute not found")

    data = doc.to_dict()

    # Authorization check
    if data.get("user_id") != current_user["id"] and data.get("defendant_email") != current_user["email"]:
        raise HTTPException(status_code=403, detail="Not a party to this dispute")

    is_plaintiff = data.get("user_id") == current_user["id"]
    is_defendant = data.get("defendant_email") == current_user["email"]

    existing_hash = data.get("agreement_document_hash")
    existing_version = data.get("agreement_document_version")

    # If no hash/version yet, initialize based on current content
    if not existing_hash or not existing_version:
        computed_hash = _compute_agreement_hash(dispute_id, data)
        existing_hash = computed_hash
        existing_version = 1
        doc_ref.update({
            "agreement_document_hash": existing_hash,
            "agreement_document_version": existing_version,
        })

    signatures = data.get("signatures") or []
    plaintiff_signed = any(s.get("party_role") == "plaintiff" for s in signatures)
    defendant_signed = any(s.get("party_role") == "defendant" for s in signatures)

    return SigningInfoResponse(
        dispute_id=dispute_id,
        agreement_document_version=int(existing_version),
        agreement_document_hash=str(existing_hash),
        resolution_text=data.get("resolution_text"),
        plaintiff_signed=plaintiff_signed,
        defendant_signed=defendant_signed,
        is_plaintiff=is_plaintiff,
        is_defendant=is_defendant,
    )


@router.post("/{dispute_id}/sign")
async def sign_agreement(
    dispute_id: str,
    signature: SignatureRequest = Body(...),
    request: Request = None,
    current_user: dict = Depends(auth.get_current_user_firestore),
):
    """Create an e-signature for the current version of the agreement.

    This endpoint replaces simple flag-based agreement and records a
    detailed signature entry tied to a specific document hash/version.
    """
    db = get_firestore_db()
    disputes_ref = db.collection(Collections.DISPUTES)

    doc_ref = disputes_ref.document(dispute_id)
    doc = doc_ref.get()

    if not doc or not doc.exists():
        raise HTTPException(status_code=404, detail="Dispute not found")

    data = doc.to_dict()

    is_plaintiff = data.get("user_id") == current_user["id"]
    is_defendant = data.get("defendant_email") == current_user["email"]

    if not is_plaintiff and not is_defendant:
        raise HTTPException(status_code=403, detail="Not a party to this dispute")

    # Ensure party_role matches authenticated user
    if signature.party_role == "plaintiff" and not is_plaintiff:
        raise HTTPException(status_code=403, detail="Only the plaintiff can sign as plaintiff")
    if signature.party_role == "defendant" and not is_defendant:
        raise HTTPException(status_code=403, detail="Only the defendant can sign as defendant")

    # Ensure there is a resolution text to sign
    if signature.resolution_text:
        data["resolution_text"] = signature.resolution_text
    if not data.get("resolution_text"):
        raise HTTPException(status_code=400, detail="No resolution text available to sign")

    # Compute current hash and compare with client-provided one
    current_hash = _compute_agreement_hash(dispute_id, data)
    stored_hash = data.get("agreement_document_hash")
    stored_version = data.get("agreement_document_version")

    # Initialize hash/version if missing
    if not stored_hash or not stored_version:
        stored_hash = current_hash
        stored_version = 1

    # If content changed since last hash, bump version
    if stored_hash != current_hash:
        stored_version = int(stored_version) + 1
        stored_hash = current_hash

    # Persist any hash/version updates before validation
    doc_ref.update({
        "agreement_document_hash": stored_hash,
        "agreement_document_version": stored_version,
        "resolution_text": data.get("resolution_text"),
    })

    # Now enforce that client signed the same version/hash
    if signature.document_hash != stored_hash or signature.document_version != int(stored_version):
        raise HTTPException(
            status_code=409,
            detail="Agreement version has changed. Please refresh before signing.",
        )

    # Basic validation on signature type
    sig_type = signature.signature_type.upper()
    if sig_type not in {"TYPED", "DRAWN"}:
        raise HTTPException(status_code=400, detail="Invalid signature type")
    if sig_type == "TYPED" and not signature.typed_name:
        raise HTTPException(status_code=400, detail="Typed name is required for typed signatures")
    if sig_type == "DRAWN" and not signature.signature_image_data:
        raise HTTPException(status_code=400, detail="Signature image data is required for drawn signatures")

    signatures = data.get("signatures") or []

    # Prevent duplicate signing for the same party and version
    for s in signatures:
        if s.get("party_role") == signature.party_role and s.get("version") == int(stored_version):
            raise HTTPException(status_code=400, detail="This party has already signed this version of the agreement")

    client_ip = None
    user_agent = None
    if request is not None and request.client:
        client_ip = request.client.host
        user_agent = request.headers.get("user-agent")

    sig_record = {
        "party_role": signature.party_role,
        "user_id": current_user["id"],
        "email": current_user["email"],
        "signed_at": datetime.utcnow().isoformat(),
        "signature_type": sig_type,
        "typed_name": signature.typed_name,
        "signature_image_data": signature.signature_image_data,
        "document_hash": stored_hash,
        "version": int(stored_version),
        "ip_address": client_ip,
        "user_agent": user_agent,
    }

    signatures.append(sig_record)

    update_data = {
        "signatures": signatures,
        "updated_at": datetime.utcnow(),
    }

    # Maintain legacy flags for compatibility
    if signature.party_role == "plaintiff":
        update_data["plaintiff_agreed"] = True
        update_data["plaintiff_escalated"] = False
    elif signature.party_role == "defendant":
        update_data["defendant_agreed"] = True
        update_data["defendant_escalated"] = False

    doc_ref.update(update_data)

    # Notify the other party similarly to the previous agree endpoint
    notifications_ref = db.collection(Collections.NOTIFICATIONS)
    users_ref = db.collection(Collections.USERS)

    if signature.party_role == "plaintiff" and not data.get("defendant_agreed", False):
        def_email = data.get("defendant_email")
        if def_email:
            email_service.send_plaintiff_selected_option_notification(
                to_email=def_email,
                dispute_title=data.get("title"),
                plaintiff_email=current_user["email"],
                selected_option=data.get("resolution_text"),
                dispute_id=dispute_id,
            )

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
                    "created_at": datetime.utcnow(),
                })

    if signature.party_role == "defendant" and not data.get("plaintiff_agreed", False):
        plaintiff_id = data.get("user_id")
        if plaintiff_id:
            notifications_ref.add({
                "user_id": plaintiff_id,
                "type": "proposal_received",
                "title": "New Resolution Proposal",
                "message": f"The defendant has proposed/accepted a resolution for '{data.get('title')}'. Please review.",
                "link": f"/dispute/{dispute_id}",
                "is_read": False,
                "created_at": datetime.utcnow(),
            })

    # Determine final agreement status based on legacy flags and signatures
    updated_doc = doc_ref.get().to_dict()
    p_agreed = updated_doc.get("plaintiff_agreed", False)
    d_agreed = updated_doc.get("defendant_agreed", False)

    if p_agreed and d_agreed:
        final_update = {
            "status": "PendingApproval",
            "pending_approval_since": datetime.utcnow().isoformat(),
        }
        doc_ref.update(final_update)

        users_ref = db.collection(Collections.USERS)
        admin_docs = users_ref.where(filter=FieldFilter("role", "==", "admin")).get()

        for admin_doc in admin_docs:
            notifications_ref.add({
                "user_id": admin_doc.id,
                "type": "pending_approval",
                "title": "New Resolution Pending Approval",
                "message": f"Both parties have signed a resolution for '{data.get('title')}'. Please review and approve.",
                "link": f"/admin/approvals/{dispute_id}",
                "is_read": False,
                "created_at": datetime.utcnow(),
            })

        return {"status": "success", "message": "Signature recorded. Pending admin approval."}

    return {"status": "success", "message": "Signature recorded"}

class EscalateRequest(BaseModel):
    reason: Optional[str] = None

@router.post("/{dispute_id}/escalate")
async def escalate_dispute(
    dispute_id: str, 
    request: EscalateRequest = Body(default=None),
    current_user: dict = Depends(auth.get_current_user_firestore)
):
    """
    Party requests to escalate the dispute (rejecting available options).
    If both parties escalate, status becomes 'Escalated'.
    """
    db = get_firestore_db()
    disputes_ref = db.collection(Collections.DISPUTES)
    
    doc_ref = disputes_ref.document(dispute_id)
    doc = doc_ref.get()
    
    if not doc or not doc.exists():
        raise HTTPException(status_code=404, detail="Dispute not found")
        
    data = doc.to_dict()
    
    # Determine role
    is_plaintiff = data.get("user_id") == current_user["id"]
    is_defendant = data.get("defendant_email") == current_user["email"]
    
    if not is_plaintiff and not is_defendant:
        raise HTTPException(status_code=403, detail="Not a party to this dispute")
        
    update_data = {
        "updated_at": datetime.utcnow()
    }
    
    if is_plaintiff:
        update_data["plaintiff_escalated"] = True
    elif is_defendant:
        update_data["defendant_escalated"] = True
        
    doc_ref.update(update_data)
    
    # Check if both escalated
    p_esc = update_data.get("plaintiff_escalated", data.get("plaintiff_escalated", False))
    d_esc = update_data.get("defendant_escalated", data.get("defendant_escalated", False))
    
    notifications_ref = db.collection(Collections.NOTIFICATIONS)
    
    if p_esc and d_esc:
        # Both escalated -> Change Status to Escalated
        final_update = {
            "status": "Escalated",
            "escalated_at": datetime.utcnow().isoformat()
        }
        doc_ref.update(final_update)
        
        # Notify Admin
        users_ref = db.collection(Collections.USERS)
        admin_docs = users_ref.where(filter=FieldFilter("role", "==", "admin")).get()
        
        for admin_doc in admin_docs:
            notifications_ref.add({
                "user_id": admin_doc.id,
                "type": "dispute_escalated",
                "title": "Dispute Escalated",
                "message": f"Both parties have rejected options for '{data.get('title')}'. Case escalated for manual review.",
                "link": f"/admin/disputes/{dispute_id}",
                "is_read": False,
                "created_at": datetime.utcnow()
            })
            
        return {"status": "success", "message": "Dispute escalated to admin review."}
        
    else:
        # Notify other party
        users_ref = db.collection(Collections.USERS)
        
        if is_plaintiff:
            # Notify Defendant
            def_email = data.get("defendant_email")
            if def_email:
                def_docs = users_ref.where(filter=FieldFilter("email", "==", def_email)).limit(1).get()
                def_list = list(def_docs)
                if def_list:
                    def_id = def_list[0].id
                    notifications_ref.add({
                        "user_id": def_id,
                        "type": "escalation_request",
                        "title": "Escalation Request",
                        "message": f"The plaintiff has rejected the generated options and requested escalation for '{data.get('title')}'.",
                        "link": f"/dispute/{dispute_id}",
                        "is_read": False,
                        "created_at": datetime.utcnow()
                    })
        elif is_defendant:
             # Notify Plaintiff
            plaintiff_id = data.get("user_id")
            if plaintiff_id:
                notifications_ref.add({
                    "user_id": plaintiff_id,
                    "type": "escalation_request",
                    "title": "Escalation Request",
                    "message": f"The defendant has rejected the generated options and requested escalation for '{data.get('title')}'.",
                    "link": f"/dispute/{dispute_id}",
                    "is_read": False,
                    "created_at": datetime.utcnow()
                })
        
        return {"status": "success", "message": "Escalation request recorded. Waiting for other party."}

class DropRequest(BaseModel):
    reason: Optional[str] = None

@router.post("/{dispute_id}/drop")
async def drop_dispute(
    dispute_id: str, 
    request: DropRequest = Body(default=None),
    current_user: dict = Depends(auth.get_current_user_firestore)
):
    """
    Party drops/withdraws from the dispute.
    Status becomes 'Dropped'.
    """
    db = get_firestore_db()
    disputes_ref = db.collection(Collections.DISPUTES)
    
    doc_ref = disputes_ref.document(dispute_id)
    doc = doc_ref.get()
    
    if not doc or not doc.exists():
        raise HTTPException(status_code=404, detail="Dispute not found")
        
    data = doc.to_dict()
    
    # Determine role
    is_plaintiff = data.get("user_id") == current_user["id"]
    is_defendant = data.get("defendant_email") == current_user["email"]
    
    if not is_plaintiff and not is_defendant:
        raise HTTPException(status_code=403, detail="Not a party to this dispute")
        
    update_data = {
        "status": "Dropped",
        "dropped_by": current_user["email"],
        "drop_reason": request.reason if request else None,
        "dropped_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow()
    }
    
    doc_ref.update(update_data)
    
    # Notify other party and Admin
    notifications_ref = db.collection(Collections.NOTIFICATIONS)
    users_ref = db.collection(Collections.USERS)
    
    # Notify Admin
    admin_docs = users_ref.where(filter=FieldFilter("role", "==", "admin")).get()
    for admin_doc in admin_docs:
        notifications_ref.add({
            "user_id": admin_doc.id,
            "type": "dispute_dropped",
            "title": "Dispute Dropped",
            "message": f"The dispute '{data.get('title')}' has been dropped by {current_user['email']}.",
            "link": f"/admin/disputes/{dispute_id}", # Or just view details
            "is_read": False,
            "created_at": datetime.utcnow()
        })
        
    # Notify Other Party
    other_party_email = None
    if is_plaintiff:
        other_party_email = data.get("defendant_email")
    elif is_defendant:
         # Need plaintiff email
         p_doc = users_ref.document(data.get("user_id")).get()
         if p_doc.exists:
             other_party_email = p_doc.to_dict().get("email")
             
    if other_party_email:
        # Find user id for in-app notification
        op_docs = users_ref.where(filter=FieldFilter("email", "==", other_party_email)).limit(1).get()
        if list(op_docs):
            op_id = list(op_docs)[0].id
            notifications_ref.add({
                "user_id": op_id,
                "type": "dispute_dropped",
                "title": "Dispute Dropped",
                "message": f"The other party has dropped/withdrawn from the dispute '{data.get('title')}'.",
                "link": f"/dispute/{dispute_id}",
                "is_read": False,
                "created_at": datetime.utcnow()
            })
            
        # Send Email
        email_service.send_dispute_dropped_notification(
            to_email=other_party_email,
            dispute_title=data.get("title"),
            dropped_by=current_user["email"],
            dispute_id=dispute_id
        )

    return {"status": "success", "message": "Dispute dropped successfully."}

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

