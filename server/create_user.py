# One-time user creation script
from pymongo import MongoClient
import sys
import hashlib
import secrets

# Simple password hashing function using hashlib
def hash_password(password: str) -> str:
    """Hash a password using SHA-256 with salt"""
    salt = secrets.token_hex(16)
    hash_obj = hashlib.sha256((password + salt).encode())
    return f"{salt}${hash_obj.hexdigest()}"

try:
    hashed = hash_password("secret123")

    #client = MongoClient("mongodb://localhost:27017")
    client = MongoClient("mongodb+srv://dugongmonitoring:6nzCWvI0pGE4xTq9@cluster0.bbqoo1e.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")  # Use service name for Docker
    db = client["DugongMonitoring"]
    users = db["users"]
    
    # Check if user already exists
    existing_user = users.find_one({"email": "dugongmonitoring@gmail.com"})
    if existing_user:
        print("User already exists, skipping creation.")
    else:
        users.insert_one({
            "email": "dugongmonitoring@gmail.com",
            "username": "dugongmonitoring",
            "hashed_password": hashed
        })
        print("User created successfully.")
    
    client.close()
    
except Exception as e:
    print(f"Error creating user: {e}")
    sys.exit(1)
