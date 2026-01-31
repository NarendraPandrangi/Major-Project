# Admin Approval Workflow

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DISPUTE LIFECYCLE                            │
└─────────────────────────────────────────────────────────────────────┘

1. DISPUTE FILED
   ┌──────────────┐
   │ Plaintiff    │ Files dispute
   │ creates case │────────────────┐
   └──────────────┘                │
                                   ▼
                            ┌──────────────┐
                            │ Status: OPEN │
                            └──────────────┘
                                   │
                                   │ Defendant receives notification
                                   ▼

2. CASE ACCEPTANCE
   ┌──────────────┐
   │ Defendant    │ Accepts or Rejects
   │ reviews case │────────────────┐
   └──────────────┘                │
                                   ▼
                    ┌──────────────────────────┐
                    │ Accept → Status:         │
                    │ IN_PROGRESS              │
                    │                          │
                    │ Reject → Status:         │
                    │ REJECTED (End)           │
                    └──────────────────────────┘
                                   │
                                   │ If accepted
                                   ▼

3. NEGOTIATION & AI SUGGESTIONS
   ┌──────────────┐     ┌──────────────┐
   │ Live Chat    │     │ AI generates │
   │ between      │◄───►│ resolution   │
   │ parties      │     │ suggestions  │
   └──────────────┘     └──────────────┘
                                   │
                                   │ Both parties select same option
                                   ▼

4. MUTUAL AGREEMENT
   ┌──────────────┐     ┌──────────────┐
   │ Plaintiff    │     │ Defendant    │
   │ agrees to    │     │ agrees to    │
   │ Option X     │     │ Option X     │
   └──────────────┘     └──────────────┘
          │                     │
          └──────────┬──────────┘
                     │
                     ▼
          ┌────────────────────┐
          │ Status: PENDING    │ ◄─── NEW ADMIN APPROVAL STEP
          │ APPROVAL           │
          └────────────────────┘
                     │
                     │ Admin receives notification
                     ▼

5. ADMIN REVIEW
   ┌──────────────────────────────────────┐
   │         ADMIN PANEL                   │
   │                                       │
   │  ┌─────────────────────────────┐     │
   │  │ Review dispute details      │     │
   │  │ - Plaintiff info            │     │
   │  │ - Defendant info            │     │
   │  │ - Dispute description       │     │
   │  │ - Agreed resolution         │     │
   │  │ - Chat history (optional)   │     │
   │  └─────────────────────────────┘     │
   │                                       │
   │  Admin Decision:                     │
   │  ┌─────────┐    ┌──────────┐        │
   │  │ APPROVE │    │ REJECT   │        │
   │  └─────────┘    └──────────┘        │
   └──────────────────────────────────────┘
          │                     │
          │                     │
          ▼                     ▼
   ┌──────────────┐    ┌──────────────────┐
   │ Status:      │    │ Status:          │
   │ RESOLVED     │    │ IN_PROGRESS      │
   │              │    │                  │
   │ Settlement   │    │ plaintiff_agreed │
   │ agreement    │    │ = false          │
   │ generated    │    │ defendant_agreed │
   │              │    │ = false          │
   │ Both parties │    │                  │
   │ notified via │    │ Both parties     │
   │ email        │    │ notified to      │
   │              │    │ continue         │
   │              │    │ negotiation      │
   └──────────────┘    └──────────────────┘
          │                     │
          │                     │
          ▼                     ▼
   ┌──────────────┐    ┌──────────────────┐
   │ CASE CLOSED  │    │ Back to step 3   │
   │ (Success)    │    │ (Renegotiate)    │
   └──────────────┘    └──────────────────┘
```

## Status Flow Chart

```
OPEN ──────────────────────────────────────────────┐
  │                                                 │
  │ Defendant accepts                               │ Defendant rejects
  ▼                                                 ▼
IN_PROGRESS                                    REJECTED (End)
  │
  │ Both parties agree
  ▼
PENDING_APPROVAL ◄──── NEW STATUS
  │
  ├─── Admin approves ────► RESOLVED (End)
  │
  └─── Admin rejects ─────► IN_PROGRESS (Loop back)
```

## Notification Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    NOTIFICATION SYSTEM                       │
└─────────────────────────────────────────────────────────────┘

When both parties agree:
  ┌──────────────┐
  │ System       │
  │ detects      │
  │ agreement    │
  └──────────────┘
         │
         ▼
  ┌──────────────────────────────────┐
  │ Notifications sent to:           │
  │                                  │
  │ 1. All admin users               │
  │    - In-app notification         │
  │    - "New resolution pending"    │
  │                                  │
  │ 2. Plaintiff & Defendant         │
  │    - In-app notification         │
  │    - "Pending admin approval"    │
  └──────────────────────────────────┘

When admin approves:
  ┌──────────────┐
  │ Admin clicks │
  │ "Approve"    │
  └──────────────┘
         │
         ▼
  ┌──────────────────────────────────┐
  │ Notifications sent to:           │
  │                                  │
  │ 1. Plaintiff                     │
  │    - Email notification          │
  │    - In-app notification         │
  │    - "Resolution approved"       │
  │                                  │
  │ 2. Defendant                     │
  │    - Email notification          │
  │    - In-app notification         │
  │    - "Resolution approved"       │
  └──────────────────────────────────┘

When admin rejects:
  ┌──────────────┐
  │ Admin clicks │
  │ "Reject"     │
  │ with reason  │
  └──────────────┘
         │
         ▼
  ┌──────────────────────────────────┐
  │ Notifications sent to:           │
  │                                  │
  │ 1. Plaintiff                     │
  │    - Email notification          │
  │    - In-app notification         │
  │    - "Resolution rejected"       │
  │    - Admin feedback included     │
  │                                  │
  │ 2. Defendant                     │
  │    - Email notification          │
  │    - In-app notification         │
  │    - "Resolution rejected"       │
  │    - Admin feedback included     │
  └──────────────────────────────────┘
```

## Admin Panel Structure

```
┌─────────────────────────────────────────────────────────────┐
│                      ADMIN PANEL                             │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              STATISTICS DASHBOARD                   │    │
│  │                                                     │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐│    │
│  │  │ Pending  │ │ Resolved │ │  Total   │ │ Total  ││    │
│  │  │ Approval │ │ Disputes │ │ Disputes │ │ Users  ││    │
│  │  │    5     │ │    42    │ │    87    │ │  156   ││    │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────┘│    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │                    TABS                             │    │
│  │                                                     │    │
│  │  [Pending Approvals] [All Disputes] [All Users]    │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │            TAB CONTENT AREA                         │    │
│  │                                                     │    │
│  │  For Pending Approvals:                            │    │
│  │  ┌──────────────────────────────────────────┐     │    │
│  │  │ Case #12345                              │     │    │
│  │  │ Title: Payment Dispute                   │     │    │
│  │  │ Plaintiff: user1@example.com             │     │    │
│  │  │ Defendant: user2@example.com             │     │    │
│  │  │                                          │     │    │
│  │  │ Agreed Resolution:                       │     │    │
│  │  │ "Defendant will refund $500..."          │     │    │
│  │  │                                          │     │    │
│  │  │ [Review & Decide]                        │     │    │
│  │  └──────────────────────────────────────────┘     │    │
│  │                                                     │    │
│  │  When "Review & Decide" clicked:                   │    │
│  │  ┌──────────────────────────────────────────┐     │    │
│  │  │ Admin Notes:                             │     │    │
│  │  │ [Text area for notes]                    │     │    │
│  │  │                                          │     │    │
│  │  │ [✓ Approve] [✗ Reject] [Cancel]         │     │    │
│  │  └──────────────────────────────────────────┘     │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Database Schema Changes

```
Dispute Document (Firestore):
{
  id: "dispute_id",
  title: "Dispute Title",
  description: "...",
  category: "Service",
  status: "PendingApproval",  ◄─── NEW STATUS VALUE
  
  // Existing fields
  user_id: "plaintiff_id",
  creator_email: "plaintiff@example.com",
  defendant_email: "defendant@example.com",
  plaintiff_agreed: true,
  defendant_agreed: true,
  resolution_text: "Agreed resolution...",
  
  // NEW FIELDS for admin approval
  pending_approval_since: "2026-01-30T19:30:00Z",
  admin_approved: true/false,
  admin_id: "admin_user_id",
  admin_notes: "Looks fair to both parties",
  admin_rejected: false,
  admin_rejection_reason: "",
  
  created_at: "...",
  updated_at: "..."
}
```

---

**Visual Guide Version**: 1.0
**Last Updated**: January 30, 2026
