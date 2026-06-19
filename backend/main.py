from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import models
import schemas
from database import SessionLocal, engine

# Create all database tables based on our SQLAlchemy models
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Configure CORS (Cross-Origin Resource Sharing)
# This allows our React frontend (running on a different port) to communicate with this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

# Dependency to get the database session for each API request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ROOT: Just a simple test endpoint
@app.get("/")
def read_root():
    return {"message": "Hello from Smart Task Manager! 🚀"}

# 1. CREATE: Add a new task to the database
@app.post("/tasks/", response_model=schemas.TaskResponse)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db)):
    db_task = models.Task(title=task.title, description=task.description)
    db.add(db_task)
    db.commit()
    db.refresh(db_task) # Retrieve the new task with its generated ID
    return db_task

# 2. READ: Get the list of all tasks from the database
@app.get("/tasks/", response_model=list[schemas.TaskResponse])
def read_tasks(db: Session = Depends(get_db)):
    tasks = db.query(models.Task).all()
    return tasks

# 3. UPDATE (Status): Toggle the 'completed' status of a task (True/False)
@app.put("/tasks/{task_id}", response_model=schemas.TaskResponse)
def update_task_status(task_id: int, db: Session = Depends(get_db)):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if db_task:
        db_task.completed = not db_task.completed # Flip the status
        db.commit()
        db.refresh(db_task)
    return db_task

# 4. UPDATE (Text): Edit the actual title of a task
@app.put("/tasks/{task_id}/edit", response_model=schemas.TaskResponse)
def edit_task_text(task_id: int, task: schemas.TaskCreate, db: Session = Depends(get_db)):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if db_task:
        db_task.title = task.title # Update with the new title
        db.commit()
        db.refresh(db_task)
    return db_task

# 5. DELETE: Remove a task entirely from the database
@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    db_task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if db_task:
        db.delete(db_task)
        db.commit()
        return {"message": "Task deleted successfully"}
    return {"error": "Task not found"}