from fastapi import FastAPI, APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from pymongo import MongoClient
from dotenv import load_dotenv
import certifi
import os
import uuid


from passlib.handlers import bcrypt

# Force Passlib to skip the broken _bcrypt module
bcrypt.set_backend("builtin")  # or "pybcrypt" if available

# Load environment variables
load_dotenv()

# Only define a router here; the main application includes it
router = APIRouter(prefix="/auth", tags=["auth"])

# Config
MONGO_URL = os.getenv("MONGO_URI", "mongodb+srv://dugongmonitoring:6nzCWvI0pGE4xTq9@cluster0.bbqoo1e.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")  # Changed from MONGO_URL to MONGO_URI
SECRET_KEY = os.getenv("SECRET_KEY", "fallback-secret")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# MongoDB setup with short timeouts so requests fail fast instead of 502 from the proxy
client = None
user_collection = None
try:
    client = MongoClient(
        MONGO_URL,
        serverSelectionTimeoutMS=2000,
        connectTimeoutMS=2000,
        socketTimeoutMS=2000,
        tls=True,
        tlsCAFile=certifi.where(),
    )
    # Test the connection (will respect the short timeout)
    client.admin.command("ping")
    db = client["DugongMonitoring"]
    user_collection = db["users"]
    print(f"Successfully connected to MongoDB at {MONGO_URL}")
except Exception as e:
    # Defer raising to the endpoint so the app can still start
    print(f"Failed to connect to MongoDB at startup: {e}")

# Request and response models
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    session_id: str
    username :str
    email: str

# Token creation function
def create_token(data: dict, expires_delta: timedelta):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Login endpoint
@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest):
    try:
        print("MONGO_URL:", MONGO_URL)
        print("Login request received:", request.email)

        # Ensure Mongo client/collection are available at request time
        global client, user_collection
        try:
            if client is None or user_collection is None:
                client = MongoClient(
                    MONGO_URL,
                    serverSelectionTimeoutMS=2000,
                    connectTimeoutMS=2000,
                    socketTimeoutMS=2000,
                    tls=True,
                    tlsCAFile=certifi.where(),
                )
                client.admin.command("ping")
                db = client["DugongMonitoring"]
                user_collection = db["users"]
            else:
                # Test MongoDB connection
                client.admin.command("ping")
            print("MongoDB connection successful")
        except Exception as db_err:
            # Return a clear, fast error instead of letting the proxy time out
            raise HTTPException(status_code=503, detail=f"Auth database unavailable: {db_err}")

        user = user_collection.find_one({"email": request.email})
        print("User found:", bool(user))
        if not user:
            raise HTTPException(status_code=401, detail="Email not found")

        stored_password = user.get("hashed_password", "")
        print("Password check starting...")

        # Handle both hashed and accidentally stored plaintext passwords (only for dev)
        if stored_password.startswith("$2b$"):
            password_valid = pwd_context.verify(request.password, stored_password)
        else:
            print("WARNING: Plaintext password detected in DB. This is not secure!")
            password_valid = request.password == stored_password

        if not password_valid:
            raise HTTPException(status_code=401, detail="Incorrect password")

        username = user.get("username", "")
        useremail = user.get("email", "")
        
        # --- SESSION ID LOGIC ---
        # Always generate a new session ID on every login for security
        session_id = str(uuid.uuid4())
        user_collection.update_one({"email": request.email}, {"$set": {"session_id": session_id}})

        token = create_token(
            {"sub": user["email"]},
            timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        )

        return {"access_token": token, "token_type": "bearer", "session_id": session_id, "email": useremail, "username": username}
    
    except HTTPException:
        # Re-raise HTTP exceptions (like 401 errors)
        raise
    except Exception as e:
        print(f"Login error: {str(e)}")
        print(f"Error type: {type(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Note: Do not create or include a FastAPI app instance here.
# The main application (server/main.py) mounts this router.
