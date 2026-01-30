# Dispute Notification Email Template for EmailJS

This template is for notifying someone when a dispute/case has been filed against them.

---

## SUBJECT LINE:
```
New Dispute Filed Against You - Action Required
```

---

## EMAIL BODY (HTML):

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
            transition: background-color 0.2s;
        }
        .button:hover {
            background-color: #2563eb;
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
                <div class="info-row">
                    <span class="info-label">Filed By:</span> 
                    <span class="info-value">Plaintiff</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Dispute ID:</span> 
                    <span class="info-value">{{dispute_id}}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Filed Date:</span> 
                    <span class="info-value">{{filed_date}}</span>
                </div>
            </div>

            <div class="action-section">
                <div class="action-label">Action:</div>
                <a href="http://localhost:5173/dispute/{{dispute_id}}" class="button">View Dispute Details</a>
            </div>

            <div class="footer">
                <p>This is an automated message from AI Dispute Resolver.</p>
                <p>Please log in to your account to respond to this dispute.</p>
            </div>
        </div>
    </div>
</body>
</html>
```

---

## PLAIN TEXT VERSION (Fallback):

```
New Dispute Filed Against You - Action Required

Hello {{to_name}},

You have received a new update regarding your dispute case. Details are provided below:

Message: A new dispute has been filed against you

Dispute Details:
- Dispute Title: {{dispute_title}}
- Category: {{category}}
- Filed By: Plaintiff
- Dispute ID: {{dispute_id}}
- Filed Date: {{filed_date}}

Action:
View dispute details: http://localhost:5173/dispute/{{dispute_id}}

---
This is an automated message from AI Dispute Resolver.
Please log in to your account to respond to this dispute.
```

---

## HOW TO USE:

### For Dispute Filed Notification:

1. **Go to EmailJS Dashboard** → Email Templates
2. **Edit template**: `template_xqz1j6t` (your dispute template)
3. **Subject**: `New Dispute Filed Against You - Action Required`
4. **Content**: Paste the HTML body above
5. **Click "Save"**
6. **Test it** using the "Test" button

---

## VARIABLES USED:

- `{{to_name}}` - Defendant's name
- `{{to_email}}` - Defendant's email
- `{{dispute_title}}` - Title of the dispute
- `{{category}}` - Dispute category (e.g., "Service", "Business", etc.)
- `{{dispute_id}}` - Unique dispute ID
- `{{filed_date}}` - Date the dispute was filed

All these variables are automatically sent by your code!

---

## DESIGN FEATURES:

✨ **Dark theme** matching your screenshot  
⚠️ **Clear notification** that action is required  
📦 **Info box** with all dispute details  
🔘 **Action button** to view dispute  
📱 **Responsive** design  
🎨 **Professional** blue accent color  

---

## PRODUCTION NOTE:

Before deploying, update the dispute link:
- Change `http://localhost:5173/dispute/{{dispute_id}}` 
- To your production URL: `https://yourdomain.com/dispute/{{dispute_id}}`

---

## TEMPLATE VARIATIONS:

You can create similar templates for:
1. **Dispute Filed** (to defendant) - Use this template
2. **Dispute Confirmation** (to plaintiff) - Change "filed against you" to "filed successfully"
3. **Dispute Accepted** - Change message to "Your dispute has been accepted"
4. **Dispute Rejected** - Change message to "Your dispute has been rejected"

Just modify the "Message" field in the info box for each variation!
