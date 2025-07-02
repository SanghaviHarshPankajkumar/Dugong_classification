"""
FastAPI backend for the Dugong Classification System.
Provides REST API endpoints and handles CORS, file uploads, OAuth login, and background tasks.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from dotenv import load_dotenv
import asyncio
import os
from auth.login import router as login_router
from api.routes import router as api_router
# from auth.google_auth import router as auth_router
from core.cleanup import cleanup_expired_sessions
from core.logger import setup_logger
from core.config import BASE_DIR
from fastapi.staticfiles import StaticFiles

# Load environment variables from .env file
load_dotenv()

# Get secret key from environment
SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret")

# App logger
app_logger = setup_logger("app", "logs/app.log")

# Initialize FastAPI app
app = FastAPI(title="YOLO Image Uploader")
app_logger.info("App initialized")
app.include_router(login_router)

# Serve uploads directory as static files
app.mount(f"/{BASE_DIR.name}", StaticFiles(directory=BASE_DIR), name="uploads")

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Add session middleware required for OAuth login
app.add_middleware(SessionMiddleware, secret_key=SECRET_KEY)

# Ensure base directories exist
os.makedirs(BASE_DIR, exist_ok=True)

# Background task: periodically clean expired session folders
@app.on_event("startup")
async def startup_event():
    app_logger.info("Starting cleanup background task")
    asyncio.create_task(cleanup_expired_sessions())

# Register routers
app.include_router(api_router, prefix="/api")     # Main API
# app.include_router(auth_router)                   # Google OAuth
app.include_router(login_router)                  # Email/Password Login