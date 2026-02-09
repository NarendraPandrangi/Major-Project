# AI Dispute Resolver

A comprehensive AI-powered dispute resolution platform that leverages modern web technologies to facilitate fair and efficient conflict resolution. The system features secure authentication, real-time updates, AI-driven insights, and a robust dispute management workflow.

## 🚀 Features

### Authentication & User Management
- ✅ **Secure Authentication**: Email/Password login and Google OAuth integration via **Firebase Auth**.
- ✅ **User Profiles**: Profile management with avatar support.
- ✅ **Role-Based Access**: Distinct roles for Users and Admins.
- ✅ **Password Management**: Secure password hashing and reset functionality.

### Dispute Resolution
- ✅ **Filing System**: Easy-to-use forms for filing new disputes across various categories (Property, Business, Family, etc.).
- ✅ **Case Management**: View disputes filed by you and against you.
- ✅ **Status Tracking**: Track dispute progress (Open, In Progress, Resolved, Rejected).
- ✅ **Evidence Management**: Support for uploading evidence documents and images with OCR capabilities.

### AI Integration
- ✅ **Smart Suggestions**: AI-powered analysis of disputes to suggest potential resolutions using **Kutrim LLM**.
- ✅ **Legal Insights**: Automated generation of legal context and potential settlement terms.

### Communication
- ✅ **Email Notifications**: Automated emails for registration, dispute filing, and status updates using **EmailJS**.
- ✅ **Admin Panel**: Dedicated interface for administrators to review and manage disputes.

### Dashboard
- ✅ **Real-time Stats**: Overview of total, pending, and resolved disputes.
- ✅ **Recent Activity**: Quick access to recently updated cases.
- ✅ **Notifications**: In-app notification system for important updates.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 18](https://reactjs.org/) with [Vite](https://vitejs.dev/)
- **Styling**: Vanilla CSS with modern features (Variables, Flexbox/Grid, Animations)
- **Routing**: [React Router v6](https://reactrouter.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **OCR**: [Tesseract.js](https://github.com/naptha/tesseract.js) for image text extraction
- **Printing**: [react-to-print](https://github.com/gregnb/react-to-print) for generating PDF reports

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **Database**: [Google Cloud Firestore](https://firebase.google.com/docs/firestore) (NoSQL)
- **Authentication**: JWT (JSON Web Tokens) & Firebase Admin SDK
- **AI Model**: Kutrim Private LLM integration
- **Validation**: [Pydantic](https://docs.pydantic.dev/)

### Infrastructure & Services
- **Auth Provider**: Firebase Authentication
- **Email Service**: EmailJS
- **Hosting**: Vercel (Frontend & Backend capable)

## 📂 Project Structure

```
Major-Project/
├── backend/
│   ├── routers/             # API route handlers
│   │   ├── users.py         # Auth & User management
│   │   ├── disputes.py      # Dispute CRUD & Logic
│   │   ├── dashboard.py     # Stats aggregation
│   │   ├── notifications.py # Notification system
│   │   ├── ai.py            # AI integration
│   │   └── admin.py         # Admin specific routes
│   ├── main.py              # App entry point & CORS
│   ├── database.py          # Firestore connection & helpers
│   ├── auth.py              # JWT & OAuth utilities
│   ├── email_service.py     # Email sending logic
│   └── requirements.txt     # Python dependencies
│
└── frontend/
    ├── src/
    │   ├── api/             # Axios instances & endpoints
    │   ├── context/         # React Context (Auth)
    │   ├── pages/           # Application views
    │   ├── firebase/        # Firebase config
    │   └── ...
    ├── public/
    └── package.json
```

## ⚡ Setup Instructions

### Prerequisites
- Python 3.9+
- Node.js 18+
- Firebase Project (Firestore & Auth enabled)
- Kutrim API Key (for AI features)
- EmailJS Account

### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
# Windows: .\venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
```

**Configure `.env`:**
```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_API_KEY=your-api-key

# App Security
SECRET_KEY=your-secure-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# AI Configuration
KUTRIM_API_KEY=your-kutrim-key
```

Run the server:
```bash
python main.py
# Server starts at http://localhost:8000
```

### 2. Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

**Configure `.env`:**
```env
VITE_API_URL=http://localhost:8000
# Firebase config is managed in src/firebase/config.js
```

Run the development server:
```bash
npm run dev
# App starts at http://localhost:5173
```

## 🔒 Environment Variables

### Backend
| Variable | Description |
|----------|-------------|
| `FIREBASE_PROJECT_ID` | Your Firebase project ID |
| `FIREBASE_API_KEY` | Your Firebase web API key |
| `SECRET_KEY` | Secret for JWT encoding |
| `KUTRIM_API_KEY` | API key for AI services |

### Frontend
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | URL of the backend API |
| `VITE_EMAILJS_SERVICE_ID` | EmailJS Service ID |
| `VITE_EMAILJS_TEMPLATE_ID` | EmailJS Template ID |
| `VITE_EMAILJS_PUBLIC_KEY` | EmailJS Public Key |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
