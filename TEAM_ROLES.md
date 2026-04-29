# 🧑‍💻 Team Roles & Responsibilities

Based on the **AI Dispute Resolver** project architecture and the requested difficulty levels, here is a professional breakdown of roles for the team. 

---

## 🏗️ Core Engineering (Tough Roles)

These roles handle the most complex parts of the application, including backend architecture, database integration, security, and the core AI logic that powers the dispute resolutions.

### 1. Narendra: Backend Architecture & Systems Lead
**Responsibilities:**
- Designed and implemented the backend REST APIs using **FastAPI** (Python).
- Managed database architecture, NoSQL data modeling, and robust integration with **Google Cloud Firestore**.
- Developed the secure **Authentication System**, including password hashing, JWT token management, and Firebase Auth backend logic.
- Built the Admin and Dashboard routing logic to aggregate real-time platform statistics.

### 2. Yaswanth: AI Integration & Complex Features Lead
**Responsibilities:**
- Engineered the primary **AI Integration** utilizing the Kutrim LLM to automate the generation of legal insights and fair settlement options.
- Designed complex frontend logic to strictly handle dispute status workflows (Open → In Progress → Resolved).
- Built advanced frontend features, including **Optical Character Recognition (OCR)** with Tesseract.js for extracting text from evidence files.
- Handled complex API integrations on the frontend (Axios) to ensure real-time synchronization between the FastApi backend and React state.

---

## 🎨 UI/UX, QA, and Integrations (Easy Tasks)

These roles ensure the application is beautiful, stable, well-documented, and successfully communicates outside the platform.

### 3. Abbas: Frontend UI/UX Developer
**Responsibilities:**
- Translated project requirements into beautiful, responsive web designs using **React.js, Vite, and Vanilla CSS**.
- Constructed the interactive UI components, form layouts, and user profile interfaces to ensure a seamless User Experience (UX).
- Integrated `Lucide React` icons and styled crucial visual feedback components like custom alerts and notification modals.
- Focused on application aesthetics: ensuring smooth hover animations, polished typography, and intuitive navigation.

### 4. Mouli: Authentication Frontend, Integrations & Project Manager
**Responsibilities:**
- **Sign Up and Sign In Logic**: Managed the complete frontend authentication flow for user onboarding and secure login.
  - *Sign Up Logic Details*: Designed the registration form, added rigorous input constraints/validation, linked it to Firebase Auth APIs to create user profiles, and triggered automated "Welcome" emails using EmailJS immediately after a successful sign-up.
  - *Sign In Logic Details*: Developed the secure login form (Email/Password & Google OAuth), handling the receipt of JWT tokens from the backend. Implemented the logic to securely maintain user sessions (via React Context) and gracefully route users to their respective User or Admin workspaces upon sign-in.
- Successfully integrated and configured the **EmailJS automated notification system** for case status updates and alerts.
- Authored and maintained all critical project documentation (e.g., `README.md`, `ARCHITECTURE.md`, `10_TEST_SUITE.md`).
- Configured frontend helper plugins, such as `react-to-print`, to export PDF dispute reports, and conducted comprehensive QA testing.

---

### 📝 Summary for Presentation Purposes
- **Narendra:** Backend (FastAPI) & Database (Firestore)
- **Yaswanth:** AI Logic (Kutrim LLM) & Complex React Integrations
- **Abbas:** User Interface (UI), Styling (CSS), and Component Design
- **Mouli:** App Authentication (Sign In/Up), External Services (EmailJS), and Documentation
