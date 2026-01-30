# ✅ EmailJS Setup - Quick Reference

## 🎯 Current Configuration

```
✅ Public Key: _uzDMgs0cWm5y9F6z
✅ Service ID: service_fnp3fdu
✅ .env file created
✅ Frontend server restarted
⏳ Need to create 5 email templates
```

---

## 📝 What You Need to Do Now

### Step 1: Go to EmailJS Dashboard
🔗 https://dashboard.emailjs.com/admin/templates

### Step 2: Create 5 Templates
Click "Create New Template" for each:

| # | Template Name | Template ID Variable | Subject |
|---|---------------|---------------------|---------|
| 1 | `registration_welcome` | VITE_EMAILJS_TEMPLATE_REGISTRATION | Welcome to AI Dispute Resolver! |
| 2 | `dispute_filed` | VITE_EMAILJS_TEMPLATE_DISPUTE_FILED | New Dispute Filed Against You |
| 3 | `dispute_filed_confirmation` | VITE_EMAILJS_TEMPLATE_CONFIRMATION | Dispute Filed Successfully |
| 4 | `dispute_accepted` | VITE_EMAILJS_TEMPLATE_ACCEPTED | Dispute Accepted |
| 5 | `dispute_rejected` | VITE_EMAILJS_TEMPLATE_REJECTED | Dispute Rejected |

**📄 Full HTML code for each template is in:** `CREATE_EMAIL_TEMPLATES.md`

### Step 3: Update .env File
After creating each template, copy its Template ID and update `frontend/.env`:

```env
VITE_EMAILJS_TEMPLATE_REGISTRATION=your_template_id_1
VITE_EMAILJS_TEMPLATE_DISPUTE_FILED=your_template_id_2
VITE_EMAILJS_TEMPLATE_CONFIRMATION=your_template_id_3
VITE_EMAILJS_TEMPLATE_ACCEPTED=your_template_id_4
VITE_EMAILJS_TEMPLATE_REJECTED=your_template_id_5
```

### Step 4: Restart Frontend (if needed)
```bash
# Stop server: Ctrl+C
npm run dev
```

---

## 🧪 Test Your Setup

### Test 1: Registration Email
```
1. Go to: http://localhost:5173/register
2. Register with your email
3. Check inbox ✉️
```

### Test 2: Dispute Emails
```
1. Create 2 accounts (different emails)
2. File dispute from Account A → Account B
3. Check both inboxes:
   - Account A: Confirmation ✉️
   - Account B: Notification ✉️
```

---

## 📊 Email Flow

```
Registration → Welcome Email
    ↓
User registers
    ↓
Email sent to user ✉️


Dispute Filing → 2 Emails
    ↓
Plaintiff files dispute
    ↓
Email to Defendant ✉️
Email to Plaintiff ✉️
```

---

## 🔍 Troubleshooting

### Emails not sending?
1. Open browser console (F12)
2. Look for EmailJS errors
3. Check template IDs in `.env`
4. Verify templates exist in EmailJS dashboard

### Check Email Logs
🔗 https://dashboard.emailjs.com/admin/logs

---

## 📚 Documentation Files

- **`CREATE_EMAIL_TEMPLATES.md`** ← **START HERE** - Template HTML code
- **`EMAILJS_SETUP.md`** - Full setup guide
- **`IMPLEMENTATION_SUMMARY.md`** - Technical details
- **`EMAILJS_QUICK_SETUP.md`** - Quick reference

---

## ✨ What's Working Now

✅ EmailJS package installed  
✅ Email service utility created  
✅ Registration email integration  
✅ Dispute filing email integration  
✅ Environment configured  
✅ Frontend server running  

**Just create the 5 templates and you're done!** 🚀

---

## 🎯 Template Variables Reference

When creating templates, use these variables:

**Registration Email:**
- `{{user_name}}` - User's name
- `{{to_email}}` - User's email

**Dispute Emails:**
- `{{dispute_title}}` - Title of dispute
- `{{plaintiff_email}}` - Plaintiff's email
- `{{defendant_email}}` - Defendant's email
- `{{category}}` - Dispute category
- `{{dispute_link}}` - Link to view dispute

---

## 💡 Pro Tips

1. **Copy-paste the HTML** from `CREATE_EMAIL_TEMPLATES.md` directly into EmailJS
2. **Test each template** using EmailJS's "Test it" feature
3. **Save Template IDs** immediately after creating each template
4. **Update .env** as you go to avoid forgetting IDs

---

**Need help?** Open `CREATE_EMAIL_TEMPLATES.md` for step-by-step instructions! 📖
