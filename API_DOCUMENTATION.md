# 🌐 API Documentation

Here is a complete list of all the backend API endpoints exposed by the **AI Dispute Resolver** FastAPI application, categorized by their respective routes.

---

### 🟢 Root & Health 

These endpoints are used to verify the server status.

- `GET /` - Returns a welcome message and basic server status.
- `GET /api/health` - Returns comprehensive health check information (database connection, timestamp).

---

### 🔐 Authentication & Users (`/api/auth`)

These endpoints handle user registration, secure login routines, and fetching profile details.

- `POST /api/auth/register` - Create a new user profile using email & password.
- `POST /api/auth/login` - Standard OAuth login endpoint.
- `POST /api/auth/login/email` - Login specifically via Email & Password to receive a JWT.
- `POST /api/auth/google` - Login / Registration via Google OAuth.
- `GET /api/auth/me` - Fetch the profile information of the currently authenticated user.

---

### ⚖️ Disputes Management (`/api/disputes`)

All the core logic surrounding interactions with a specific dispute timeline.

**General CRUD:**
- `GET /api/disputes/` - Get a list of disputes related to the user.
- `POST /api/disputes/` - File a new dispute.
- `GET /api/disputes/filed` - Get all disputes *filed by* the authenticated user.
- `GET /api/disputes/against` - Get all disputes filed *against* the authenticated user.
- `GET /api/disputes/{dispute_id}` - Fetch details of a specific dispute by its ID.
- `PUT /api/disputes/{dispute_id}/status` - Update the status of a specific dispute.
- `DELETE /api/disputes/{dispute_id}` - Forcibly delete a dispute (requires privileges).

**Dispute Actions:**
- `GET /api/disputes/{dispute_id}/signing-info` - Fetch signatures logic requirement.
- `POST /api/disputes/{dispute_id}/sign` - Submit a digital signature and resolve terms.
- `POST /api/disputes/{dispute_id}/escalate` - Escalate a dispute to Admin review.
- `POST /api/disputes/{dispute_id}/drop` - Drop (withdraw) a filed dispute.
- `POST /api/disputes/{dispute_id}/accept` - Accept the generated AI suggestions or terms.
- `POST /api/disputes/{dispute_id}/reject` - Reject the generated AI suggestions or terms.

**Messaging:**
- `GET /api/disputes/{dispute_id}/messages` - Fetch messages linked to a dispute timeline.
- `POST /api/disputes/{dispute_id}/messages` - Post a new message on the dispute timeline.

---

### 🤖 AI Integration (`/api/ai`)

These endpoints communicate with the external Kutrim LLM.

- `POST /api/ai/suggestions` - Trigger the LLM generation of tailored settlement options based on the dispute context.

---

### 🛡️ Admin Panel (`/api/admin`)

Endpoints specifically restricted to users with the Admin role.

- `GET /api/admin/pending-approvals` - Fetch disputes waiting for administrative intervention.
- `POST /api/admin/{dispute_id}/approve-resolution` - Formally approve a submitted resolution to close the case.
- `GET /api/admin/dropped-disputes` - View a historical list of withdrawn/dropped disputes.
- `GET /api/admin/stats` - Fetch deep statistics for Admin dashboard rendering.
- `GET /api/admin/all-disputes` - Fetch every single dispute in the database without filters.
- `GET /api/admin/all-users` - Fetch a table of all registered platform users.

---

### 📊 User Dashboard (`/api/dashboard`)

For individual user summaries.

- `GET /api/dashboard/stats` - Fetch a simplified statistics object relevant to the specific user (e.g. number of their own pending vs open disputes).

---

### 🔔 Notifications (`/api/notifications`)

App-based notification feeds.

- `GET /api/notifications/` - Fetch all notifications for the user.
- `GET /api/notifications/unread` - Fetch only unread notifications.
- `PUT /api/notifications/{notification_id}/read` - Mark a specific notification as 'read'.
- `PUT /api/notifications/read-all` - Mark every notification as 'read' at once.
