from pydantic import BaseModel
from typing import Optional

# Base schema with common attributes
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None

# Schema for creating a new task (inherits from TaskBase)
class TaskCreate(TaskBase):
    pass

# Schema for returning a task (includes id and completed status)
class TaskResponse(TaskBase):
    id: int
    completed: bool

    # Tell Pydantic to read data even if it is an ORM model (like our SQLAlchemy model)
    class Config:
        from_attributes = True