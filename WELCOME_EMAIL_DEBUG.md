# 🔍 Welcome Email Debugging Guide

## Issue
Welcome emails are not being sent after user registration.

## What We've Done

### 1. ✅ Added Detailed Logging
The `sendWelcomeEmail` function now logs:
- Environment variable status
- EmailJS initialization
- Email sending parameters
- Success/failure details

### 2. ✅ Restarted Dev Server
**IMPORTANT**: Vite requires a restart when `.env` files change!
- The dev server has been restarted to load new environment variables

### 3. ✅ Added Configuration Validator
On app startup, you'll now see in the browser console:
```
=== EMAIL SERVICE CONFIGURATION ===
Configuration Valid: true/false
Welcome Service Config: {...}
Dispute Service Config: {...}
===================================
```

## Testing Steps

### Step 1: Check Browser Console on Page Load
1. Open your browser (http://localhost:5173)
2. Open Developer Tools (F12)
3. Go to Console tab
4. Look for: `=== EMAIL SERVICE CONFIGURATION ===`
5. Verify all configurations show as valid

**Expected Output:**
```
=== EMAIL SERVICE CONFIGURATION ===
Configuration Valid: true
✅ All email configuration present

Welcome Service Config:
  serviceId: "service_xsbg5eg"
  publicKey: "***SET***"
  templateId: "template_ol06yk5"

Dispute Service Config:
  serviceId: "service_fnp3fdu"
  publicKey: "***SET***"
  templates: ["disputeFiled", "confirmation", "accepted", "rejected"]
===================================
```

### Step 2: Register a New User
1. Go to Register page
2. Fill in the form with a **real email address** (one you can check)
3. Click "Create Account"
4. Watch the browser console

**Expected Console Output:**
```
=== WELCOME EMAIL DEBUG ===
Environment variables: {
  serviceId: "service_xsbg5eg",
  publicKey: "***SET***",
  templateId: "template_ol06yk5"
}
Initializing EmailJS with welcome service...
Sending welcome email with params: {
  serviceId: "service_xsbg5eg",
  templateId: "template_ol06yk5",
  to_email: "user@example.com",
  to_name: "User Name"
}
✅ Welcome email sent successfully: {status: 200, text: "OK"}
```

### Step 3: Check Email Inbox
1. Check the email inbox (including spam/junk folder)
2. Look for email from your EmailJS service
3. Verify it uses the welcome template

## Troubleshooting

### ❌ Configuration Invalid
**Console shows:** `Configuration Valid: false`

**Solution:**
1. Check if `.env` file exists in `frontend/` directory
2. Verify all variables start with `VITE_`
3. Restart the dev server: `Ctrl+C` then `npm run dev`

### ❌ "Email service not configured"
**Console shows:** `❌ Welcome email configuration incomplete!`

**Possible causes:**
- Environment variables not loaded (restart dev server)
- Typo in `.env` variable names
- Missing values in `.env`

**Solution:**
```bash
# Stop the dev server (Ctrl+C)
# Then restart it
cd frontend
npm run dev
```

### ❌ EmailJS Error (403, 404, etc.)
**Console shows:** `❌ Failed to send welcome email: [error details]`

**Common errors:**
- **403 Forbidden**: Invalid public key or service ID
- **404 Not Found**: Template ID doesn't exist
- **400 Bad Request**: Missing required template variables

**Solution:**
1. Verify credentials in EmailJS dashboard
2. Check template ID exists: `template_ol06yk5`
3. Ensure template has these variables:
   - `{{to_email}}`
   - `{{to_name}}`
   - `{{user_id}}`
   - `{{registration_date}}`

### ❌ No Console Logs at All
**Nothing appears in console**

**Solution:**
1. Hard refresh the page: `Ctrl+Shift+R`
2. Clear browser cache
3. Check if dev server is running
4. Verify no JavaScript errors in console

## Quick Checklist

- [ ] Dev server restarted after `.env` changes
- [ ] Browser console shows configuration validator output
- [ ] All environment variables show as "***SET***"
- [ ] Registration completes successfully
- [ ] Console shows "=== WELCOME EMAIL DEBUG ===" when registering
- [ ] Console shows "✅ Welcome email sent successfully"
- [ ] Email received in inbox (check spam folder)

## Next Steps

If emails still don't send:
1. Share the browser console output (screenshot or copy/paste)
2. Check EmailJS dashboard for API usage/errors
3. Verify EmailJS account is active and not rate-limited
4. Test with EmailJS dashboard's "Test" feature

## Important Notes

- ⚠️ **Always restart Vite dev server** after changing `.env` files
- ⚠️ **Check spam folder** - EmailJS emails often go to spam initially
- ⚠️ **Use real email addresses** for testing
- ⚠️ **EmailJS has rate limits** - check your dashboard if emails stop sending
