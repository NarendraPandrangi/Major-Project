# 🔧 Fix Google Sign-In - Get OAuth Client ID

## The Problem
Google Sign-In is failing because the **Google OAuth Client ID** is missing from your `.env` file.

---

## 🎯 **Solution: Get Your Google OAuth Client ID**

### **Step 1: Go to Google Cloud Console**
1. Visit: https://console.cloud.google.com/
2. Sign in with your Google account

### **Step 2: Create a New Project (if needed)**
1. Click the project dropdown at the top
2. Click **"New Project"**
3. Name it: **"AI Dispute Resolver"**
4. Click **"Create"**

### **Step 3: Enable Google+ API**
1. In the left sidebar, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google+ API"**
3. Click on it and click **"Enable"**

### **Step 4: Create OAuth Credentials**
1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. If prompted, configure the **OAuth consent screen**:
   - User Type: **External**
   - App name: **AI Dispute Resolver**
   - User support email: Your email
   - Developer contact: Your email
   - Click **"Save and Continue"**
   - Skip "Scopes" (click "Save and Continue")
   - Add test users if needed
   - Click **"Save and Continue"**

### **Step 5: Create OAuth Client ID**
1. Back to **"Credentials"** → **"Create Credentials"** → **"OAuth client ID"**
2. Application type: **"Web application"**
3. Name: **"AI Dispute Resolver Web Client"**
4. **Authorized JavaScript origins**:
   - Add: `http://localhost:5173`
   - Add: `http://localhost:3000` (backup)
5. **Authorized redirect URIs**:
   - Add: `http://localhost:5173`
   - Add: `http://localhost:5173/login`
   - Add: `http://localhost:5173/register`
6. Click **"Create"**

### **Step 6: Copy Your Client ID**
1. A popup will show your **Client ID** and **Client Secret**
2. **Copy the Client ID** (it looks like: `123456789-abcdefg.apps.googleusercontent.com`)
3. You don't need the Client Secret for frontend OAuth

### **Step 7: Update Your `.env` File**
1. Open `frontend/.env`
2. Replace `your-google-client-id-here` with your actual Client ID:
   ```env
   VITE_GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
   ```
3. Save the file

### **Step 8: Restart Dev Server**
The dev server should auto-restart, or manually:
```bash
# Press Ctrl+C
# Then run:
npm run dev
```

---

## ✅ **Test Google Sign-In**

1. Go to your app: `http://localhost:5173/register`
2. Click the **"Sign up with Google"** button
3. You should see the Google account picker
4. Select your account
5. Sign in successfully!

---

## 🔍 **Troubleshooting**

### Error: "redirect_uri_mismatch"
**Solution**: Add `http://localhost:5173` to **Authorized JavaScript origins** in Google Cloud Console

### Error: "Access blocked: This app's request is invalid"
**Solution**: Make sure you configured the **OAuth consent screen** properly

### Error: "Invalid client ID"
**Solution**: Double-check the Client ID in your `.env` file matches the one from Google Cloud Console

### Still not working?
1. Clear browser cache
2. Try incognito/private mode
3. Check browser console for errors
4. Verify the Client ID has no extra spaces

---

## 📝 **Quick Reference**

**Your `.env` should look like this:**
```env
VITE_API_URL=http://localhost:8000

# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=YOUR_ACTUAL_CLIENT_ID_HERE

# EmailJS Configuration - Welcome/Registration Service
VITE_EMAILJS_WELCOME_SERVICE_ID=service_sfbtumh
VITE_EMAILJS_WELCOME_PUBLIC_KEY=LJ81vH8bcaPR4p-qO

# ... rest of your config
```

---

## 🚀 **Production Deployment**

When deploying to production:
1. Go back to Google Cloud Console → Credentials
2. Edit your OAuth Client ID
3. Add your production URLs:
   - Authorized JavaScript origins: `https://yourdomain.com`
   - Authorized redirect URIs: `https://yourdomain.com/login`, `https://yourdomain.com/register`
4. Update your `.env.production` with the same Client ID

---

## 🎯 **Alternative: Use Existing Credentials**

If you already have a Google OAuth Client ID from another project:
1. Just copy that Client ID
2. Add `http://localhost:5173` to its authorized origins
3. Use it in your `.env` file

No need to create a new one!
