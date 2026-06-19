from sqlalchemy import Column, Integer, String, Boolean
from database import Base

# Define the Task model representing the 'tasks' table in the database
class Task(Base):
    __tablename__ = "tasks"

    # Unique ID for each task (Primary Key)
    id = Column(Integer, primary_key=True, index=True)
    
    # Title of the task
    title = Column(String, index=True)
    
    # Detailed description of the task
    description = Column(String, index=True, default="")
    
    # Status to check if the task is completed or not (default is False)
    completed = Column(Boolean, default=False)