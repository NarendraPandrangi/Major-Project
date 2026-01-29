from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List
from datetime import datetime
from models import UserRole, AuthProvider, DisputeStatus, DisputeCategory, NotificationType

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class GoogleAuthRequest(BaseModel):
    token: str  # Google ID token

class User(UserBase):
    id: int
    role: UserRole
    auth_provider: AuthProvider
    profile_picture: Optional[str] = None
    is_active: bool
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    user: User
    access_token: str
    token_type: str = "bearer"

# Dispute Schemas
class DisputeBase(BaseModel):
    title: str
    description: str
    category: DisputeCategory
    defendant_email: Optional[str] = None

class DisputeCreate(DisputeBase):
    pass

class AISuggestion(BaseModel):
    suggestion: str
    confidence: float
    reasoning: str
    precedent: Optional[str] = None

class Dispute(DisputeBase):
    id: int
    status: DisputeStatus
    plaintiff_id: int
    defendant_id: Optional[int] = None
    ai_suggestions: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DisputeWithDetails(Dispute):
    plaintiff: User
    defendant: Optional[User] = None

# Notification Schemas
class NotificationBase(BaseModel):
    type: NotificationType
    title: str
    message: str

class NotificationCreate(NotificationBase):
    user_id: int

class Notification(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Dashboard Schemas
class DashboardStats(BaseModel):
    total_disputes: int
    pending_disputes: int
    resolved_disputes: int
    disputes_filed: int
    disputes_against: int
    recent_disputes: List[Dispute]

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
