from pydantic import BaseModel
from typing import Optional
from datetime import date, time

class TaskUpdate(BaseModel):
    is_completed: Optional[bool] = None
    title: Optional[str] = None
    due_date: Optional[date] = None # සමහරවිට ඔයා මෙතන str පාවිච්චි කරනවා ඇති, එහෙම නම් str දෙන්න
    due_time: Optional[time] = None # මෙතනත් str නම් str දෙන්න

class UserCreate(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    class Config:
        from_attributes = True

class TaskCreate(BaseModel):
    title: str
    due_date: Optional[str] = None 
    due_time: Optional[str] = None 

# New schema for handling status updates explicitly via request body
class TaskUpdate(BaseModel):
    is_completed: bool

class TaskResponse(BaseModel):
    id: int
    title: str
    description: str
    due_date: Optional[str] = None
    due_time: Optional[str] = None
    is_completed: bool 
    owner_id: int
    class Config:
        from_attributes = True