# 🚨 DISK SPACE ISSUE - Quick Fix Guide

## Problem
You're getting: `ERROR: Could not install packages due to an OSError: [Errno 28] No space left on device`

## Quick Solutions

### Option 1: Clean Pip Cache (Recommended)
```powershell
# Clear pip cache to free up space
pip cache purge

# Then try installing again
pip install -r requirements.txt
```

### Option 2: Install Without Cache
```powershell
# Install packages without using cache
pip install --no-cache-dir -r requirements.txt
```

### Option 3: Clean Temp Files
```powershell
# Clean Windows temp files
Remove-Item -Path "$env:TEMP\*" -Recurse -Force -ErrorAction SilentlyContinue

# Clean pip temp
Remove-Item -Path "$env:LOCALAPPDATA\pip\Cache\*" -Recurse -Force -ErrorAction SilentlyContinue
```

### Option 4: Free Up Disk Space
1. Empty Recycle Bin
2. Run Disk Cleanup (cleanmgr.exe)
3. Delete unnecessary files from D: drive
4. Move large files to another drive

## After Freeing Space

```powershell
cd d:\Major-Project\backend
.\venv\Scripts\Activate
pip cache purge
pip install --no-cache-dir -r requirements.txt
```

## Alternative: Use C: Drive Instead

If D: drive continues to have issues, move the project to C: drive:

```powershell
# Copy project to C: drive
Copy-Item -Path "D:\Major-Project" -Destination "C:\Major-Project" -Recurse

# Navigate to new location
cd C:\Major-Project\backend

# Create new venv
python -m venv venv
.\venv\Scripts\Activate

# Install dependencies
pip install --no-cache-dir -r requirements.txt
```

## Verify Disk Space

```powershell
# Check available space
Get-PSDrive D | Select-Object Used,Free

# Should show enough free space (need at least 1-2 GB)
```

## If Still Failing

The issue might be with the Windows Store Python. Try:

1. **Install Python from python.org** instead of Windows Store
2. **Use a different drive** (C: instead of D:)
3. **Install packages one by one**:

```powershell
pip install --no-cache-dir fastapi==0.104.1
pip install --no-cache-dir uvicorn==0.24.0
pip install --no-cache-dir firebase-admin==6.3.0
pip install --no-cache-dir python-jose[cryptography]==3.3.0
pip install --no-cache-dir passlib[bcrypt]==1.7.4
pip install --no-cache-dir python-multipart==0.0.6
pip install --no-cache-dir python-dotenv==1.0.0
pip install --no-cache-dir pydantic[email]==2.5.0
pip install --no-cache-dir google-auth==2.25.2
```

## ✅ Once Installed Successfully

You'll see:
```
Successfully installed fastapi-0.104.1 uvicorn-0.24.0 ...
```

Then you can run:
```powershell
python main.py
```
