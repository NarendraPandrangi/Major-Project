# Email Service Configuration Guide

## Overview
The application uses **EmailJS** for sending email notifications with **separate service credentials** for different email types to ensure proper organization and tracking.

## Service Separation

### 1. Welcome/Registration Service
**Purpose**: Sends welcome emails to new users after successful registration

**Credentials**:
- Service ID: `service_xsbg5eg`
- Public Key: `LJ81vH8bcaPR4p-qO`
- Template ID: `template_ol06yk5`

**Environment Variables**:
```env
VITE_EMAILJS_WELCOME_SERVICE_ID=service_xsbg5eg
VITE_EMAILJS_WELCOME_PUBLIC_KEY=LJ81vH8bcaPR4p-qO
VITE_EMAILJS_TEMPLATE_REGISTRATION=template_ol06yk5
```

**Usage**:
- Triggered automatically after user registration in `AuthContext.jsx`
- Sends personalized welcome message to new users

### 2. Dispute Notifications Service
**Purpose**: Sends all dispute-related notifications (filed, accepted, rejected, etc.)

**Credentials**:
- Service ID: `service_fnp3fdu`
- Public Key: `_uzDMgs0cWm5y9F6z`

**Templates**:
- Dispute Filed: `template_xqz1j6t`
- Confirmation: `template_xqz1j6t`
- Accepted: `template_xqz1j6t`
- Rejected: `template_xqz1j6t`

**Environment Variables**:
```env
VITE_EMAILJS_DISPUTE_SERVICE_ID=service_fnp3fdu
VITE_EMAILJS_DISPUTE_PUBLIC_KEY=_uzDMgs0cWm5y9F6z
VITE_EMAILJS_TEMPLATE_DISPUTE_FILED=template_xqz1j6t
VITE_EMAILJS_TEMPLATE_CONFIRMATION=template_xqz1j6t
VITE_EMAILJS_TEMPLATE_ACCEPTED=template_xqz1j6t
VITE_EMAILJS_TEMPLATE_REJECTED=template_xqz1j6t
```

**Usage**:
- Dispute filed notifications (to defendant)
- Dispute confirmation (to plaintiff)
- Acceptance notifications (to plaintiff)
- Rejection notifications (to plaintiff)

## Email Service Implementation

### Centralized Service (`src/services/emailService.js`)

The email service automatically handles:
1. **Credential Switching**: Initializes EmailJS with the correct public key based on email type
2. **Template Selection**: Uses the appropriate template for each notification type
3. **Error Handling**: Gracefully handles failures without blocking user actions
4. **Logging**: Provides detailed console logs for debugging

### Available Functions

#### `sendWelcomeEmail(params)`
Sends welcome email after registration.

**Parameters**:
```javascript
{
  to_email: string,    // Recipient email
  to_name: string,     // Recipient name
  user_id: string      // User ID (optional)
}
```

#### `sendDisputeFiledEmail(params)`
Notifies defendant when a dispute is filed against them.

**Parameters**:
```javascript
{
  to_email: string,       // Defendant email
  to_name: string,        // Defendant name
  dispute_id: string,     // Dispute ID
  dispute_title: string,  // Dispute title
  category: string        // Dispute category
}
```

#### `sendDisputeConfirmationEmail(params)`
Confirms dispute filing to the plaintiff.

**Parameters**: Same as `sendDisputeFiledEmail`

#### `sendDisputeAcceptedEmail(params)`
Notifies plaintiff when defendant accepts the dispute.

**Parameters**: Same as `sendDisputeFiledEmail`

#### `sendDisputeRejectedEmail(params)`
Notifies plaintiff when defendant rejects the dispute.

**Parameters**: Same as `sendDisputeFiledEmail`

## Template Variables

### Welcome Email Template
Your EmailJS template should include these variables:
- `{{to_email}}` - Recipient email
- `{{to_name}}` - Recipient name
- `{{user_id}}` - User ID
- `{{registration_date}}` - Registration date

### Dispute Email Templates
Your EmailJS templates should include these variables:
- `{{to_email}}` - Recipient email
- `{{to_name}}` - Recipient name
- `{{dispute_id}}` - Dispute ID
- `{{dispute_title}}` - Dispute title
- `{{category}}` - Dispute category
- `{{filed_date}}` - Date filed (auto-generated)

## Configuration Validation

Use the `validateEmailConfig()` function to check if all required environment variables are set:

```javascript
import { validateEmailConfig } from '../services/emailService';

const validation = validateEmailConfig();
if (!validation.isValid) {
  console.error('Missing email configuration:', validation.missing);
}
```

## Testing

### Test Welcome Email
1. Register a new user account
2. Check console for "Welcome email sent successfully"
3. Verify email received in inbox

### Test Dispute Emails
1. File a new dispute
2. Check console for "Defendant notification email sent successfully"
3. Accept/Reject the dispute as defendant
4. Check console for acceptance/rejection email logs

## Troubleshooting

### Email Not Sending
1. Check environment variables are correctly set in `.env`
2. Verify EmailJS service IDs and public keys are active
3. Check browser console for error messages
4. Ensure templates exist in EmailJS dashboard

### Wrong Credentials Used
- The service automatically switches credentials based on email type
- Check console logs to see which service ID is being used
- Verify the correct function is being called for the email type

## Security Notes

- Never commit `.env` file to version control
- Public keys are safe to expose in frontend code
- Service IDs are public identifiers
- Template IDs are public identifiers
- EmailJS handles rate limiting and spam protection

## Migration from Old Service

The old `utils/emailService.js` has been replaced with `services/emailService.js`. All components have been updated to use the new service:

- ✅ `AuthContext.jsx` - Welcome emails
- ✅ `DisputeForm.jsx` - Dispute filed & confirmation
- ✅ `DisputeDetails.jsx` - Acceptance & rejection
- ✅ `Register.jsx` - Removed duplicate email sending

The old file can be safely deleted if no other components reference it.
