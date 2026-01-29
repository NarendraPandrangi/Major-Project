# 🚀 Quick Start Guide - AI Dispute Resolver

## ✅ What's Been Implemented

### Authentication Features
- ✅ **Email/Password Registration** - Full validation and secure password hashing
- ✅ **Email/Password Login** - JWT token-based authentication
- ✅ **Google OAuth Sign-in/Sign-up** - Using both @react-oauth/google and Firebase
- ✅ **Firebase Integration** - Enhanced authentication with Firebase SDK
- ✅ **Password Reset** - Firebase-powered password reset via email
- ✅ **Email Verification** - Send verification emails to users
- ✅ **Protected Routes** - Automatic redirection for authenticated/unauthenticated users
- ✅ **Profile Management** - Update user information
- ✅ **Google Profile Sync** - Automatic profile picture and name sync

### Backend Features
- ✅ **FastAPI REST API** - Modern Python web framework
- ✅ **PostgreSQL Database** - Relational database with SQLAlchemy ORM
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Google OAuth Backend** - Verify Google ID tokens
- ✅ **User Management** - CRUD operations for users
- ✅ **Dispute Management** - Create, read, update disputes
- ✅ **Dashboard API** - Statistics and analytics
- ✅ **Notifications System** - User notifications

### Frontend Features
- ✅ **React 18** - Modern UI library
- ✅ **Vite** - Lightning-fast build tool
- ✅ **React Router** - Client-side routing
- ✅ **Context API** - Global state management
- ✅ **Axios** - HTTP client with interceptors
- ✅ **Premium Design** - Modern, gradient-based UI
- ✅ **Responsive** - Mobile and desktop optimized
- ✅ **Animations** - Smooth transitions and micro-animations

## 📋 Prerequisites

Before you begin, ensure you have:

- ✅ **Python 3.9+** installed
- ✅ **Node.js 18+** installed
- ✅ **PostgreSQL 14+** installed and running
- ✅ **Google Cloud Console** account
- ✅ **Firebase** project created

## 🔥 Firebase Setup (Required)

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `major-5d82e` (or your choice)
4. Enable Google Analytics (optional)
5. Create project

### Step 2: Enable Authentication
1. In Firebase Console, go to **Authentication**
2. Click "Get started"
3. Enable **Email/Password** sign-in method
4. Enable **Google** sign-in method
5. Add your support email

### Step 3: Get Firebase Config
Your Firebase config is already in the code:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAcXVkkN62tTlmQJCYQVeRfjPb2jltd8eQ",
  authDomain: "major-5d82e.firebaseapp.com",
  projectId: "major-5d82e",
  storageBucket: "major-5d82e.firebasestorage.app",
  messagingSenderId: "81722562563",
  appId: "1:81722562563:web:be4c71d32071480e539636",
  measurementId: "G-5FYZSHN843"
};
```

### Step 4: Configure Authorized Domains
1. In Firebase Console → Authentication → Settings
2. Add authorized domains:
   - `localhost`
   - Your production domain (when deploying)

## 🔑 Google OAuth Setup

### Step 1: Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API**

### Step 2: Create OAuth Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. Configure consent screen (if not done):
   - User Type: External
   - App name: AI Dispute Resolver
   - Support email: your email
   - Developer contact: your email

### Step 3: Configure OAuth Client
1. Application type: **Web application**
2. Name: `AI Dispute Resolver Web Client`
3. Authorized JavaScript origins:
   ```
   http://localhost:3000
   http://localhost:5173
   http://localhost:8000
   ```
4. Authorized redirect URIs:
   ```
   http://localhost:3000
   http://localhost:5173
   ```
5. Click **Create**
6. **Copy the Client ID** - you'll need this!

## 💾 Database Setup

```powershell
# Start PostgreSQL service (if not running)
# Open PowerShell as Administrator

# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE dispute_resolver;

# Create user (optional, for production)
CREATE USER dispute_admin WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE dispute_resolver TO dispute_admin;

# Exit
\q
```

## 🐍 Backend Setup

```powershell
# Navigate to backend directory
cd d:\Major-Project\backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate

# Install dependencies (note the -r flag)
pip install -r requirements.txt

# Create .env file from example
Copy-Item .env.example .env

# Edit .env file (use notepad or your editor)
notepad .env
```

### Configure .env file:
```env
# Database
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/dispute_resolver

# JWT Secret (generate with: python -c "import secrets; print(secrets.token_hex(32))")
SECRET_KEY=your_generated_secret_key_here

# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### Generate SECRET_KEY:
```powershell
python -c "import secrets; print(secrets.token_hex(32))"
```

### Run Backend:
```powershell
# Make sure you're in backend directory with venv activated
python main.py
```

Backend will start at: **http://localhost:8000**

API docs available at: **http://localhost:8000/docs**

## ⚛️ Frontend Setup

```powershell
# Open NEW PowerShell window
# Navigate to frontend directory
cd d:\Major-Project\frontend

# Install dependencies
npm install

# Create .env file
Copy-Item .env.example .env

# Edit .env file
notepad .env
```

### Configure .env file:
```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

**Note:** Use the SAME Google Client ID from Google Cloud Console

### Run Frontend:
```powershell
npm run dev
```

Frontend will start at: **http://localhost:3000**

## 🎯 Testing the Application

### 1. Test Registration
1. Open http://localhost:3000
2. Click "Get Started" or "Create Account"
3. Fill in the form:
   - Email: test@example.com
   - Username: testuser
   - Password: Test1234!
4. Click "Create Account"
5. You should be redirected to dashboard

### 2. Test Google Sign-in
1. Go to Login page
2. Click "Sign in with Google"
3. Select your Google account
4. You should be redirected to dashboard

### 3. Test Password Reset
1. Go to Login page
2. Click "Forgot password?"
3. Enter your email
4. Check your email for reset link (Firebase will send it)

### 4. Test Dashboard
1. After logging in, you should see:
   - Welcome message with your name
   - Statistics cards (all zeros initially)
   - Quick actions
   - User profile in header

## 🔧 Troubleshooting

### Backend Issues

**Error: `ModuleNotFoundError`**
```powershell
# Make sure venv is activated
.\venv\Scripts\Activate

# Reinstall dependencies
pip install -r requirements.txt
```

**Error: `Connection refused` (Database)**
```powershell
# Check if PostgreSQL is running
# Start PostgreSQL service
# Verify DATABASE_URL in .env is correct
```

**Error: `401 Unauthorized` (Google OAuth)**
```
# Verify GOOGLE_CLIENT_ID in backend/.env
# Make sure it matches Google Cloud Console
```

### Frontend Issues

**Error: `Module not found`**
```powershell
# Delete node_modules and reinstall
Remove-Item -Recurse -Force node_modules
npm install
```

**Error: Google Sign-in not working**
```
# Verify VITE_GOOGLE_CLIENT_ID in frontend/.env
# Check browser console for errors
# Ensure localhost:3000 is in Google Cloud Console authorized origins
```

**Error: `Network Error` or `CORS`**
```
# Make sure backend is running on port 8000
# Check backend CORS settings in main.py
```

## 📱 Features to Test

### ✅ Registration Flow
- [x] Email validation
- [x] Password strength check
- [x] Username uniqueness
- [x] Automatic login after registration
- [x] Google OAuth registration

### ✅ Login Flow
- [x] Email/password login
- [x] Form validation
- [x] Error messages
- [x] Google OAuth login
- [x] Forgot password link

### ✅ Password Reset
- [x] Email validation
- [x] Firebase email sent
- [x] Success message
- [x] Return to login

### ✅ Dashboard
- [x] User profile display
- [x] Statistics cards
- [x] Quick actions
- [x] Logout functionality

## 🎨 Design Features

- **Modern Gradients** - Beautiful color transitions
- **Glassmorphism** - Frosted glass effects
- **Animations** - Smooth fade-ins and slides
- **Responsive** - Works on all screen sizes
- **Premium Feel** - Professional, polished UI
- **Google Fonts** - Inter font family
- **Lucide Icons** - Consistent iconography

## 🚀 Next Steps

Now that authentication is working, you can:

1. **Add Dispute Filing** - Create dispute form
2. **Implement AI Suggestions** - Integrate ML model
3. **Add File Uploads** - Support evidence documents
4. **Email Notifications** - Send email updates
5. **Real-time Updates** - WebSocket integration
6. **Admin Panel** - Manage users and disputes
7. **Analytics** - Advanced reporting
8. **Export Features** - PDF generation

## 📚 API Documentation

Once backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔐 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Token expiration (7 days)
- ✅ CORS protection
- ✅ SQL injection prevention (SQLAlchemy ORM)
- ✅ XSS protection (React)
- ✅ HTTPS ready (for production)

## 📞 Support

If you encounter any issues:
1. Check this guide first
2. Review error messages in console
3. Check browser developer tools
4. Verify all environment variables
5. Ensure all services are running

## 🎉 Success Checklist

- [ ] PostgreSQL database created
- [ ] Firebase project configured
- [ ] Google OAuth credentials created
- [ ] Backend .env configured
- [ ] Frontend .env configured
- [ ] Backend running on port 8000
- [ ] Frontend running on port 3000
- [ ] Can register with email/password
- [ ] Can login with email/password
- [ ] Can sign in with Google
- [ ] Can reset password
- [ ] Dashboard loads correctly

**Congratulations! Your AI Dispute Resolver is ready! 🎊**
