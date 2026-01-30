# Email Notification Setup Guide

This application sends automated email notifications for dispute events using SMTP.

## Features

The following email notifications are automatically sent:

1. **Dispute Filed** - Sent to the defendant when a new dispute is filed against them
2. **Dispute Filed Confirmation** - Sent to the plaintiff confirming their dispute was filed
3. **Dispute Accepted** - Sent to the plaintiff when the defendant accepts the case
4. **Dispute Rejected** - Sent to the plaintiff when the defendant rejects the case

## Setup Instructions

### Option 1: Gmail (Recommended for Development)

1. **Enable 2-Factor Authentication** on your Gmail account
   - Go to: https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password

3. **Update `.env` file** in the `backend` directory:
   ```env
   SMTP_SERVER=smtp.gmail.com
   SMTP_PORT=587
   SENDER_EMAIL=your-email@gmail.com
   SENDER_PASSWORD=your-16-char-app-password
   ```

### Option 2: Other Email Providers

#### Outlook/Hotmail
```env
SMTP_SERVER=smtp-mail.outlook.com
SMTP_PORT=587
SENDER_EMAIL=your-email@outlook.com
SENDER_PASSWORD=your-password
```

#### Yahoo
```env
SMTP_SERVER=smtp.mail.yahoo.com
SMTP_PORT=587
SENDER_EMAIL=your-email@yahoo.com
SENDER_PASSWORD=your-app-password
```

### Option 3: Production Email Services (Recommended for Production)

For production deployments, use dedicated email services:

- **SendGrid** - https://sendgrid.com
- **AWS SES** - https://aws.amazon.com/ses/
- **Mailgun** - https://www.mailgun.com
- **Postmark** - https://postmarkapp.com

## Testing Email Notifications

1. **Start the backend server**:
   ```bash
   cd backend
   python main.py
   ```

2. **File a new dispute** through the frontend

3. **Check your email** - Both plaintiff and defendant should receive emails

4. **Check console logs** - Email send status is logged to the console

## Troubleshooting

### Emails not sending?

1. **Check credentials**: Verify SMTP settings in `.env`
2. **Check console logs**: Look for error messages in the terminal
3. **Gmail blocking**: Ensure you're using an App Password, not your regular password
4. **Firewall**: Ensure port 587 is not blocked
5. **Less secure apps**: Some providers require enabling "less secure app access"

### Email goes to spam?

- Add a proper "From" name
- Use a verified domain email address
- Consider using a dedicated email service (SendGrid, etc.)

## Customizing Email Templates

Email templates are defined in `backend/email_service.py`. You can customize:

- HTML styling
- Email content
- Subject lines
- Button links (update `http://localhost:5173` to your production URL)

## Disabling Email Notifications

If you don't want to send emails, simply don't set the `SENDER_EMAIL` and `SENDER_PASSWORD` environment variables. The app will log a message and continue without sending emails.

## Security Notes

⚠️ **Important**:
- Never commit your `.env` file to version control
- Use App Passwords, not your main account password
- For production, use environment variables or a secrets manager
- Consider rate limiting to prevent email spam
