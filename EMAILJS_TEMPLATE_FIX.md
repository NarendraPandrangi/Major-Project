# 🔧 EmailJS Template Configuration Fix

## The Problem
**Error 422** means EmailJS rejected the email because the template variables don't match what your template expects.

## Solution: Update Your EmailJS Template

### Step 1: Go to EmailJS Dashboard
1. Go to https://dashboard.emailjs.com/
2. Click on **Email Templates**
3. Find and edit template: `template_ol06yk5` (Welcome template)

### Step 2: Available Variables
Your code now sends these variables (you can use ANY of these in your template):

```
{{to_name}}           - Recipient's name
{{to_email}}          - Recipient's email address
{{user_name}}         - Same as to_name (alternative)
{{user_email}}        - Same as to_email (alternative)
{{user_id}}           - User ID from database
{{registration_date}} - Date of registration
{{message}}           - Welcome message
```

### Step 3: Example Template

Here's a simple template you can use:

**Subject:**
```
Welcome to AI Dispute Resolver, {{to_name}}!
```

**Body:**
```html
Hello {{to_name}},

{{message}}

Your account details:
- Email: {{to_email}}
- User ID: {{user_id}}
- Registration Date: {{registration_date}}

Thank you for joining AI Dispute Resolver!

Best regards,
The AI Dispute Resolver Team
```

### Step 4: Minimal Template (If Above Doesn't Work)

If you're still getting errors, use this **absolute minimum** template:

**Subject:**
```
Welcome!
```

**Body:**
```
Hello {{to_name}},

Welcome to AI Dispute Resolver!

Email: {{to_email}}
```

### Step 5: Test the Template

1. In EmailJS dashboard, click **Test it** button on your template
2. Fill in test values:
   - `to_name`: Test User
   - `to_email`: your-email@example.com
3. Click **Send Test**
4. Check if email arrives

### Step 6: Save and Try Again

1. **Save** your template in EmailJS dashboard
2. Go back to your app
3. **Register a new user** with a real email
4. Check browser console for success message
5. Check email inbox (including spam)

## Common Template Variable Issues

### ❌ Wrong Variable Names
If your template uses `{{name}}` but code sends `to_name`, it won't work.

**Solution:** Update your template to use the variable names listed above.

### ❌ Required Variables Missing
If your template requires a variable that we don't send, you'll get 422 error.

**Solution:** Either:
- Add the variable to the code, OR
- Remove it from the template, OR
- Make it optional in the template

### ❌ Template Not Saved
Changes to templates need to be saved in EmailJS dashboard.

**Solution:** Click the **Save** button after editing.

## Quick Checklist

- [ ] Opened EmailJS dashboard
- [ ] Found template `template_ol06yk5`
- [ ] Updated template to use variables: `{{to_name}}`, `{{to_email}}`, `{{message}}`
- [ ] Saved the template
- [ ] Tested template in EmailJS dashboard
- [ ] Test email received successfully
- [ ] Tried registering in app again
- [ ] Checked browser console for success
- [ ] Checked email inbox (and spam folder)

## Alternative: Use EmailJS Auto-Reply Template

If you want to skip custom configuration:

1. In EmailJS dashboard, create a new template
2. Use the **"Contact Form"** preset
3. It comes with standard variables pre-configured
4. Copy the new template ID
5. Update your `.env`:
   ```
   VITE_EMAILJS_TEMPLATE_REGISTRATION=your_new_template_id
   ```
6. Restart dev server

## Still Not Working?

Share a screenshot of:
1. Your EmailJS template editor (showing the variables used)
2. Browser console output when registering
3. The exact error message

This will help identify the exact variable mismatch!
