# Admin Panel Feature Documentation

## Overview

The Admin Panel feature adds an approval workflow for dispute resolutions. When both parties (plaintiff and defendant) agree to the same resolution option, the case is automatically sent to the admin panel for review and approval before being finalized.

## Key Features

### 1. **Admin Approval Workflow**
- When both parties accept the same resolution, the dispute status changes to `PendingApproval`
- Admin users receive notifications about pending approvals
- Admins can review the dispute details and the agreed resolution
- Admins can either approve or reject the resolution with optional notes

### 2. **Admin Dashboard**
The admin panel includes three main tabs:

#### **Pending Approvals Tab**
- Shows all disputes awaiting admin approval
- Displays full dispute details including:
  - Case ID and title
  - Category
  - Plaintiff and defendant information
  - Agreed resolution text
  - Submission timestamp
- Allows admins to:
  - Approve resolutions (with optional notes)
  - Reject resolutions (with mandatory reason)

#### **All Disputes Tab**
- Comprehensive view of all disputes in the system
- Filterable table showing:
  - Case ID, title, category
  - Current status
  - Parties involved
  - Creation date
- Quick access to view individual disputes

#### **All Users Tab**
- Complete user management view
- Shows:
  - Email, username, full name
  - User role (admin/user)
  - Authentication provider
  - Registration date

### 3. **Statistics Dashboard**
Real-time statistics showing:
- Total disputes pending approval
- Total resolved disputes
- Total disputes in the system
- Total registered users

## User Flow

### For Regular Users (Plaintiff & Defendant)

1. **Dispute Creation**: Plaintiff files a dispute
2. **Acceptance**: Defendant accepts the case
3. **Negotiation**: Both parties communicate via chat
4. **AI Suggestions**: System generates resolution suggestions
5. **Agreement**: Both parties select and agree to the same option
6. **Pending Approval**: Status changes to "PendingApproval"
   - Both parties see a banner indicating admin review is in progress
   - No further actions can be taken until admin decision
7. **Admin Decision**:
   - **If Approved**: Case status changes to "Resolved", settlement agreement is generated
   - **If Rejected**: Case returns to "InProgress", parties can continue negotiating

### For Admin Users

1. **Notification**: Receive notification when a resolution is pending approval
2. **Review**: Access admin panel to review pending cases
3. **Decision**:
   - **Approve**: Confirm the resolution is fair and appropriate
     - Add optional notes for record-keeping
     - Both parties receive approval notification via email and in-app
   - **Reject**: Send case back for further negotiation
     - Provide mandatory reason for rejection
     - Both parties receive rejection notification with admin feedback

## Technical Implementation

### Backend Components

#### **New Router**: `backend/routers/admin.py`
- `GET /api/admin/pending-approvals` - Get all pending approvals
- `POST /api/admin/{dispute_id}/approve-resolution` - Approve/reject resolution
- `GET /api/admin/stats` - Get admin statistics
- `GET /api/admin/all-disputes` - Get all disputes
- `GET /api/admin/all-users` - Get all users

#### **Modified Files**:
- `backend/routers/disputes.py`: Updated agreement flow to set status to "PendingApproval"
- `backend/email_service.py`: Added email notifications for approval/rejection
- `backend/main.py`: Registered admin router

### Frontend Components

#### **New Page**: `frontend/src/pages/AdminPanel.jsx`
- Comprehensive admin interface
- Tab-based navigation
- Real-time statistics
- Approval/rejection workflow

#### **Modified Files**:
- `frontend/src/api/client.js`: Added admin API methods
- `frontend/src/App.jsx`: Added admin panel route
- `frontend/src/pages/Dashboard.jsx`: Added admin panel quick action
- `frontend/src/pages/DisputeDetails.jsx`: Added pending approval banner

### Database Schema

New fields added to disputes:
- `status`: Added "PendingApproval" as a valid status
- `pending_approval_since`: Timestamp when approval was requested
- `admin_approved`: Boolean indicating admin approval
- `admin_id`: ID of admin who made the decision
- `admin_notes`: Notes provided by admin
- `admin_rejected`: Boolean indicating if admin rejected
- `admin_rejection_reason`: Reason for rejection

## Email Notifications

### Resolution Approved Email
Sent to both parties when admin approves:
- Subject: "Resolution Approved - {dispute_title}"
- Contains: Dispute details, agreed resolution, link to settlement agreement
- Style: Green gradient header with success theme

### Resolution Rejected Email
Sent to both parties when admin rejects:
- Subject: "Resolution Requires Revision - {dispute_title}"
- Contains: Dispute details, admin feedback, link to continue negotiation
- Style: Orange gradient header with warning theme

## Access Control

- **Admin Panel Access**: Only users with `role: "admin"` can access `/admin`
- **API Endpoints**: All admin endpoints verify user role before processing
- **Frontend Protection**: Admin panel route is protected and redirects non-admins to dashboard

## Creating an Admin User

To create an admin user, you need to manually update the user's role in Firestore:

1. Register a new user normally through the application
2. Go to Firebase Console → Firestore Database
3. Find the user in the `users` collection
4. Edit the user document and change `role` from `"user"` to `"admin"`
5. The user will now have access to the admin panel

## UI/UX Features

### Visual Indicators
- **Pending Approval Badge**: Yellow/warning color scheme
- **Admin Panel Card**: Distinct accent color in dashboard
- **Status Badges**: Color-coded for easy identification
- **Notification Badges**: Real-time unread count

### Responsive Design
- Mobile-friendly admin panel
- Responsive tables with horizontal scroll on small screens
- Adaptive grid layouts for statistics

### Animations
- Smooth fade-in animations for tab content
- Hover effects on cards and buttons
- Slide-down animation for dropdowns

## Best Practices for Admins

1. **Review Thoroughly**: Read the full dispute details and chat history before deciding
2. **Provide Clear Feedback**: When rejecting, give specific reasons for improvement
3. **Be Timely**: Review pending approvals promptly to avoid delays
4. **Document Decisions**: Use admin notes to record reasoning for future reference
5. **Maintain Fairness**: Ensure resolutions are equitable for both parties

## Future Enhancements

Potential improvements for the admin panel:
- Bulk approval/rejection actions
- Advanced filtering and search
- Dispute assignment to specific admins
- Admin activity logs and audit trail
- Analytics and reporting dashboard
- Automated approval for certain criteria
- Admin role hierarchy (super admin, moderator, etc.)

## Troubleshooting

### Common Issues

**Issue**: Admin panel shows "Access Denied"
- **Solution**: Verify user role is set to "admin" in Firestore

**Issue**: Pending approvals not showing
- **Solution**: Check that disputes have both `plaintiff_agreed` and `defendant_agreed` set to true

**Issue**: Email notifications not sent
- **Solution**: Verify SMTP configuration in backend `.env` file

**Issue**: Statistics not updating
- **Solution**: Refresh the page or check backend API connectivity

## API Reference

### Get Pending Approvals
```
GET /api/admin/pending-approvals
Authorization: Bearer {token}
Response: Array of dispute objects with status "PendingApproval"
```

### Approve/Reject Resolution
```
POST /api/admin/{dispute_id}/approve-resolution
Authorization: Bearer {token}
Body: {
  "decision": "approve" | "reject",
  "admin_notes": "Optional notes"
}
Response: {
  "status": "success",
  "message": "Resolution approved/rejected",
  "dispute_status": "Resolved" | "InProgress"
}
```

### Get Admin Statistics
```
GET /api/admin/stats
Authorization: Bearer {token}
Response: {
  "total_disputes": number,
  "pending_approval": number,
  "resolved": number,
  "in_progress": number,
  "open_disputes": number,
  "rejected": number,
  "total_users": number
}
```

## Security Considerations

1. **Role-Based Access Control**: All admin endpoints verify user role
2. **Authorization**: JWT token required for all API calls
3. **Data Validation**: Input validation on all admin actions
4. **Audit Trail**: Admin actions are logged with user ID and timestamp
5. **Email Verification**: Notifications sent to verified email addresses only

---

**Last Updated**: January 2026
**Version**: 1.0.0
