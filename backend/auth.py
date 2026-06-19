from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext

# Secret key used to sign the JWT token (Keep this safe!)
SECRET_KEY = "renuka_super_secret_key_for_task_app"
ALGORITHM = "HS256"
# Token validity duration
ACCESS_TOKEN_EXPIRE_MINUTES = 30 

# Setup for password hashing using bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 1. Function to hash a plain text password
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# 2. Function to verify a plain password against the hashed one in DB
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# 3. Function to generate a new JWT access token
def create_access_token(data: dict):
    to_encode = data.copy()
    # Calculate token expiration time
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    
    # Generate and return the encoded token string
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt