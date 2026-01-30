# EmailJS Setup Guide

EmailJS allows you to send emails directly from JavaScript without a backend server.

## Step 1: Create EmailJS Account

1. Go to https://www.emailjs.com/
2. Click "Sign Up" and create a free account
3. Verify your email address

## Step 2: Add Email Service

1. After logging in, go to **Email Services**
2. Click **Add New Service**
3. Choose your email provider (Gmail recommended):
   - **Gmail**: Click on Gmail icon
   - **Outlook**: Click on Outlook icon
   - **Yahoo**: Click on Yahoo icon
4. Click **Connect Account** and authorize EmailJS
5. Copy your **Service ID** (e.g., `service_abc123`)

## Step 3: Create Email Templates

### Template 1: Registration Welcome Email
1. Go to **Email Templates**
2. Click **Create New Template**
3. **Template Name**: `registration_welcome`
4. **Subject**: `Welcome to AI Dispute Resolver - {{user_name}}!`
5. **Content**:
```html
<h2>🎉 Welcome to AI Dispute Resolver!</h2>

<p>Hello {{user_name}},</p>

<p>Thank you for registering with <strong>AI Dispute Resolver</strong>. We're excited to have you on board!</p>

<p>Our AI-powered platform helps you resolve disputes efficiently and fairly. Here's what you can do:</p>

<div style="background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #10b981;">
    <strong>⚖️ File Disputes</strong><br>
    Submit disputes against other parties with detailed descriptions and evidence.
</div>

<div style="background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #10b981;">
    <strong>🤖 AI-Powered Suggestions</strong><br>
    Get intelligent resolution suggestions based on similar cases and legal precedents.
</div>

<div style="background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #10b981;">
    <strong>💬 Live Chat</strong><br>
    Communicate directly with the other party to reach a resolution.
</div>

<div style="background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #10b981;">
    <strong>📊 Dashboard</strong><br>
    Track all your disputes and their statuses in one place.
</div>

<p>Ready to get started? Log in to your dashboard and explore the platform!</p>

<p><a href="http://localhost:5173/dashboard" style="display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px;">Go to Dashboard</a></p>

<hr>
<p style="color: #6b7280; font-size: 14px;">This is an automated message from AI Dispute Resolver.</p>
<p style="color: #6b7280; font-size: 14px;">If you didn't create this account, please contact our support team immediately.</p>
```
6. Click **Save**
7. Copy the **Template ID** (e.g., `template_registration123`)

### Template 2: Dispute Filed Notification
1. Go to **Email Templates**
2. Click **Create New Template**
3. **Template Name**: `dispute_filed`
4. **Subject**: `New Dispute Filed Against You - {{dispute_title}}`
5. **Content**:
```html
<h2>⚖️ New Dispute Filed Against You</h2>

<p>Hello,</p>

<p>A new dispute has been filed against you on <strong>AI Dispute Resolver</strong>.</p>

<p><strong>Dispute Title:</strong> {{dispute_title}}</p>
<p><strong>Filed by:</strong> {{plaintiff_email}}</p>
<p><strong>Category:</strong> {{category}}</p>

<p>Please log in to your account to review the details and respond to this dispute.</p>

<p><a href="{{dispute_link}}" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px;">View Dispute</a></p>

<hr>
<p style="color: #6b7280; font-size: 14px;">This is an automated message from AI Dispute Resolver. Please do not reply to this email.</p>
```
6. Click **Save**
7. Copy the **Template ID** (e.g., `template_xyz789`)

### Template 3: Dispute Filed Confirmation
1. Create another template
2. **Template Name**: `dispute_filed_confirmation`
3. **Subject**: `Dispute Filed Successfully - {{dispute_title}}`
4. **Content**:
```html
<h2>📝 Dispute Filed Successfully</h2>

<p>Hello,</p>

<p>Your dispute has been successfully filed on <strong>AI Dispute Resolver</strong>.</p>

<p><strong>Dispute Title:</strong> {{dispute_title}}</p>
<p><strong>Against:</strong> {{defendant_email}}</p>
<p><strong>Category:</strong> {{category}}</p>

<p>We have notified the defendant. You will receive an email notification when they respond.</p>

<p><a href="{{dispute_link}}" style="display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px;">View Dispute</a></p>

<hr>
<p style="color: #6b7280; font-size: 14px;">This is an automated message from AI Dispute Resolver.</p>
```
5. Save and copy the **Template ID**

### Template 4: Dispute Accepted
1. Create template: `dispute_accepted`
2. **Subject**: `Dispute Accepted - {{dispute_title}}`
3. **Content**:
```html
<h2>✅ Dispute Accepted</h2>

<p>Hello,</p>

<p>Your dispute has been accepted by the defendant.</p>

<p><strong>Dispute Title:</strong> {{dispute_title}}</p>
<p><strong>Accepted by:</strong> {{defendant_email}}</p>

<p>You can now proceed with the resolution process and communicate via the live chat.</p>

<p><a href="{{dispute_link}}" style="display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px;">View Dispute</a></p>
```

### Template 5: Dispute Rejected
1. Create template: `dispute_rejected`
2. **Subject**: `Dispute Rejected - {{dispute_title}}`
3. **Content**:
```html
<h2>❌ Dispute Rejected</h2>

<p>Hello,</p>

<p>Unfortunately, your dispute has been rejected by the defendant.</p>

<p><strong>Dispute Title:</strong> {{dispute_title}}</p>
<p><strong>Rejected by:</strong> {{defendant_email}}</p>

<p>You may want to consider alternative resolution methods or contact support for assistance.</p>

<p><a href="{{dispute_link}}" style="display: inline-block; padding: 12px 24px; background: #ef4444; color: white; text-decoration: none; border-radius: 6px;">View Dispute</a></p>
```

## Step 4: Get Your Public Key

1. Go to **Account** → **General**
2. Find your **Public Key** (e.g., `user_abc123xyz`)
3. Copy this key

## Step 5: Install EmailJS in Frontend

Open terminal in your `frontend` directory and run:

```bash
npm install @emailjs/browser
```

## Step 6: Create Environment Variables

Create or update `frontend/.env`:

```env
VITE_EMAILJS_SERVICE_ID=service_abc123
VITE_EMAILJS_PUBLIC_KEY=user_abc123xyz
VITE_EMAILJS_TEMPLATE_REGISTRATION=template_registration123
VITE_EMAILJS_TEMPLATE_DISPUTE_FILED=template_filed123
VITE_EMAILJS_TEMPLATE_CONFIRMATION=template_confirm456
VITE_EMAILJS_TEMPLATE_ACCEPTED=template_accept789
VITE_EMAILJS_TEMPLATE_REJECTED=template_reject012
```

Replace with your actual IDs from EmailJS dashboard.

## Step 7: Test Your Setup

1. Restart your frontend dev server
2. File a new dispute
3. Check the recipient's email inbox
4. Check EmailJS dashboard for email logs

## Important Notes

✅ **Free Tier Limits**: 200 emails/month
✅ **No Backend Required**: Emails sent directly from browser
✅ **Email Logs**: View all sent emails in EmailJS dashboard
⚠️ **Security**: Public key is safe to expose in frontend
⚠️ **Rate Limiting**: EmailJS has built-in rate limiting

## Troubleshooting

**Emails not sending?**
- Check browser console for errors
- Verify all IDs are correct in `.env`
- Check EmailJS dashboard for error logs
- Ensure email service is connected

**Emails going to spam?**
- This is common with EmailJS free tier
- Recipients should add your email to contacts
- Consider upgrading to paid tier for better deliverability

## Production Deployment

When deploying to production (Vercel, Netlify, etc.):
1. Add environment variables in your hosting platform
2. Update `dispute_link` URLs to production domain
3. Consider upgrading EmailJS plan for higher limits
