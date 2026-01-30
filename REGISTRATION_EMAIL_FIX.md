# Quick Fix: Registration Welcome Email Template

## 🚨 Problem
You're seeing a default "Contact Us" message instead of a welcome message because all email templates are using the same template ID (`template_xqz1j6t`).

## ✅ Solution Options

### **Option 1: Create a New Registration Template (Recommended)**

Go to https://dashboard.emailjs.com/admin/templates and create a new template:

#### **Template Settings:**
- **Template Name:** `registration_welcome`
- **Subject:** `Welcome to AI Dispute Resolver, {{user_name}}!`

#### **Email Body (HTML):**
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
    <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        
        <h1 style="color: #10b981; margin-bottom: 20px;">🎉 Welcome to AI Dispute Resolver!</h1>
        
        <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            Hello <strong>{{user_name}}</strong>,
        </p>
        
        <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            Thank you for registering with <strong>AI Dispute Resolver</strong>. We're excited to have you on board!
        </p>
        
        <p style="font-size: 16px; color: #374151; line-height: 1.6;">
            Our AI-powered platform helps you resolve disputes efficiently and fairly. Here's what you can do:
        </p>
        
        <div style="background: #f0fdf4; padding: 15px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #10b981;">
            <strong style="color: #059669;">⚖️ File Disputes</strong><br>
            <span style="color: #6b7280;">Submit disputes against other parties with detailed descriptions and evidence.</span>
        </div>
        
        <div style="background: #f0fdf4; padding: 15px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #10b981;">
            <strong style="color: #059669;">🤖 AI-Powered Suggestions</strong><br>
            <span style="color: #6b7280;">Get intelligent resolution suggestions based on similar cases and legal precedents.</span>
        </div>
        
        <div style="background: #f0fdf4; padding: 15px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #10b981;">
            <strong style="color: #059669;">💬 Live Chat</strong><br>
            <span style="color: #6b7280;">Communicate directly with the other party to reach a resolution.</span>
        </div>
        
        <div style="background: #f0fdf4; padding: 15px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #10b981;">
            <strong style="color: #059669;">📊 Dashboard</strong><br>
            <span style="color: #6b7280;">Track all your disputes and their statuses in one place.</span>
        </div>
        
        <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-top: 25px;">
            Ready to get started? Log in to your dashboard and explore the platform!
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:5173/dashboard" 
               style="display: inline-block; padding: 14px 28px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                Go to Dashboard
            </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        
        <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
            This is an automated message from AI Dispute Resolver.
        </p>
        <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
            If you didn't create this account, please contact our support team immediately.
        </p>
        
    </div>
</div>
```

#### **After Creating:**
1. Click **Save**
2. Copy the **Template ID** (e.g., `template_abc123`)
3. Update your `frontend/.env` file:
   ```env
   VITE_EMAILJS_TEMPLATE_REGISTRATION=template_abc123
   ```

---

### **Option 2: Modify Existing Template (Quick Fix)**

If you want to use your existing `template_xqz1j6t` for registration, you need to:

1. Go to https://dashboard.emailjs.com/admin/templates
2. Edit template `template_xqz1j6t`
3. Make sure it uses these variables:
   - `{{to_email}}` - Recipient email
   - `{{user_name}}` - User's name
   - `{{to_name}}` - User's name (alternative)

**Example simple template:**
```html
<div style="font-family: Arial, sans-serif; padding: 20px;">
    <h2>Welcome to AI Dispute Resolver!</h2>
    <p>Hello {{user_name}},</p>
    <p>Thank you for registering. We're excited to have you on board!</p>
    <p>You can now log in and start using our platform.</p>
    <p><a href="http://localhost:5173/dashboard">Go to Dashboard</a></p>
</div>
```

---

## 🧪 Testing

After creating/updating the template:

1. **Restart frontend server:**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

2. **Test registration:**
   - Go to http://localhost:5173/register
   - Register with a new email
   - Check your inbox

3. **Check browser console:**
   - Open DevTools (F12)
   - Look for: "Registration email sent successfully"
   - If you see errors, check the template ID

---

## 📋 Template Variables Reference

The registration email sends these variables:

| Variable | Value | Example |
|----------|-------|---------|
| `{{to_email}}` | User's email | `user@example.com` |
| `{{to_name}}` | User's name | `John Doe` |
| `{{user_name}}` | User's name | `John Doe` |

Make sure your template uses at least one of these!

---

## 🔍 Troubleshooting

### Still seeing default message?

1. **Check template ID:**
   - Make sure `VITE_EMAILJS_TEMPLATE_REGISTRATION` has the correct template ID
   - It should be different from `template_xqz1j6t` if you created a new template

2. **Check template variables:**
   - Open your template in EmailJS
   - Make sure it uses `{{user_name}}` or `{{to_name}}`

3. **Restart server:**
   - Environment variables only load on server start
   - Stop and restart: `npm run dev`

4. **Check browser console:**
   - Look for EmailJS errors
   - Check what parameters are being sent

---

## ✅ Recommended Next Steps

1. **Create the registration template** using the HTML above
2. **Get the new template ID**
3. **Update `.env` file** with the new template ID
4. **Restart frontend server**
5. **Test registration**

---

**Need help?** The full HTML template is above - just copy and paste it into EmailJS!
