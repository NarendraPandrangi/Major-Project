# 🚀 Quick Command Reference

## ⚡ Common Commands (Copy & Paste)

### Backend Setup
```powershell
# Navigate to backend
cd d:\Major-Project\backend

# Create virtual environment (first time only)
python -m venv venv

# Activate virtual environment (every time)
.\venv\Scripts\Activate

# Install dependencies (use -r flag!)
pip install -r requirements.txt

# Create .env file (first time only)
Copy-Item .env.example .env

# Run backend server
python main.py
```

### Frontend Setup
```powershell
# Navigate to frontend
cd d:\Major-Project\frontend

# Install dependencies (first time only)
npm install

# Create .env file (first time only)
Copy-Item .env.example .env

# Run development server
npm run dev

# Build for production
npm run build
```

### Database Setup
```powershell
# Connect to PostgreSQL
psql -U postgres

# Create database (in psql)
CREATE DATABASE dispute_resolver;

# Exit psql
\q
```

### Generate SECRET_KEY
```powershell
# Run this to generate a secure secret key
python -c "import secrets; print(secrets.token_hex(32))"
```

## 🔧 Troubleshooting Commands

### Check Python Version
```powershell
python --version
# Should be 3.9 or higher
```

### Check Node Version
```powershell
node --version
# Should be 18 or higher
```

### Check PostgreSQL
```powershell
psql --version
```

### Check if Virtual Environment is Active
```powershell
# You should see (venv) at the start of your prompt
# If not, activate it:
.\venv\Scripts\Activate
```

### Reinstall Backend Dependencies
```powershell
cd backend
.\venv\Scripts\Activate
pip install --upgrade pip
pip install -r requirements.txt
```

### Reinstall Frontend Dependencies
```powershell
cd frontend
Remove-Item -Recurse -Force node_modules
npm install
```

## 📝 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/dispute_resolver
SECRET_KEY=<generated-with-secrets-command>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

## 🚀 Running the Application

### Terminal 1 - Backend
```powershell
cd d:\Major-Project\backend
.\venv\Scripts\Activate
python main.py
```
**Backend:** http://localhost:8000
**API Docs:** http://localhost:8000/docs

### Terminal 2 - Frontend
```powershell
cd d:\Major-Project\frontend
npm run dev
```
**Frontend:** http://localhost:3000

## ⚠️ Common Mistakes

### ❌ WRONG: `pip install .\requirements.txt`
### ✅ CORRECT: `pip install -r requirements.txt`

### ❌ WRONG: Running without activating venv
### ✅ CORRECT: Always activate venv first
```powershell
.\venv\Scripts\Activate
```

### ❌ WRONG: Using wrong port in frontend .env
### ✅ CORRECT: Use port 8000 for backend
```env
VITE_API_URL=http://localhost:8000
```

## 🔍 Checking if Everything Works

### Backend Health Check
```powershell
# In browser or PowerShell:
curl http://localhost:8000/api/health
# Should return: {"status":"healthy","timestamp":"..."}
```

### Frontend Check
```powershell
# Open browser:
http://localhost:3000
# Should see the landing page
```

### Database Check
```powershell
psql -U postgres -d dispute_resolver -c "\dt"
# Should list tables after first run
```

## 📦 Package Versions

### Backend (Python)
- FastAPI 0.104.1
- SQLAlchemy 2.0.23
- Uvicorn 0.24.0
- Python-JOSE 3.3.0
- Passlib 1.7.4
- Google-Auth 2.25.2

### Frontend (Node)
- React 18.2.0
- Vite 5.0.8
- Firebase 10.7.1
- Axios 1.6.2

## 🎯 Quick Test Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can access http://localhost:3000
- [ ] Can access http://localhost:8000/docs
- [ ] Can register a new account
- [ ] Can login with credentials
- [ ] Can see dashboard after login

## 💡 Pro Tips

1. **Always activate venv** before running backend commands
2. **Use two terminals** - one for backend, one for frontend
3. **Check .env files** if getting connection errors
4. **Clear browser cache** if seeing old content
5. **Check console logs** (F12 in browser) for errors

## 🆘 Need Help?

1. Check error message carefully
2. Verify all environment variables are set
3. Ensure PostgreSQL is running
4. Make sure ports 3000 and 8000 are free
5. Review QUICKSTART.md for detailed steps

## 🎉 Success Indicators

✅ Backend terminal shows: `Uvicorn running on http://0.0.0.0:8000`
✅ Frontend terminal shows: `Local: http://localhost:3000/`
✅ No error messages in terminals
✅ Browser loads the landing page
✅ Can navigate to login/register pages

---

**Remember:** Use `-r` flag with pip install! 
```powershell
pip install -r requirements.txt  # ✅ CORRECT
```
