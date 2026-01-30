# Email Notification Setup Guide

This guide will help you set up email notifications for your AI Dispute Resolver platform.

## 📧 Email Notifications Overview

The platform sends automatic email notifications for the following events:

### 1. **Registration Welcome Email** ✅
- Sent immediately after a user successfully registers
- Includes welcome message and platform features overview
- Provides quick access to the dashboard

### 2. **Dispute Filed - Defendant Notification** ⚖️
- Sent to the defendant when a case is filed against them
- Includes dispute title, plaintiff email, and category
- Provides direct link to view the dispute

### 3. **Dispute Filed - Plaintiff Confirmation** 📝
- Sent to the plaintiff after successfully filing a dispute
- Confirms the dispute was filed and defendant was notified
- Includes dispute details and tracking link

### 4. **Dispute Accepted Notification** ✅
- Sent to the plaintiff when defendant accepts the case
- Notifies that live chat is now available
- Provides link to continue the resolution process

### 5. **Dispute Rejected Notification** ❌
- Sent to the plaintiff when defendant rejects the case
- Includes information about alternative resolution methods
- Provides link to view dispute details

---

## 🔧 Setup Instructions

### Option 1: Using Gmail (Recommended)

#### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Navigate to **Security**
3. Enable **2-Step Verification**

#### Step 2: Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select **Mail** as the app
3. Select **Other (Custom name)** as the device
4. Enter "AI Dispute Resolver" as the name
5. Click **Generate**
6. Copy the 16-character password (remove spaces)

#### Step 3: Update Backend .env File
Create or update `backend/.env` with:

```env
# Email Configuration
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SENDER_EMAIL=your-email@gmail.com
SENDER_PASSWORD=your-16-char-app-password
```

**Important:** Replace `your-email@gmail.com` with your actual Gmail address and `your-16-char-app-password` with the app password you generated.

---

### Option 2: Using Outlook/Hotmail

Update `backend/.env` with:

```env
SMTP_SERVER=smtp-mail.outlook.com
SMTP_PORT=587
SENDER_EMAIL=your-email@outlook.com
SENDER_PASSWORD=your-outlook-password
```

---

### Option 3: Using Yahoo Mail

Update `backend/.env` with:

```env
SMTP_SERVER=smtp.mail.yahoo.com
SMTP_PORT=587
SENDER_EMAIL=your-email@yahoo.com
SENDER_PASSWORD=your-yahoo-app-password
```

**Note:** Yahoo also requires an app-specific password. Generate one at: https://login.yahoo.com/account/security

---

## 🧪 Testing Email Notifications

### Test 1: Registration Email
1. Start your backend server: `python main.py`
2. Register a new user account
3. Check the registered email inbox for welcome email
4. Verify all links work correctly

### Test 2: Dispute Filed Emails
1. Log in with two different accounts
2. File a dispute from Account A against Account B
3. **Account A** should receive: Dispute Filed Confirmation
4. **Account B** should receive: New Dispute Filed Notification
5. Verify both emails arrive and links work

### Test 3: Dispute Response Emails
1. Log in as Account B (defendant)
2. Accept or reject the dispute
3. **Account A** (plaintiff) should receive the appropriate notification
4. Verify email content and links

---

## 🔍 Troubleshooting

### Emails Not Sending?

**Check 1: Verify Credentials**
```bash
# Check if .env file exists and has correct values
cat backend/.env | grep SENDER
```

**Check 2: Check Backend Logs**
```bash
# Look for email-related errors in the console
# You should see: "Email sent successfully to [email]"
# Or: "Failed to send email: [error message]"
```

**Check 3: Gmail-Specific Issues**
- Ensure 2FA is enabled
- Use App Password, not regular password
- Check "Less secure app access" is OFF (use App Password instead)
- Verify your Gmail account isn't blocked

**Check 4: Firewall/Network**
- Ensure port 587 is not blocked
- Try port 465 with SSL instead:
  ```env
  SMTP_PORT=465
  ```

### Emails Going to Spam?

This is common with SMTP emails. Solutions:
1. **Add sender to contacts** in recipient's email
2. **Mark as "Not Spam"** when first email arrives
3. **Use a professional email domain** (not Gmail) for production
4. **Consider using SendGrid or AWS SES** for production

---

## 📊 Email Templates

All email templates are defined in `backend/email_service.py`. You can customize:
- Email styling (colors, fonts, layout)
- Email content and messaging
- Button links and CTAs
- Footer information

### Customizing Email Templates

Edit `backend/email_service.py` and modify the HTML content in each method:
- `send_registration_welcome()` - Welcome email
- `send_dispute_filed_notification()` - Defendant notification
- `send_dispute_filed_confirmation()` - Plaintiff confirmation
- `send_dispute_accepted_notification()` - Acceptance notification
- `send_dispute_rejected_notification()` - Rejection notification

---

## 🚀 Production Deployment

### For Production, Consider:

1. **Use a Professional Email Service**
   - SendGrid (12,000 free emails/month)
   - AWS SES (62,000 free emails/month)
   - Mailgun (5,000 free emails/month)

2. **Update Email Links**
   - Replace `http://localhost:5173` with your production domain
   - Update in all email templates in `email_service.py`

3. **Add Email Tracking**
   - Track open rates
   - Track click-through rates
   - Monitor bounce rates

4. **Implement Email Queues**
   - Use Celery or similar for async email sending
   - Prevents blocking API responses
   - Handles retry logic for failed emails

---

## 🔐 Security Best Practices

1. **Never commit .env file to Git**
   - Already in `.gitignore`
   - Use environment variables in production

2. **Use App-Specific Passwords**
   - Never use your main email password
   - Revoke app passwords if compromised

3. **Rotate Credentials Regularly**
   - Change app passwords every 90 days
   - Update production secrets accordingly

4. **Monitor Email Logs**
   - Track all sent emails
   - Alert on unusual sending patterns
   - Prevent email spam abuse

---

## 📝 Current Implementation Status

✅ **Implemented:**
- Registration welcome email
- Dispute filed notification (to defendant)
- Dispute filed confirmation (to plaintiff)
- Dispute accepted notification
- Dispute rejected notification
- Professional HTML email templates
- Error handling and logging

⏳ **Future Enhancements:**
- Email verification for new accounts
- Password reset emails
- Dispute resolution confirmation emails
- Weekly digest emails
- Email preferences/unsubscribe

---

## 💡 Quick Start

1. **Copy the example env file:**
   ```bash
   cp backend/.env.example backend/.env
   ```

2. **Edit backend/.env and add your email credentials:**
   ```env
   SENDER_EMAIL=your-email@gmail.com
   SENDER_PASSWORD=your-app-password
   ```

3. **Restart your backend server:**
   ```bash
   cd backend
   python main.py
   ```

4. **Test by registering a new user!**

---

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review backend console logs for errors
3. Verify your email provider settings
4. Test with a different email provider

**Note:** Email notifications will gracefully fail if credentials are not configured. The application will continue to work, but emails won't be sent.
