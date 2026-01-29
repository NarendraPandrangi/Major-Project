# AI Dispute Resolver

A comprehensive AI-powered dispute resolution platform with user authentication, Google OAuth integration, and intelligent dispute management.

## Features

### Authentication
- ✅ **Email/Password Registration & Login**
- ✅ **Google OAuth Sign-in/Sign-up**
- ✅ **JWT Token-based Authentication**
- ✅ **Secure Password Hashing (bcrypt)**
- ✅ **Protected Routes**

### User Management
- User profiles with avatar support
- Email verification status
- Multiple authentication providers (local/Google)
- Profile updates

### Dispute Resolution
- File new disputes
- View disputes filed by you
- View disputes filed against you
- AI-powered suggestions
- Dispute status tracking (Pending, In Progress, Resolved, Rejected)
- Multiple dispute categories (Property, Business, Family, Service, Employment, Contract)

### Dashboard
- Statistics overview
- Recent disputes
- Quick actions
- Notifications system

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Database
- **SQLAlchemy** - ORM
- **JWT** - Authentication tokens
- **Google OAuth 2.0** - Social authentication
- **Passlib** - Password hashing

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Navigation
- **@react-oauth/google** - Google OAuth integration
- **Axios** - HTTP client
- **Lucide React** - Icons

## Setup Instructions

### Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL 14+
- Google Cloud Console account (for OAuth)

### 1. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure the OAuth consent screen
6. Add authorized JavaScript origins:
   - `http://localhost:3000`
   - `http://localhost:5173`
7. Add authorized redirect URIs:
   - `http://localhost:3000`
   - `http://localhost:5173`
8. Copy the **Client ID** (you'll need this for both backend and frontend)

### 2. Database Setup

```powershell
# Install PostgreSQL if not already installed
# Create a new database
psql -U postgres
CREATE DATABASE dispute_resolver;
\q
```

### 3. Backend Setup

```powershell
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
Copy-Item .env.example .env

# Edit .env file with your configuration
# - Update DATABASE_URL with your PostgreSQL credentials
# - Generate a secure SECRET_KEY: python -c "import secrets; print(secrets.token_hex(32))"
# - Add your GOOGLE_CLIENT_ID from Google Cloud Console

# Run the application
python main.py
```

The backend will start at `http://localhost:8000`

### 4. Frontend Setup

```powershell
# Open a new terminal
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file
Copy-Item .env.example .env

# Edit .env file
# - Add your VITE_GOOGLE_CLIENT_ID (same as backend)

# Run the development server
npm run dev
```

The frontend will start at `http://localhost:3000`

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dispute_resolver
SECRET_KEY=your-generated-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register with email/password
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/login/email` - Login with JSON body
- `POST /api/auth/google` - Google OAuth authentication
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update user profile

### Disputes
- `POST /api/disputes/` - Create new dispute
- `GET /api/disputes/` - Get all disputes
- `GET /api/disputes/filed` - Get disputes filed by user
- `GET /api/disputes/against` - Get disputes against user
- `GET /api/disputes/{id}` - Get specific dispute
- `PUT /api/disputes/{id}/status` - Update dispute status

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Notifications
- `GET /api/notifications/` - Get all notifications
- `GET /api/notifications/unread` - Get unread notifications
- `PUT /api/notifications/{id}/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all as read

## Project Structure

```
Major-Project/
├── backend/
│   ├── routers/
│   │   ├── users.py          # Authentication routes
│   │   ├── disputes.py       # Dispute management
│   │   ├── dashboard.py      # Dashboard stats
│   │   └── notifications.py  # Notifications
│   ├── main.py              # FastAPI application
│   ├── database.py          # Database configuration
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── auth.py              # Authentication utilities
│   ├── requirements.txt     # Python dependencies
│   └── .env.example         # Environment template
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── client.js    # Axios API client
    │   ├── context/
    │   │   └── AuthContext.jsx  # Auth state management
    │   ├── pages/
    │   │   ├── Home.jsx     # Landing page
    │   │   ├── Login.jsx    # Login page
    │   │   ├── Register.jsx # Registration page
    │   │   └── Dashboard.jsx # Dashboard
    │   ├── App.jsx          # Main app component
    │   ├── main.jsx         # Entry point
    │   └── index.css        # Global styles
    ├── package.json
    ├── vite.config.js
    └── .env.example
```

## Features Implemented

### ✅ Registration
- Email/password registration with validation
- Password strength requirements (min 8 characters)
- Username uniqueness check
- Automatic JWT token generation
- Google OAuth registration

### ✅ Login
- Email/password authentication
- Form validation
- Error handling
- Google OAuth login
- Automatic token storage
- Protected route redirection

### ✅ Google OAuth
- One-tap sign-in
- Automatic account creation
- Account linking for existing users
- Profile picture sync
- Email verification status

### ✅ Security
- Password hashing with bcrypt
- JWT token authentication
- Token expiration (7 days)
- Secure HTTP-only cookies support
- CORS configuration
- SQL injection protection (SQLAlchemy ORM)

## Design Highlights

- **Modern UI/UX** with gradient backgrounds and animations
- **Glassmorphism effects** on authentication pages
- **Responsive design** for mobile and desktop
- **Premium aesthetics** with custom color palette
- **Smooth transitions** and micro-animations
- **Google Fonts** (Inter) for typography
- **Lucide React icons** for consistent iconography

## Next Steps

To complete the AI Dispute Resolver platform, you can add:

1. **AI/ML Integration** - Implement dispute suggestion algorithms
2. **File Upload** - Support for evidence documents
3. **Real-time Notifications** - WebSocket integration
4. **Email Verification** - Send verification emails
5. **Password Reset** - Forgot password functionality
6. **Admin Panel** - Manage users and disputes
7. **Analytics** - Advanced reporting and insights
8. **Export Features** - PDF generation for disputes

## License

MIT License - feel free to use this project for your needs.

## Support

For issues or questions, please create an issue in the repository.
