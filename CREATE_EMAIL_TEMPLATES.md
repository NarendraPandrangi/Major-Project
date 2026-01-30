# 🚀 Next Steps: Create Your Email Templates

You currently have:
- ✅ Public Key: `_uzDMgs0cWm5y9F6z`
- ✅ Service ID: `service_fnp3fdu`
- ✅ Contact Us Template: `template_xqz1j6t`

## 📝 You Need to Create 5 Email Templates

Go to https://dashboard.emailjs.com/admin/templates and create these templates:

---

## Template 1: Registration Welcome Email

**Template Name:** `registration_welcome`

**Subject:** `Welcome to AI Dispute Resolver!`

**Content (HTML):**
```html
<h2>🎉 Welcome to AI Dispute Resolver!</h2>

<p>Hello {{user_name}},</p>

<p>Thank you for registering with <strong>AI Dispute Resolver</strong>. We're excited to have you on board!</p>

<p>Our AI-powered platform helps you resolve disputes efficiently and fairly. Here's what you can do:</p>

<div style="background: #f0fdf4; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #10b981;">
    <strong>⚖️ File Disputes</strong><br>
    Submit disputes against other parties with detailed descriptions and evidence.
</div>

<div style="background: #f0fdf4; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #10b981;">
    <strong>🤖 AI-Powered Suggestions</strong><br>
    Get intelligent resolution suggestions based on similar cases and legal precedents.
</div>

<div style="background: #f0fdf4; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #10b981;">
    <strong>💬 Live Chat</strong><br>
    Communicate directly with the other party to reach a resolution.
</div>

<div style="background: #f0fdf4; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #10b981;">
    <strong>📊 Dashboard</strong><br>
    Track all your disputes and their statuses in one place.
</div>

<p>Ready to get started? Log in to your dashboard and explore the platform!</p>

<p><a href="http://localhost:5173/dashboard" style="display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px;">Go to Dashboard</a></p>

<hr>
<p style="color: #6b7280; font-size: 14px;">This is an automated message from AI Dispute Resolver.</p>
<p style="color: #6b7280; font-size: 14px;">If you didn't create this account, please contact our support team immediately.</p>
```

**After creating, copy the Template ID and update `.env`:**
```
VITE_EMAILJS_TEMPLATE_REGISTRATION=your_new_template_id
```

---

## Template 2: Dispute Filed Notification (to Defendant)

**Template Name:** `dispute_filed`

**Subject:** `New Dispute Filed Against You - {{dispute_title}}`

**Content (HTML):**
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

**After creating, copy the Template ID and update `.env`:**
```
VITE_EMAILJS_TEMPLATE_DISPUTE_FILED=your_new_template_id
```

---

## Template 3: Dispute Filed Confirmation (to Plaintiff)

**Template Name:** `dispute_filed_confirmation`

**Subject:** `Dispute Filed Successfully - {{dispute_title}}`

**Content (HTML):**
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

**After creating, copy the Template ID and update `.env`:**
```
VITE_EMAILJS_TEMPLATE_CONFIRMATION=your_new_template_id
```

---

## Template 4: Dispute Accepted

**Template Name:** `dispute_accepted`

**Subject:** `Dispute Accepted - {{dispute_title}}`

**Content (HTML):**
```html
<h2>✅ Dispute Accepted</h2>

<p>Hello,</p>

<p>Your dispute has been accepted by the defendant.</p>

<p><strong>Dispute Title:</strong> {{dispute_title}}</p>
<p><strong>Accepted by:</strong> {{defendant_email}}</p>

<p>You can now proceed with the resolution process and communicate via the live chat.</p>

<p><a href="{{dispute_link}}" style="display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px;">View Dispute</a></p>

<hr>
<p style="color: #6b7280; font-size: 14px;">This is an automated message from AI Dispute Resolver.</p>
```

**After creating, copy the Template ID and update `.env`:**
```
VITE_EMAILJS_TEMPLATE_ACCEPTED=your_new_template_id
```

---

## Template 5: Dispute Rejected

**Template Name:** `dispute_rejected`

**Subject:** `Dispute Rejected - {{dispute_title}}`

**Content (HTML):**
```html
<h2>❌ Dispute Rejected</h2>

<p>Hello,</p>

<p>Unfortunately, your dispute has been rejected by the defendant.</p>

<p><strong>Dispute Title:</strong> {{dispute_title}}</p>
<p><strong>Rejected by:</strong> {{defendant_email}}</p>

<p>You may want to consider alternative resolution methods or contact support for assistance.</p>

<p><a href="{{dispute_link}}" style="display: inline-block; padding: 12px 24px; background: #ef4444; color: white; text-decoration: none; border-radius: 6px;">View Dispute</a></p>

<hr>
<p style="color: #6b7280; font-size: 14px;">This is an automated message from AI Dispute Resolver.</p>
```

**After creating, copy the Template ID and update `.env`:**
```
VITE_EMAILJS_TEMPLATE_REJECTED=your_new_template_id
```

---

## 🔄 After Creating All Templates

Update your `frontend/.env` file with the actual template IDs:

```env
VITE_API_URL=http://localhost:8000

# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=service_fnp3fdu
VITE_EMAILJS_PUBLIC_KEY=_uzDMgs0cWm5y9F6z

# Email Templates (replace with your actual template IDs)
VITE_EMAILJS_TEMPLATE_REGISTRATION=template_abc123
VITE_EMAILJS_TEMPLATE_DISPUTE_FILED=template_def456
VITE_EMAILJS_TEMPLATE_CONFIRMATION=template_ghi789
VITE_EMAILJS_TEMPLATE_ACCEPTED=template_jkl012
VITE_EMAILJS_TEMPLATE_REJECTED=template_mno345
```

---

## 🧪 Testing

After creating all templates and updating `.env`:

1. **Restart your frontend server:**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

2. **Test Registration Email:**
   - Go to http://localhost:5173/register
   - Register with your email
   - Check inbox for welcome email

3. **Test Dispute Emails:**
   - Create 2 accounts
   - File a dispute from one against the other
   - Both should receive emails

---

## 📋 Quick Checklist

- [ ] Create Template 1: `registration_welcome`
- [ ] Create Template 2: `dispute_filed`
- [ ] Create Template 3: `dispute_filed_confirmation`
- [ ] Create Template 4: `dispute_accepted`
- [ ] Create Template 5: `dispute_rejected`
- [ ] Update `frontend/.env` with all template IDs
- [ ] Restart frontend server
- [ ] Test registration email
- [ ] Test dispute filing emails

---

## 🎯 Current Status

✅ EmailJS account configured  
✅ Service connected (Gmail)  
✅ Public key added to `.env`  
✅ Service ID added to `.env`  
⏳ Need to create 5 email templates  
⏳ Need to update `.env` with template IDs  

**You're almost there!** Just create the 5 templates and you'll be all set! 🚀
