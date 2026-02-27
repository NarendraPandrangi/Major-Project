from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from datetime import datetime
import uvicorn

from database import get_firestore_db, Collections
import auth
from routers import disputes, dashboard, notifications, users

app = FastAPI(title="AI Dispute Resolver API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://localhost:5173", 
        "https://major-project-six-beta.vercel.app"  # Add deployed frontend domain
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(disputes.router, prefix="/api/disputes", tags=["Disputes"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
from routers import ai
app.include_router(ai.router, prefix="/api/ai", tags=["AI"])
from routers import admin
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])


@app.get("/")
async def root():
    return {"message": "AI Dispute Resolver API", "status": "running", "database": "Firestore"}

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy", 
        "timestamp": datetime.utcnow(),
        "database": "Firestore"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
