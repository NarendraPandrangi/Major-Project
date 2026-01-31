import os
import sys
from datetime import datetime
from database import get_firestore_db, Collections, FieldFilter
from auth import get_password_hash
from dotenv import load_dotenv

load_dotenv()

def create_admin_user():
    print("🚀 Initializing Admin User Creation...")
    
    # Initialize DB
    try:
        db = get_firestore_db()
        users_ref = db.collection(Collections.USERS)
    except Exception as e:
        print(f"❌ Failed to connect to Firestore: {str(e)}")
        return

    admin_email = "admin@example.com"
    admin_password = "admin123"
    admin_username = "admin"
    
    # Check if user exists
    user_docs = users_ref.where(filter=FieldFilter("email", "==", admin_email)).limit(1).get()
    
    if len(list(user_docs)) > 0:
        # User exists, update role
        doc = list(user_docs)[0]
        print(f"ℹ️  User {admin_email} already exists. Updating role to 'admin'...")
        
        doc.reference.update({
            "role": "admin",
            "updated_at": datetime.utcnow()
        })
        print("✅ User upgraded to Admin successfully!")
        
    else:
        # Create new user
        print(f"ℹ️  Creating new admin user: {admin_email}")
        
        new_user = {
            "email": admin_email,
            "username": admin_username,
            "full_name": "System Administrator",
            "hashed_password": get_password_hash(admin_password),
            "role": "admin",
            "auth_provider": "local",
            "is_active": True,
            "is_verified": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        users_ref.add(new_user)
        print("✅ Admin user created successfully!")

    print("\n🎉 CREDENTIALS FOR ADMIN ACCESS:")
    print("====================================")
    print(f"📧 Email:    {admin_email}")
    print(f"🔑 Password: {admin_password}")
    print("====================================")
    print("👉 Login at: http://localhost:5173/login")

if __name__ == "__main__":
    create_admin_user()
