# One-time user creation script
from passlib.context import CryptContext
from pymongo import MongoClient

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
hashed = pwd_context.hash("secret123")

client = MongoClient("mongodb://localhost:27017")
db = client["DugongMonitoring"]
users = db["users"]
users.insert_one({
    "email": "test@example.com",
    "hashed_password": hashed
})
