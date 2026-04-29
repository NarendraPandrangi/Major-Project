# 10. Test Suite

This section outlines the comprehensive testing procedures conducted on the AI Dispute Resolver platform. Testing ensures that all modules—including Authentication, Dispute Management, AI Integration, and the Admin Panel—function as intended. 

Below is the detailed test suite containing test cases, descriptions, expected results, and visual evidence (screenshots).

---

## 10.1 Authentication & User Management

### Test Case 1: User Registration
- **Test ID:** TC-01
- **Module:** Authentication
- **Test Description:** Verify that a new user can successfully create an account by providing valid credentials (Name, Email, Password).
- **Steps to Execute:**
  1. Navigate to the Registration page.
  2. Enter valid details in the form.
  3. Click "Submit" or "Create Account".
- **Expected Result:** The system should securely hash the password, store the user in Firebase/Firestore, and redirect the user to the login screen with a success message.
- **Actual Status:** Pass
- **Screenshot:**
  > *[Insert Screenshot Here: Registration form filled out with a success toast notification]*

### Test Case 2: User Authentication (Login)
- **Test ID:** TC-02
- **Module:** Authentication
- **Test Description:** Validate the login functionality using email and password, as well as Google OAuth.
- **Steps to Execute:**
  1. Navigate to the Login page.
  2. Enter the registered Email and Password.
  3. Click "Login".
- **Expected Result:** A JWT token is generated, the user is authenticated, and the application redirects to the User Dashboard.
- **Actual Status:** Pass
- **Screenshot:**
  > *[Insert Screenshot Here: User dashboard immediately after a successful login, showing the welcome banner]*

---

## 10.2 Dispute Management & Filing

### Test Case 3: Filing a New Dispute
- **Test ID:** TC-03
- **Module:** Dispute Management
- **Test Description:** Verify that a user can successfully submit a new dispute form with a category, description, and involved parties.
- **Steps to Execute:**
  1. Log in as a User.
  2. Go to the "File Dispute" section.
  3. Fill out the category, description, and target respondent details.
  4. Submit the dispute form.
- **Expected Result:** The dispute is stored in the database with an "Open" or "Pending" status, and the user sees it added to their "My Disputes" list.
- **Actual Status:** Pass
- **Screenshot:**
  > *[Insert Screenshot Here: The 'File a Dispute' form completely filled out before clicking submit]*

### Test Case 4: Dispute Evidence Upload
- **Test ID:** TC-04
- **Module:** Dispute Management
- **Test Description:** Ensure users can attach evidence (documents or images) to their disputes.
- **Steps to Execute:**
  1. While filing or updating a dispute, click "Upload Evidence".
  2. Select an image or document from the local device.
- **Expected Result:** The file is uploaded successfully, and the Tesseract.js OCR successfully extracts any text if it's a readable image.
- **Actual Status:** Pass
- **Screenshot:**
  > *[Insert Screenshot Here: View of the dispute details page showing attached evidence documents]*

---

## 10.3 AI Integration & Resolution

### Test Case 5: AI Suggestion Generation
- **Test ID:** TC-05
- **Module:** AI Integration
- **Test Description:** Test the application's ability to communicate with the Kutrim LLM to generate resolution suggestions based on dispute details.
- **Steps to Execute:**
  1. Open a pending dispute.
  2. Click the "Generate AI Suggestion" button.
- **Expected Result:** The backend successfully queries the AI model and returns context-aware, fair settlement options for both parties.
- **Actual Status:** Pass
- **Screenshot:**
  > *[Insert Screenshot Here: The UI displaying generated AI suggestions and reasoning for a specific case]*

### Test Case 6: Accepting/Rejecting AI Solutions
- **Test ID:** TC-06
- **Module:** Dispute Resolution
- **Test Description:** Validate that users can interact with the generated AI suggestions by Accepting or Rejecting them.
- **Steps to Execute:**
  1. View the AI suggestions on a dispute.
  2. Click on the "Accept Solution" or "Reject Solution" button.
- **Expected Result:** The dispute status updates to "Resolved" (if accepted) or escalates (if rejected), and the UI immediately reflects the new status.
- **Actual Status:** Pass
- **Screenshot:**
  > *[Insert Screenshot Here: The confirmation dialog or updated UI state after clicking 'Accept Solution']*

---

## 10.4 Administration & Notifications

### Test Case 7: Admin Panel Overview
- **Test ID:** TC-07
- **Module:** Admin Dashboard
- **Test Description:** Verify that an Admin user can view all disputes across the platform, filter them by status, and override actions.
- **Steps to Execute:**
  1. Log in with Admin credentials.
  2. Navigate to the Admin Dashboard.
- **Expected Result:** The dashboard displays global statistics, and a list of all disputes with controls to manage or delete cases.
- **Actual Status:** Pass
- **Screenshot:**
  > *[Insert Screenshot Here: The Admin Dashboard showing total stats and the data table of all system disputes]*

### Test Case 8: Automated Email Notifications
- **Test ID:** TC-08
- **Module:** Communications (EmailJS)
- **Test Description:** Confirm that appropriate emails are sent during critical events (e.g., account creation, new dispute filed).
- **Steps to Execute:**
  1. Trigger an event such as creating a new account.
  2. Check the inbox of the registered email address.
- **Expected Result:** A beautifully formatted HTML email arrives in the inbox indicating the action was successful.
- **Actual Status:** Pass
- **Screenshot:**
  > *[Insert Screenshot Here: A screenshot of the email received in a Gmail/Inbox client]*
