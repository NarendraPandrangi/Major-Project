# Welcome Email Template for EmailJS

Copy and paste this into your EmailJS template editor.

---

## SUBJECT LINE:
```
Welcome to AI Dispute Resolver, {{name}}! 🎉
```

---

## EMAIL BODY (HTML):

```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 600;
        }
        .header p {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 20px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
        }
        .message {
            font-size: 16px;
            color: #4b5563;
            margin-bottom: 30px;
        }
        .features {
            background: #f9fafb;
            border-radius: 8px;
            padding: 20px;
            margin: 30px 0;
        }
        .feature {
            display: flex;
            align-items: start;
            margin-bottom: 20px;
            padding: 15px;
            background: white;
            border-radius: 6px;
            border-left: 4px solid #3b82f6;
        }
        .feature:last-child {
            margin-bottom: 0;
        }
        .feature-icon {
            font-size: 24px;
            margin-right: 15px;
            min-width: 30px;
        }
        .feature-content h3 {
            margin: 0 0 5px 0;
            font-size: 16px;
            color: #1f2937;
        }
        .feature-content p {
            margin: 0;
            font-size: 14px;
            color: #6b7280;
        }
        .cta-button {
            display: inline-block;
            padding: 14px 32px;
            background: linear-gradient(135deg, #3b82f6, #8b5cf6);
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            text-align: center;
        }
        .info-box {
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
        }
        .info-box strong {
            color: #1e40af;
        }
        .footer {
            background: #f9fafb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        .footer p {
            margin: 5px 0;
            font-size: 14px;
            color: #6b7280;
        }
        .footer a {
            color: #3b82f6;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>⚖️ Welcome to AI Dispute Resolver!</h1>
            <p>Your journey to fair conflict resolution starts here</p>
        </div>

        <!-- Content -->
        <div class="content">
            <div class="greeting">Hello {{name}}! 👋</div>
            
            <div class="message">
                Thank you for joining <strong>AI Dispute Resolver</strong>! We're excited to have you on board. 
                Our AI-powered platform is designed to help you resolve disputes efficiently, fairly, and transparently.
            </div>

            <!-- Account Info -->
            <div class="info-box">
                <strong>Your Account Details:</strong><br>
                📧 Email: {{to_email}}<br>
                🆔 User ID: {{user_id}}<br>
                📅 Registered: {{registration_date}}
            </div>

            <!-- Features -->
            <div class="features">
                <div class="feature">
                    <div class="feature-icon">⚖️</div>
                    <div class="feature-content">
                        <h3>File Disputes</h3>
                        <p>Submit disputes with detailed descriptions and supporting evidence</p>
                    </div>
                </div>

                <div class="feature">
                    <div class="feature-icon">🤖</div>
                    <div class="feature-content">
                        <h3>AI-Powered Suggestions</h3>
                        <p>Get intelligent resolution suggestions based on similar cases and legal precedents</p>
                    </div>
                </div>

                <div class="feature">
                    <div class="feature-icon">💬</div>
                    <div class="feature-content">
                        <h3>Live Chat</h3>
                        <p>Communicate directly with the other party to reach a mutual resolution</p>
                    </div>
                </div>

                <div class="feature">
                    <div class="feature-icon">📊</div>
                    <div class="feature-content">
                        <h3>Dashboard</h3>
                        <p>Track all your disputes and their statuses in one centralized location</p>
                    </div>
                </div>
            </div>

            <!-- CTA Button -->
            <center>
                <a href="http://localhost:5173/dashboard" class="cta-button">
                    Go to Your Dashboard →
                </a>
            </center>

            <div class="message" style="margin-top: 30px;">
                Ready to get started? Log in to your dashboard and explore the platform. 
                If you have any questions, our support team is here to help!
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p><strong>AI Dispute Resolver</strong></p>
            <p>Fair, Fast, and AI-Powered Conflict Resolution</p>
            <p style="margin-top: 15px; font-size: 12px;">
                If you didn't create this account, please contact our support team immediately.
            </p>
            <p style="font-size: 12px; color: #9ca3af;">
                This is an automated message. Please do not reply to this email.
            </p>
        </div>
    </div>
</body>
</html>
```

---

## PLAIN TEXT VERSION (Optional Fallback):

```
Welcome to AI Dispute Resolver, {{name}}!

Hello {{name}},

Thank you for joining AI Dispute Resolver! We're excited to have you on board.

Your Account Details:
- Email: {{to_email}}
- User ID: {{user_id}}
- Registered: {{registration_date}}

What You Can Do:

⚖️ File Disputes
Submit disputes with detailed descriptions and supporting evidence

🤖 AI-Powered Suggestions
Get intelligent resolution suggestions based on similar cases

💬 Live Chat
Communicate directly with the other party to reach a resolution

📊 Dashboard
Track all your disputes and their statuses in one place

Ready to get started? Visit your dashboard: http://localhost:5173/dashboard

If you have any questions, our support team is here to help!

Best regards,
AI Dispute Resolver Team

---
If you didn't create this account, please contact our support team immediately.
This is an automated message. Please do not reply to this email.
```

---

## HOW TO USE:

1. **Go to EmailJS Dashboard** → Email Templates
2. **Edit template**: `template_etb20s9`
3. **Subject**: Paste the subject line
4. **Content**: Paste the HTML body
5. **Click "Save"**
6. **Test it** using the "Test" button
7. **Try registering** a new user in your app

---

## VARIABLES USED:

- `{{name}}` - User's name
- `{{to_email}}` - User's email address
- `{{user_id}}` - User ID from database
- `{{registration_date}}` - Registration date

All these variables are automatically sent by your code!

---

## PRODUCTION NOTE:

Before deploying to production, update the dashboard link:
- Change `http://localhost:5173/dashboard` 
- To your production URL: `https://yourdomain.com/dashboard`
