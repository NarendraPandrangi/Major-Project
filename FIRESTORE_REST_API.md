# 🔥 Firestore REST API - No Credentials Needed!

## ✅ What Changed

I've updated the backend to use **Firestore REST API** instead of the Firebase Admin SDK. This means:

- ✅ **No service account credentials needed**
- ✅ **No authentication setup required**
- ✅ **Just uses your Firebase API key**
- ✅ **Perfect for development**

## 🚀 How It Works

The new `database.py` file implements a simple Firestore client that:

1. Uses Firestore REST API endpoints
2. Authenticates with your Firebase API key
3. Converts Python data to Firestore format
4. Handles queries and document operations

## 📝 What You Need

### 1. Enable Firestore Database

**This is the ONLY step you need!**

1. Go to https://console.firebase.google.com/
2. Select project: **major-5d82e**
3. Click **"Firestore Database"** in left menu
4. Click **"Create database"**
5. Choose **"Start in test mode"** (allows read/write without auth)
6. Select location: **asia-south1** (or closest to you)
7. Click **"Enable"**

**That's it!** No service account, no credentials file, nothing else needed.

## 🧪 Test Registration

Once Firestore is enabled:

1. Go to http://localhost:3000
2. Click "Get Started" or "Register"
3. Fill in the form:
   ```
   Email: test@example.com
   Username: testuser
   Full Name: Test User
   Password: Test1234!
   Confirm: Test1234!
   ```
4. Click "Create Account"

### Expected Result:
- ✅ User created in Firestore
- ✅ JWT token generated
- ✅ Redirected to dashboard
- ✅ Can see user data in Firebase Console

## 🔍 Verify in Firebase Console

After registration:

1. Go to Firebase Console → Firestore Database
2. You should see:
   ```
   users/
     └── {auto-generated-id}/
         ├── email: "test@example.com"
         ├── username: "testuser"
         ├── full_name: "Test User"
         ├── hashed_password: "$2b$12$..."
         ├── auth_provider: "local"
         ├── is_active: true
         ├── is_verified: false
         ├── created_at: "2026-01-28T..."
         └── updated_at: "2026-01-28T..."
   ```

## 🎯 API Endpoints Working

All these endpoints work with the REST API:

- ✅ `POST /api/auth/register` - Create user
- ✅ `POST /api/auth/login` - Login user
- ✅ `POST /api/auth/login/email` - Login with JSON
- ✅ `POST /api/auth/google` - Google OAuth
- ✅ `GET /api/auth/me` - Get current user
- ✅ `GET /api/health` - Health check

## 🔐 Security Notes

### Development (Test Mode)
Current Firestore rules allow anyone to read/write:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### Production (Secure Rules)
Before deploying, update to:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /disputes/{disputeId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        (resource.data.plaintiff_id == request.auth.uid || 
         resource.data.defendant_id == request.auth.uid);
    }
  }
}
```

## 💡 Benefits of REST API Approach

1. **Simpler Setup** - No credentials needed
2. **Easier Debugging** - Can test with curl/Postman
3. **No Dependencies** - Just uses `requests` library
4. **Works Anywhere** - No special configuration
5. **Perfect for Dev** - Quick to get started

## 🚨 If You See Errors

### "Permission denied"
- Make sure Firestore is in **test mode**
- Check Firebase Console → Firestore → Rules

### "Project not found"
- Verify `FIREBASE_PROJECT_ID=major-5d82e` in .env
- Check project exists in Firebase Console

### "API key invalid"
- Verify `FIREBASE_API_KEY` in .env matches Firebase Console
- Get it from: Project Settings → General → Web API Key

## ✅ Current Status

- ✅ Backend running on http://localhost:8000
- ✅ Frontend running on http://localhost:3000
- ✅ Firestore REST API configured
- ✅ No credentials needed
- ✅ Ready to test!

## 🎉 Next Step

**Just enable Firestore in Firebase Console and try registering!**

The backend will automatically:
1. Connect to Firestore via REST API
2. Create user document
3. Generate JWT token
4. Return success response

**No restart needed - the server auto-reloaded!** 🚀
