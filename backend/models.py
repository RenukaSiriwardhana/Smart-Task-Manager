from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    due_date = Column(String, nullable=True) 
    due_time = Column(String, nullable=True) 
    is_completed = Column(Boolean, default=False) # Tracks completion status
    owner_id = Column(Integer, ForeignKey("users.id"))