import os
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt

# Argon2 hashing setup to eliminate system bcrypt version conflicts
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# Get the secret key securely from environment variables
SECRET_KEY = os.getenv("SECRET_KEY", "local_development_secret_key_change_in_prod")
ALGORITHM = "HS256"

# Encrypts the user password
def get_password_hash(password: str):
    return pwd_context.hash(password)

# Validates plain password against the stored database hash
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# Generates session JWT tokens valid for 30 minutes
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=30)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)