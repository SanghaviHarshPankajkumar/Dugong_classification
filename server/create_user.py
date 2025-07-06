# One-time user creation script
from passlib.context import CryptContext
from pymongo import MongoClient
import sys

try:
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    hashed = pwd_context.hash("secret123")

    #client = MongoClient("mongodb://localhost:27017")
    client = MongoClient("mongodb+srv://dugongmonitoring:6nzCWvI0pGE4xTq9@cluster0.bbqoo1e.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")  # Use service name for Docker
    db = client["DugongMonitoring"]
    users = db["users"]
    
    # Check if user already exists
    existing_user = users.find_one({"email": "test@example.com"})
    if existing_user:
        print("User already exists, skipping creation.")
    else:
        users.insert_one({
            "email": "test@example.com",
            "hashed_password": hashed
        })
        print("User created successfully.")
    
    client.close()
    
except Exception as e:
    print(f"Error creating user: {e}")
    sys.exit(1)
