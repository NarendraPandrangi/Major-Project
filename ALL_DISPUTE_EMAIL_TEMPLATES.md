# All Dispute Email Templates for EmailJS

Complete set of email templates for all dispute notifications.

---

## 1️⃣ DISPUTE FILED (Notification to Defendant)

**Template ID**: `template_xqz1j6t`

**Subject**: `New Dispute Filed Against You - Action Required`

**HTML Body**:
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #1a1a1a;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            padding: 0;
        }
        .content {
            background-color: #2d2d2d;
            border-radius: 12px;
            padding: 40px;
            color: #e5e5e5;
        }
        .title {
            color: #3b82f6;
            font-size: 28px;
            font-weight: 600;
            margin: 0 0 30px 0;
            text-align: center;
        }
        .greeting {
            font-size: 16px;
            color: #d1d5db;
            margin-bottom: 20px;
        }
        .message {
            font-size: 15px;
            color: #d1d5db;
            line-height: 1.6;
            margin-bottom: 30px;
        }
        .info-box {
            background-color: #1e293b;
            border: 1px solid #334155;
            border-radius: 8px;
            padding: 25px;
            margin: 30px 0;
        }
        .info-row {
            margin-bottom: 12px;
            font-size: 14px;
        }
        .info-row:last-child {
            margin-bottom: 0;
        }
        .info-label {
            color: #94a3b8;
            font-weight: 500;
        }
        .info-value {
            color: #e5e5e5;
        }
        .action-section {
            margin: 30px 0;
        }
        .action-label {
            color: #e5e5e5;
            font-weight: 600;
            margin-bottom: 15px;
            font-size: 15px;
        }
        .button {
            display: inline-block;
            background-color: #3b82f6;
            color: white;
            padding: 12px 28px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            font-size: 15px;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #374151;
            color: #9ca3af;
            font-size: 13px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="content">
            <h1 class="title">New Notification</h1>
            
            <div class="greeting">Hello {{to_name}},</div>
            
            <div class="message">
                You have received a new update regarding your dispute case. Details are provided below:
            </div>

            <div class="info-box">
                <div class="info-row">
                    <span class="info-label">Message:</span> 
                    <span class="info-value">A new dispute has been filed against you</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Dispute Title:</span> 
                    <span class="info-value">{{dispute_title}}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Category:</span> 
                    <span class="info-value">{{category}}</span>
                </div>
            </div>

            <div class="action-section">
                <div class="action-label">Action:</div>
                <a href="http://localhost:5173/dispute/{{dispute_id}}" class="button">View Dispute Details</a>
            </div>

            <div class="footer">
                <p>This is an automated message from AI Dispute Resolver.</p>
            </div>
        </div>
    </div>
</body>
</html>
```

---

## 2️⃣ DISPUTE ACCEPTED (Notification to Plaintiff)

**Subject**: `Defendant Accepted Your Case`

**HTML Body**:
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #1a1a1a;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            padding: 0;
        }
        .content {
            background-color: #2d2d2d;
            border-radius: 12px;
            padding: 40px;
            color: #e5e5e5;
        }
        .title {
            color: #10b981;
            font-size: 28px;
            font-weight: 600;
            margin: 0 0 30px 0;
            text-align: center;
        }
        .greeting {
            font-size: 16px;
            color: #d1d5db;
            margin-bottom: 20px;
        }
        .message {
            font-size: 15px;
            color: #d1d5db;
            line-height: 1.6;
            margin-bottom: 30px;
        }
        .info-box {
            background-color: #1e293b;
            border: 1px solid #334155;
            border-radius: 8px;
            padding: 25px;
            margin: 30px 0;
        }
        .info-row {
            margin-bottom: 12px;
            font-size: 14px;
        }
        .info-row:last-child {
            margin-bottom: 0;
        }
        .info-label {
            color: #94a3b8;
            font-weight: 500;
        }
        .info-value {
            color: #e5e5e5;
        }
        .action-section {
            margin: 30px 0;
        }
        .action-label {
            color: #e5e5e5;
            font-weight: 600;
            margin-bottom: 15px;
            font-size: 15px;
        }
        .button {
            display: inline-block;
            background-color: #10b981;
            color: white;
            padding: 12px 28px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            font-size: 15px;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #374151;
            color: #9ca3af;
            font-size: 13px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="content">
            <h1 class="title">New Notification</h1>
            
            <div class="greeting">Hello {{to_name}},</div>
            
            <div class="message">
                You have received a new update regarding your dispute case. Details are provided below:
            </div>

            <div class="info-box">
                <div class="info-row">
                    <span class="info-label">Message:</span> 
                    <span class="info-value">Defendant accepted your case</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Dispute Title:</span> 
                    <span class="info-value">{{dispute_title}}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Category:</span> 
                    <span class="info-value">{{category}}</span>
                </div>
            </div>

            <div class="action-section">
                <div class="action-label">Action:</div>
                <a href="http://localhost:5173/dispute/{{dispute_id}}" class="button">View Dispute Details</a>
            </div>

            <div class="footer">
                <p>This is an automated message from AI Dispute Resolver.</p>
            </div>
        </div>
    </div>
</body>
</html>
```

---

## 3️⃣ DISPUTE REJECTED (Notification to Plaintiff)

**Subject**: `Defendant Rejected Your Case`

**HTML Body**:
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #1a1a1a;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            padding: 0;
        }
        .content {
            background-color: #2d2d2d;
            border-radius: 12px;
            padding: 40px;
            color: #e5e5e5;
        }
        .title {
            color: #ef4444;
            font-size: 28px;
            font-weight: 600;
            margin: 0 0 30px 0;
            text-align: center;
        }
        .greeting {
            font-size: 16px;
            color: #d1d5db;
            margin-bottom: 20px;
        }
        .message {
            font-size: 15px;
            color: #d1d5db;
            line-height: 1.6;
            margin-bottom: 30px;
        }
        .info-box {
            background-color: #1e293b;
            border: 1px solid #334155;
            border-radius: 8px;
            padding: 25px;
            margin: 30px 0;
        }
        .info-row {
            margin-bottom: 12px;
            font-size: 14px;
        }
        .info-row:last-child {
            margin-bottom: 0;
        }
        .info-label {
            color: #94a3b8;
            font-weight: 500;
        }
        .info-value {
            color: #e5e5e5;
        }
        .action-section {
            margin: 30px 0;
        }
        .action-label {
            color: #e5e5e5;
            font-weight: 600;
            margin-bottom: 15px;
            font-size: 15px;
        }
        .button {
            display: inline-block;
            background-color: #ef4444;
            color: white;
            padding: 12px 28px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            font-size: 15px;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #374151;
            color: #9ca3af;
            font-size: 13px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="content">
            <h1 class="title">New Notification</h1>
            
            <div class="greeting">Hello {{to_name}},</div>
            
            <div class="message">
                You have received a new update regarding your dispute case. Details are provided below:
            </div>

            <div class="info-box">
                <div class="info-row">
                    <span class="info-label">Message:</span> 
                    <span class="info-value">Defendant rejected your case</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Dispute Title:</span> 
                    <span class="info-value">{{dispute_title}}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Category:</span> 
                    <span class="info-value">{{category}}</span>
                </div>
            </div>

            <div class="action-section">
                <div class="action-label">Action:</div>
                <a href="http://localhost:5173/dispute/{{dispute_id}}" class="button">View Dispute Details</a>
            </div>

            <div class="footer">
                <p>This is an automated message from AI Dispute Resolver.</p>
            </div>
        </div>
    </div>
</body>
</html>
```

---

## 4️⃣ DISPUTE CONFIRMATION (To Plaintiff after filing)

**Subject**: `Your Dispute Has Been Filed Successfully`

**HTML Body**:
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #1a1a1a;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            padding: 0;
        }
        .content {
            background-color: #2d2d2d;
            border-radius: 12px;
            padding: 40px;
            color: #e5e5e5;
        }
        .title {
            color: #3b82f6;
            font-size: 28px;
            font-weight: 600;
            margin: 0 0 30px 0;
            text-align: center;
        }
        .greeting {
            font-size: 16px;
            color: #d1d5db;
            margin-bottom: 20px;
        }
        .message {
            font-size: 15px;
            color: #d1d5db;
            line-height: 1.6;
            margin-bottom: 30px;
        }
        .info-box {
            background-color: #1e293b;
            border: 1px solid #334155;
            border-radius: 8px;
            padding: 25px;
            margin: 30px 0;
        }
        .info-row {
            margin-bottom: 12px;
            font-size: 14px;
        }
        .info-row:last-child {
            margin-bottom: 0;
        }
        .info-label {
            color: #94a3b8;
            font-weight: 500;
        }
        .info-value {
            color: #e5e5e5;
        }
        .action-section {
            margin: 30px 0;
        }
        .action-label {
            color: #e5e5e5;
            font-weight: 600;
            margin-bottom: 15px;
            font-size: 15px;
        }
        .button {
            display: inline-block;
            background-color: #3b82f6;
            color: white;
            padding: 12px 28px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            font-size: 15px;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #374151;
            color: #9ca3af;
            font-size: 13px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="content">
            <h1 class="title">New Notification</h1>
            
            <div class="greeting">Hello {{to_name}},</div>
            
            <div class="message">
                You have received a new update regarding your dispute case. Details are provided below:
            </div>

            <div class="info-box">
                <div class="info-row">
                    <span class="info-label">Message:</span> 
                    <span class="info-value">Your dispute has been filed successfully</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Dispute Title:</span> 
                    <span class="info-value">{{dispute_title}}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Category:</span> 
                    <span class="info-value">{{category}}</span>
                </div>
            </div>

            <div class="action-section">
                <div class="action-label">Action:</div>
                <a href="http://localhost:5173/dispute/{{dispute_id}}" class="button">View Dispute Details</a>
            </div>

            <div class="footer">
                <p>This is an automated message from AI Dispute Resolver.</p>
            </div>
        </div>
    </div>
</body>
</html>
```

---

## SUMMARY OF TEMPLATES

| Template | Message | Title Color | Button Color | Use Case |
|----------|---------|-------------|--------------|----------|
| Dispute Filed | "A new dispute has been filed against you" | Blue (#3b82f6) | Blue | Notify defendant |
| Dispute Accepted | "Defendant accepted your case" | Green (#10b981) | Green | Notify plaintiff |
| Dispute Rejected | "Defendant rejected your case" | Red (#ef4444) | Red | Notify plaintiff |
| Dispute Confirmation | "Your dispute has been filed successfully" | Blue (#3b82f6) | Blue | Confirm to plaintiff |

---

## VARIABLES USED IN ALL TEMPLATES:

- `{{to_name}}` - Recipient's name
- `{{to_email}}` - Recipient's email
- `{{dispute_title}}` - Title of the dispute
- `{{category}}` - Dispute category
- `{{dispute_id}}` - Unique dispute ID

---

## SETUP INSTRUCTIONS:

Since you're using the same template ID (`template_xqz1j6t`) for all dispute emails, you can use **Template #1 (Dispute Filed)** as your base template. The message will be dynamic based on the context.

Alternatively, create separate templates in EmailJS for each type and update your `.env`:
```env
VITE_EMAILJS_TEMPLATE_DISPUTE_FILED=template_xqz1j6t
VITE_EMAILJS_TEMPLATE_CONFIRMATION=template_abc123
VITE_EMAILJS_TEMPLATE_ACCEPTED=template_def456
VITE_EMAILJS_TEMPLATE_REJECTED=template_ghi789
```
