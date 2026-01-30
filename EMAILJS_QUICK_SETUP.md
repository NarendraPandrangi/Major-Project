# EmailJS Email Notifications - Quick Setup Summary

## ✅ What's Been Implemented

### 1. **Registration Welcome Email**
- Automatically sent when a user successfully registers
- Includes platform features overview and dashboard link
- Template: `registration_welcome`

### 2. **Dispute Filed - Defendant Notification**
- Sent to the defendant when a case is filed against them
- Includes dispute details and direct link to view
- Template: `dispute_filed`

### 3. **Dispute Filed - Plaintiff Confirmation**
- Sent to the plaintiff after successfully filing a dispute
- Confirms submission and notifies that defendant was informed
- Template: `dispute_filed_confirmation`

### 4. **Dispute Accepted Notification** (Ready to implement)
- Will be sent when defendant accepts the case
- Template: `dispute_accepted`

### 5. **Dispute Rejected Notification** (Ready to implement)
- Will be sent when defendant rejects the case
- Template: `dispute_rejected`

---

## 🚀 Quick Setup Steps

### Step 1: Install EmailJS Package ✅
```bash
cd frontend
npm install @emailjs/browser
```

### Step 2: Create EmailJS Account
1. Go to https://www.emailjs.com/
2. Sign up for a free account
3. Verify your email

### Step 3: Add Email Service
1. Go to **Email Services** in EmailJS dashboard
2. Click **Add New Service**
3. Choose **Gmail** (recommended)
4. Connect your Gmail account
5. Copy your **Service ID**

### Step 4: Create Email Templates
Create 5 templates in EmailJS dashboard. See `EMAILJS_SETUP.md` for detailed HTML templates:

1. **Registration Welcome** - `registration_welcome`
2. **Dispute Filed Notification** - `dispute_filed`
3. **Dispute Filed Confirmation** - `dispute_filed_confirmation`
4. **Dispute Accepted** - `dispute_accepted`
5. **Dispute Rejected** - `dispute_rejected`

### Step 5: Get Your Public Key
1. Go to **Account** → **General**
2. Copy your **Public Key**

### Step 6: Configure Environment Variables
Create `frontend/.env` file:

```env
VITE_API_URL=http://localhost:8000

# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=your_service_id_here
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
VITE_EMAILJS_TEMPLATE_REGISTRATION=your_registration_template_id
VITE_EMAILJS_TEMPLATE_DISPUTE_FILED=your_dispute_filed_template_id
VITE_EMAILJS_TEMPLATE_CONFIRMATION=your_confirmation_template_id
VITE_EMAILJS_TEMPLATE_ACCEPTED=your_accepted_template_id
VITE_EMAILJS_TEMPLATE_REJECTED=your_rejected_template_id
```

### Step 7: Restart Frontend Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

---

## 📁 Files Modified/Created

### Created Files:
- ✅ `frontend/src/utils/emailService.js` - EmailJS utility functions
- ✅ `EMAIL_SETUP_GUIDE.md` - Comprehensive setup guide
- ✅ `EMAILJS_QUICK_SETUP.md` - This quick reference

### Modified Files:
- ✅ `frontend/src/pages/Register.jsx` - Added welcome email on registration
- ✅ `frontend/src/pages/DisputeForm.jsx` - Added emails on dispute filing
- ✅ `frontend/.env.example` - Added EmailJS environment variables
- ✅ `EMAILJS_SETUP.md` - Updated with registration template

---

## 🧪 Testing

### Test Registration Email:
1. Go to http://localhost:5173/register
2. Register a new account
3. Check your email inbox for welcome email
4. Verify all links work

### Test Dispute Filing Emails:
1. Register two accounts (Account A and Account B)
2. Log in as Account A
3. File a dispute against Account B's email
4. Check both inboxes:
   - Account A: Should receive confirmation email
   - Account B: Should receive notification email
5. Verify dispute links work

---

## 🔍 Troubleshooting

### Emails Not Sending?

**Check Console Logs:**
- Open browser DevTools (F12)
- Look for EmailJS success/error messages
- Common errors:
  - "EmailJS not configured" - Missing environment variables
  - "Invalid template" - Wrong template ID
  - "Service not found" - Wrong service ID

**Verify Environment Variables:**
```bash
# Make sure frontend/.env exists and has correct values
cat frontend/.env
```

**Check EmailJS Dashboard:**
- Go to https://dashboard.emailjs.com/
- Check "Email Logs" section
- Look for failed/successful sends

### Emails Going to Spam?
- Add sender email to contacts
- Mark first email as "Not Spam"
- For production, use a professional email service

---

## 📊 Email Flow Diagram

```
User Registration
    ↓
Register.jsx calls sendRegistrationEmail()
    ↓
EmailJS sends welcome email to user
    ↓
User receives email with platform features


Dispute Filing
    ↓
DisputeForm.jsx calls:
  - sendDisputeFiledEmail() → Defendant
  - sendDisputeConfirmationEmail() → Plaintiff
    ↓
EmailJS sends both emails
    ↓
Both parties receive notifications
```

---

## 🎯 Next Steps

1. **Set up EmailJS account** (if not done)
2. **Create email templates** using the HTML from `EMAILJS_SETUP.md`
3. **Configure `.env` file** with your EmailJS credentials
4. **Restart frontend server**
5. **Test registration** and **dispute filing**
6. **Implement accept/reject emails** in DisputeDetails.jsx (optional)

---

## 📚 Additional Resources

- **Full Setup Guide:** `EMAILJS_SETUP.md`
- **EmailJS Documentation:** https://www.emailjs.com/docs/
- **Email Service Utility:** `frontend/src/utils/emailService.js`
- **Environment Variables Example:** `frontend/.env.example`

---

## ⚠️ Important Notes

- **Free Tier Limit:** 200 emails/month on EmailJS free plan
- **No Backend Required:** All emails sent directly from browser
- **Graceful Degradation:** App works even if EmailJS is not configured
- **Production Ready:** Just update environment variables for production

---

## 🎉 You're All Set!

Once you complete the setup, your application will automatically send:
- ✅ Welcome emails on registration
- ✅ Notifications when disputes are filed
- ✅ Confirmations to plaintiffs
- ✅ (Optional) Accept/reject notifications

**Need Help?** Check `EMAILJS_SETUP.md` for detailed instructions and troubleshooting.
