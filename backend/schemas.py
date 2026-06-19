from pydantic import BaseModel
from typing import Optional

# --- NEW: User Schemas ---
# For creating a new user (receives plain password)
class UserCreate(BaseModel):
    username: str
    password: str

# For returning user info (NEVER return the password!)
class UserResponse(BaseModel):
    id: int
    username: str
    
    class Config:
        from_attributes = True

# --- UPDATED: Task Schemas ---
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = ""

class TaskCreate(TaskBase):
    pass

class TaskResponse(TaskBase):
    id: int
    completed: bool
    owner_id: int # NEW: Links to the user who created it

    class Config:
        from_attributes = True