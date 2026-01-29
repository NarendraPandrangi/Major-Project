from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from database import Base

class UserRole(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"

class AuthProvider(str, enum.Enum):
    LOCAL = "local"
    GOOGLE = "google"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=True)  # Nullable for OAuth users
    role = Column(Enum(UserRole), default=UserRole.USER)
    auth_provider = Column(Enum(AuthProvider), default=AuthProvider.LOCAL)
    google_id = Column(String, unique=True, nullable=True, index=True)
    profile_picture = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    disputes_filed = relationship("Dispute", foreign_keys="Dispute.plaintiff_id", back_populates="plaintiff")
    disputes_against = relationship("Dispute", foreign_keys="Dispute.defendant_id", back_populates="defendant")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

class DisputeStatus(str, enum.Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    REJECTED = "rejected"

class DisputeCategory(str, enum.Enum):
    PROPERTY = "Property"
    BUSINESS = "Business"
    FAMILY = "Family"
    SERVICE = "Service"
    EMPLOYMENT = "Employment"
    CONTRACT = "Contract"
    OTHER = "Other"

class Dispute(Base):
    __tablename__ = "disputes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    category = Column(Enum(DisputeCategory), nullable=False)
    status = Column(Enum(DisputeStatus), default=DisputeStatus.PENDING)
    plaintiff_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    defendant_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    defendant_email = Column(String, nullable=True)
    ai_suggestions = Column(Text, nullable=True)  # JSON string
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    plaintiff = relationship("User", foreign_keys=[plaintiff_id], back_populates="disputes_filed")
    defendant = relationship("User", foreign_keys=[defendant_id], back_populates="disputes_against")

class NotificationType(str, enum.Enum):
    DISPUTE_FILED = "dispute_filed"
    DISPUTE_UPDATE = "dispute_update"
    AI_SUGGESTION = "ai_suggestion"
    SYSTEM = "system"

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(Enum(NotificationType), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="notifications")
