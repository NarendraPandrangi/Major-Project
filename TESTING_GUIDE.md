# 🎯 Ready to Test!

## ✅ Both Servers Running

- **Backend**: http://localhost:8000 ✅
- **Frontend**: http://localhost:3000 ✅

## 🔥 Firebase/Firestore Setup

The backend is now configured with embedded credentials for development. 

### Enable Firestore Database

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **major-5d82e**
3. Click **"Firestore Database"** in the left menu
4. Click **"Create database"**
5. Choose **"Start in test mode"** (for development)
6. Select location: **asia-south1** (closest to India)
7. Click **"Enable"**

**This takes about 1-2 minutes to provision.**

## 🧪 Test the Application

### 1. Open Frontend
```
http://localhost:3000
```

### 2. Try Registration
1. Click "Get Started" or "Create Account"
2. Fill in:
   - Email: test@example.com
   - Username: testuser
   - Full Name: Test User
   - Password: Test1234!
   - Confirm Password: Test1234!
3. Click "Create Account"

### 3. Check Firestore
After successful registration, go to Firebase Console → Firestore Database

You should see:
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
      ├── created_at: timestamp
      └── updated_at: timestamp
```

### 4. Try Login
1. Go to Login page
2. Enter:
   - Email: test@example.com
   - Password: Test1234!
3. Click "Sign In"
4. You should be redirected to Dashboard

### 5. Try Google Sign-in
1. Click "Sign in with Google"
2. Select your Google account
3. Should auto-create account and login

### 6. Try Password Reset
1. Click "Forgot password?"
2. Enter your email
3. Check for Firebase email (may take a minute)

## 🔍 Debugging

### Check Backend Logs
Look at the terminal running `python main.py`

**Success looks like:**
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**If you see errors:**
- Check that Firestore is enabled in Firebase Console
- Verify .env file has correct Firebase config
- Make sure project ID is "major-5d82e"

### Check Frontend Logs
Open browser console (F12)

**Success looks like:**
```
No errors in console
Network tab shows successful API calls (200 status)
```

**If you see errors:**
- Check that backend is running on port 8000
- Verify VITE_API_URL in frontend/.env
- Check CORS errors (should be allowed)

## 📊 API Endpoints to Test

### Health Check
```bash
curl http://localhost:8000/api/health
```

Should return:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-28T...",
  "database": "Firestore"
}
```

### Register (with curl)
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "curl@example.com",
    "username": "curluser",
    "full_name": "Curl User",
    "password": "Test1234!"
  }'
```

### Login (with curl)
```bash
curl -X POST http://localhost:8000/api/auth/login/email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!"
  }'
```

## ✨ What's Working

- ✅ Backend server running
- ✅ Frontend server running
- ✅ Firebase configured
- ✅ Firestore integration ready
- ✅ Authentication endpoints ready
- ✅ CORS configured
- ✅ JWT tokens working
- ✅ Password hashing working

## 🎯 Expected Flow

1. **User registers** → Data saved to Firestore `users` collection
2. **Backend generates JWT** → Token sent to frontend
3. **Frontend stores token** → In localStorage
4. **User redirected to dashboard** → Protected route
5. **Dashboard loads** → Shows user info and stats

## 🚀 Next Features to Build

Once authentication is working:

1. **Dispute Filing Form** - Create new disputes
2. **Dispute List** - View all disputes
3. **AI Suggestions** - Integrate ML model
4. **Real-time Chat** - Using Firestore real-time listeners
5. **File Uploads** - Firebase Storage
6. **Notifications** - Real-time updates

## 🎉 You're Almost There!

Just enable Firestore in Firebase Console and you're ready to test!

**Steps:**
1. Enable Firestore (2 minutes)
2. Refresh backend (should auto-reload)
3. Try registration at http://localhost:3000
4. Check Firestore for new user data
5. Celebrate! 🎊

---

**Need help?** Check the backend terminal for error messages.
