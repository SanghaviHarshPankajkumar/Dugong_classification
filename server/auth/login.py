from fastapi import FastAPI, APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from pymongo import MongoClient
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# FastAPI app and router
app = FastAPI()
router = APIRouter(prefix="/auth", tags=["auth"])

# Config
MONGO_URL = os.getenv("MONGO_URL")
SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# MongoDB setup
client = MongoClient(MONGO_URL)
db = client["DugongMonitoring"]
user_collection = db["users"]

# Request and response models
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str

# Token creation function
def create_token(data: dict, expires_delta: timedelta):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Login endpoint
@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest):
    print("MONGO_URL:", MONGO_URL)
    print("Login request received:", request.email)

    user = user_collection.find_one({"email": request.email})

    if not user:
        raise HTTPException(status_code=401, detail="Email not found")

    stored_password = user.get("hashed_password", "")
    print("Stored password:", stored_password)

    # Handle both hashed and accidentally stored plaintext passwords (only for dev)
    if stored_password.startswith("$2b$"):
        password_valid = pwd_context.verify(request.password, stored_password)
    else:
        print("WARNING: Plaintext password detected in DB. This is not secure!")
        password_valid = request.password == stored_password

    if not password_valid:
        raise HTTPException(status_code=401, detail="Incorrect password")

    token = create_token(
        {"sub": user["email"]},
        timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return {"access_token": token, "token_type": "bearer"}

# Include the router in the app
app.include_router(router)
