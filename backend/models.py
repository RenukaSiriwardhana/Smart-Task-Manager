from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

# --- NEW: User Table ---
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True) # Username must be unique
    hashed_password = Column(String) # We never store plain text passwords!

    # Relationship: A user can have multiple tasks
    tasks = relationship("Task", back_populates="owner")


# --- UPDATED: Task Table ---
class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, index=True, default="")
    completed = Column(Boolean, default=False)
    
    # NEW: Link this task to a specific user (Foreign Key)
    owner_id = Column(Integer, ForeignKey("users.id"))
    
    # Relationship: This task belongs to one owner (user)
    owner = relationship("User", back_populates="tasks")