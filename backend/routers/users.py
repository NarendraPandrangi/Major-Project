from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from pydantic import BaseModel, EmailStr
from typing import Optional

import auth

router = APIRouter()

# Pydantic models
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class GoogleAuthRequest(BaseModel):
    token: str

class User(BaseModel):
    id: str
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    profile_picture: Optional[str] = None
    auth_provider: str = "local"

class UserResponse(BaseModel):
    user: User
    access_token: str
    token_type: str = "bearer"

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """Register a new user with email and password"""
    from database import get_firestore_db, Collections, FieldFilter
    from email_service import email_service
    
    db = get_firestore_db()
    
    # Check if email already exists
    users_ref = db.collection(Collections.USERS)
    existing_email = users_ref.where(filter=FieldFilter("email", "==", user_data.email)).limit(1).get()
    
    if len(list(existing_email)) > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if username already exists
    existing_username = users_ref.where(filter=FieldFilter("username", "==", user_data.username)).limit(1).get()
    
    if len(list(existing_username)) > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create new user
    hashed_password = auth.get_password_hash(user_data.password)
    
    user_doc = {
        "email": user_data.email,
        "username": user_data.username,
        "full_name": user_data.full_name,
        "hashed_password": hashed_password,
        "auth_provider": "local",
        "is_active": True,
        "is_verified": False,
        "created_at": auth.datetime.utcnow(),
        "updated_at": auth.datetime.utcnow()
    }
    
    # Add to Firestore
    doc_ref = users_ref.add(user_doc)
    user_id = doc_ref[1].id
    
    # Send welcome email
    email_service.send_registration_welcome(
        to_email=user_data.email,
        username=user_data.username
    )
    
    # Create access token
    access_token = auth.create_access_token(
        data={"sub": user_data.email},
        expires_delta=timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    user_response = User(
        id=user_id,
        email=user_data.email,
        username=user_data.username,
        full_name=user_data.full_name,
        auth_provider="local"
    )
    
    return UserResponse(
        user=user_response,
        access_token=access_token,
        token_type="bearer"
    )

@router.post("/login", response_model=UserResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Login with email and password"""
    from database import get_firestore_db, Collections, FieldFilter
    
    db = get_firestore_db()
    users_ref = db.collection(Collections.USERS)
    
    # Find user by email
    user_docs = users_ref.where(filter=FieldFilter("email", "==", form_data.username)).limit(1).get()
    user_list = list(user_docs)
    
    if not user_list:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_doc = user_list[0]
    user_data = user_doc.to_dict()
    
    # Verify password
    if not auth.verify_password(form_data.password, user_data.get("hashed_password", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token = auth.create_access_token(
        data={"sub": user_data["email"]},
        expires_delta=timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    user_response = User(
        id=user_doc.id,
        email=user_data["email"],
        username=user_data["username"],
        full_name=user_data.get("full_name"),
        profile_picture=user_data.get("profile_picture"),
        auth_provider=user_data.get("auth_provider", "local")
    )
    
    return UserResponse(
        user=user_response,
        access_token=access_token,
        token_type="bearer"
    )

@router.post("/login/email", response_model=UserResponse)
async def login_with_email(user_data: UserLogin):
    """Login with email and password (JSON body)"""
    from database import get_firestore_db, Collections, FieldFilter
    
    db = get_firestore_db()
    users_ref = db.collection(Collections.USERS)
    
    # Find user by email
    user_docs = users_ref.where(filter=FieldFilter("email", "==", user_data.email)).limit(1).get()
    user_list = list(user_docs)
    
    if not user_list:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    user_doc = user_list[0]
    user_dict = user_doc.to_dict()
    
    user_dict = user_doc.to_dict()
    
    import sys
    print(f"DEBUG: Login attempt for {user_data.email}", file=sys.stderr, flush=True)
    if not user_dict.get("hashed_password"):
        print("DEBUG: No hashed_password found for user", file=sys.stderr, flush=True)
    else:
        print(f"DEBUG: Password hash found (len={len(user_dict.get('hashed_password'))})", file=sys.stderr, flush=True)
    
    # Verify password
    is_valid = auth.verify_password(user_data.password, user_dict.get("hashed_password", ""))
    print(f"DEBUG: Password verification result: {is_valid}", file=sys.stderr, flush=True)
    
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create access token
    access_token = auth.create_access_token(
        data={"sub": user_dict["email"]},
        expires_delta=timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    user_response = User(
        id=user_doc.id,
        email=user_dict["email"],
        username=user_dict["username"],
        full_name=user_dict.get("full_name"),
        profile_picture=user_dict.get("profile_picture"),
        auth_provider=user_dict.get("auth_provider", "local")
    )
    
    return UserResponse(
        user=user_response,
        access_token=access_token,
        token_type="bearer"
    )

@router.post("/google", response_model=UserResponse)
async def google_auth(google_data: GoogleAuthRequest):
    """Authenticate with Google OAuth"""
    from database import get_firestore_db, Collections, FieldFilter
    
    # Verify Google token
    google_info = await auth.verify_google_token(google_data.token)
    
    db = get_firestore_db()
    users_ref = db.collection(Collections.USERS)
    
    # Check if user exists by Google ID
    user_docs = users_ref.where(filter=FieldFilter("google_id", "==", google_info['google_id'])).limit(1).get()
    user_list = list(user_docs)
    
    if user_list:
        # Update existing user
        user_doc = user_list[0]
        user_doc.reference.update({
            "full_name": google_info['full_name'],
            "profile_picture": google_info['profile_picture'],
            "is_verified": google_info['is_verified'],
            "updated_at": auth.datetime.utcnow()
        })
        user_data = user_doc.to_dict()
        user_id = user_doc.id
    else:
        # Check if user exists by email
        email_docs = users_ref.where(filter=FieldFilter("email", "==", google_info['email'])).limit(1).get()
        email_list = list(email_docs)
        
        if email_list:
            # Link Google account
            user_doc = email_list[0]
            user_doc.reference.update({
                "google_id": google_info['google_id'],
                "auth_provider": "google",
                "profile_picture": google_info['profile_picture'],
                "is_verified": google_info['is_verified'],
                "updated_at": auth.datetime.utcnow()
            })
            user_data = user_doc.to_dict()
            user_id = user_doc.id
        else:
            # Create new user
            username = google_info['email'].split('@')[0]
            
            new_user = {
                "email": google_info['email'],
                "username": username,
                "full_name": google_info['full_name'],
                "google_id": google_info['google_id'],
                "auth_provider": "google",
                "profile_picture": google_info['profile_picture'],
                "is_verified": google_info['is_verified'],
                "is_active": True,
                "created_at": auth.datetime.utcnow(),
                "updated_at": auth.datetime.utcnow()
            }
            
            doc_ref = users_ref.add(new_user)
            user_id = doc_ref[1].id
            user_data = new_user
    
    # Create access token
    access_token = auth.create_access_token(
        data={"sub": user_data["email"]},
        expires_delta=timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    user_response = User(
        id=user_id,
        email=user_data["email"],
        username=user_data["username"],
        full_name=user_data.get("full_name"),
        profile_picture=user_data.get("profile_picture"),
        auth_provider=user_data.get("auth_provider", "google")
    )
    
    return UserResponse(
        user=user_response,
        access_token=access_token,
        token_type="bearer"
    )

@router.get("/me", response_model=User)
async def get_current_user_info(current_user: dict = Depends(auth.get_current_user_firestore)):
    """Get current user information"""
    return User(**current_user)
