# Quick Guide: Creating an Admin User

## Method 1: Using Firebase Console (Recommended)

### Step 1: Register a User
1. Go to your application: `http://localhost:5173`
2. Click "Register" or "Sign Up"
3. Fill in the registration form:
   - Email: `admin@example.com` (or your preferred email)
   - Username: `admin`
   - Password: (choose a strong password)
4. Complete the registration

### Step 2: Upgrade to Admin in Firestore
1. Open Firebase Console: https://console.firebase.google.com
2. Select your project
3. Navigate to **Firestore Database** in the left sidebar
4. Find the `users` collection
5. Locate the user you just created (search by email)
6. Click on the user document to open it
7. Find the `role` field
8. Click the edit icon next to `role`
9. Change the value from `"user"` to `"admin"`
10. Click "Update"

### Step 3: Verify Admin Access
1. Log out from the application
2. Log back in with the admin credentials
3. You should now see an "Admin Panel" card in the dashboard
4. Click it to access the admin panel at `/admin`

---

## Method 2: Using Firestore REST API (Advanced)

If you prefer to use the Firestore REST API:

```bash
# Get the user document ID first
# Then update the role field

curl -X PATCH \
  'https://firestore.googleapis.com/v1/projects/YOUR_PROJECT_ID/databases/(default)/documents/users/USER_DOC_ID?updateMask.fieldPaths=role' \
  -H 'Authorization: Bearer YOUR_AUTH_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "fields": {
      "role": {
        "stringValue": "admin"
      }
    }
  }'
```

---

## Method 3: Using Firebase Admin SDK (For Developers)

If you have a backend script with Firebase Admin SDK:

```python
from firebase_admin import firestore

db = firestore.client()

# Update user role
user_ref = db.collection('users').document('USER_DOC_ID')
user_ref.update({
    'role': 'admin'
})

print("User upgraded to admin successfully!")
```

---

## Verifying Admin Status

### Check in Application
1. Login with the admin account
2. Go to Dashboard
3. Look for "Admin Panel" quick action card
4. If visible, admin status is confirmed

### Check in Firestore
1. Open Firebase Console
2. Go to Firestore Database
3. Open the user document
4. Verify `role` field shows `"admin"`

---

## Admin Capabilities

Once a user has admin role, they can:

✅ Access the Admin Panel at `/admin`
✅ View all pending approval requests
✅ Approve or reject dispute resolutions
✅ View all disputes in the system
✅ View all registered users
✅ See system-wide statistics

---

## Security Notes

⚠️ **Important Security Considerations:**

1. **Limit Admin Accounts**: Only create admin accounts for trusted individuals
2. **Strong Passwords**: Ensure admin accounts use strong, unique passwords
3. **Regular Audits**: Periodically review who has admin access
4. **Activity Logging**: Admin actions are logged with user ID and timestamp
5. **Revoke Access**: To remove admin access, change role back to "user"

---

## Troubleshooting

### Problem: "Admin Panel" not showing in dashboard
**Solution**: 
- Clear browser cache and reload
- Verify role is exactly `"admin"` (lowercase, no spaces)
- Log out and log back in

### Problem: "Access Denied" when accessing `/admin`
**Solution**:
- Check Firestore to confirm role is set to "admin"
- Verify you're logged in with the correct account
- Check browser console for any errors

### Problem: Can't find user in Firestore
**Solution**:
- Make sure you completed registration
- Check the `users` collection (not `disputes`)
- Search by email address

---

## Quick Checklist

- [ ] User registered successfully
- [ ] Found user in Firestore `users` collection
- [ ] Changed `role` field to `"admin"`
- [ ] Logged out and logged back in
- [ ] "Admin Panel" card visible in dashboard
- [ ] Can access `/admin` route
- [ ] Can view pending approvals

---

## Example Admin User

Here's what an admin user document looks like in Firestore:

```json
{
  "id": "abc123xyz",
  "email": "admin@example.com",
  "username": "admin",
  "full_name": "System Administrator",
  "role": "admin",  ← THIS IS THE KEY FIELD
  "auth_provider": "local",
  "is_active": true,
  "is_verified": true,
  "created_at": "2026-01-30T10:00:00Z",
  "updated_at": "2026-01-30T10:00:00Z"
}
```

---

**Need Help?** 
- Check the main documentation: `ADMIN_PANEL_DOCUMENTATION.md`
- Review the workflow: `ADMIN_WORKFLOW_DIAGRAM.md`
- See implementation details: `ADMIN_PANEL_SUMMARY.md`

---

**Last Updated**: January 30, 2026
