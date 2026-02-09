from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import hashlib
import os
import secrets
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv()

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 10080))
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

class TokenData(BaseModel):
    email: Optional[str] = None

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash using PBKDF2"""
    try:
        # Extract salt and hash from stored password
        # Format: algorithm$iterations$salt$hash
        parts = hashed_password.split('$')
        if len(parts) != 4:
            return False
        
        algorithm, iterations, salt, stored_hash = parts
        iterations = int(iterations)
        
        # Hash the plain password with the same salt
        password_hash = hashlib.pbkdf2_hmac(
            'sha256',
            plain_password.encode('utf-8'),
            salt.encode('utf-8'),
            iterations
        )
        
        # Compare hashes
        return password_hash.hex() == stored_hash
    except Exception:
        return False

def get_password_hash(password: str) -> str:
    """Hash a password using PBKDF2"""
    # Generate a random salt
    salt = secrets.token_hex(16)
    
    # Number of iterations (100,000 is recommended by OWASP)
    iterations = 100000
    
    # Hash the password
    password_hash = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        iterations
    )
    
    # Return in format: algorithm$iterations$salt$hash
    return f"pbkdf2_sha256${iterations}${salt}${password_hash.hex()}"

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(token: str, credentials_exception) -> TokenData:
    """Verify and decode a JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
        return token_data
    except JWTError:
        raise credentials_exception

async def get_current_user_firestore(token: str = Depends(oauth2_scheme)):
    """Get the current authenticated user from Firestore"""
    from database import get_firestore_db, Collections, FieldFilter
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token_data = verify_token(token, credentials_exception)
    
    db = get_firestore_db()
    users_ref = db.collection(Collections.USERS)
    user_docs = users_ref.where(filter=FieldFilter("email", "==", token_data.email)).limit(1).get()
    user_list = list(user_docs)
    
    if not user_list:
        raise credentials_exception
    
    user_doc = user_list[0]
    user_data = user_doc.to_dict()
    user_data['id'] = user_doc.id
    
    if not user_data.get('is_active', True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    
    return user_data

FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID", "")

async def verify_google_token(token: str) -> dict:
    """Verify Google OAuth token or Firebase ID token and return user info"""
    try:
        # Try verifying as Firebase ID token first (most likely case for current frontend)
        if FIREBASE_PROJECT_ID:
            try:
                idinfo = id_token.verify_firebase_token(
                    token, 
                    google_requests.Request(), 
                    audience=FIREBASE_PROJECT_ID
                )
                
                return {
                    'google_id': idinfo['sub'],
                    'email': idinfo['email'],
                    'full_name': idinfo.get('name', ''),
                    'profile_picture': idinfo.get('picture', ''),
                    'is_verified': idinfo.get('email_verified', False)
                }
            except ValueError:
                # If Firebase verification fails, continue to try Google ID token
                pass

        # Fallback to Google ID Token verification
        audience = GOOGLE_CLIENT_ID if GOOGLE_CLIENT_ID else None
        
        # Verify the token
        idinfo = id_token.verify_oauth2_token(
            token, 
            google_requests.Request(), 
            audience
        )
        
        # Verify the issuer
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError('Wrong issuer.')
        
        return {
            'google_id': idinfo['sub'],
            'email': idinfo['email'],
            'full_name': idinfo.get('name', ''),
            'profile_picture': idinfo.get('picture', ''),
            'is_verified': idinfo.get('email_verified', False)
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )
