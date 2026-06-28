from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt

import models, schemas, auth, ai
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
        
    user = db.query(models.User).filter(models.User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

@app.post("/register", response_model=schemas.UserResponse)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_pw = auth.get_password_hash(user.password)
    new_user = models.User(username=user.username, hashed_password=hashed_pw)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/login")
def login_user(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/tasks/", response_model=schemas.TaskResponse)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Pull up to 5 incomplete items to form the behavioral baseline context
    existing_tasks = db.query(models.Task).filter(
        models.Task.owner_id == current_user.id, 
        models.Task.is_completed == False
    ).limit(5).all()
    
    task_history = ", ".join([f"{t.title} (Due: {t.due_date} {t.due_time})" for t in existing_tasks])
    if not task_history:
        task_history = "No past tasks yet."

    smart_description = ai.get_smart_description(task.title, str(task.due_date), str(task.due_time), task_history)
    
    new_task = models.Task(
        title=task.title, 
        description=smart_description, 
        due_date=task.due_date,
        due_time=task.due_time,
        owner_id=current_user.id
    )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task

@app.get("/tasks/", response_model=list[schemas.TaskResponse])
def read_tasks(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Task).filter(models.Task.owner_id == current_user.id).all()

# Updated PUT method to handle full edits and regenerate AI descriptions
@app.put("/tasks/{task_id}", response_model=schemas.TaskResponse)
def update_task_status(task_id: int, task_update: schemas.TaskUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_task = db.query(models.Task).filter(models.Task.id == task_id, models.Task.owner_id == current_user.id).first()
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Check if we need to regenerate the AI description (if title, date, or time changed)
    needs_ai_update = False
    
    if task_update.title is not None and task_update.title != db_task.title:
        db_task.title = task_update.title
        needs_ai_update = True
        
    if task_update.due_date is not None and task_update.due_date != db_task.due_date:
        db_task.due_date = task_update.due_date
        needs_ai_update = True
        
    if task_update.due_time is not None and task_update.due_time != db_task.due_time:
        db_task.due_time = task_update.due_time
        needs_ai_update = True

    # Update completion status if provided
    if task_update.is_completed is not None:
        db_task.is_completed = task_update.is_completed

    # Regenerate AI Smart Description if core details changed
    if needs_ai_update:
        existing_tasks = db.query(models.Task).filter(
            models.Task.owner_id == current_user.id, 
            models.Task.is_completed == False,
            models.Task.id != task_id # Exclude the task currently being edited
        ).limit(5).all()
        
        task_history = ", ".join([f"{t.title} (Due: {t.due_date} {t.due_time})" for t in existing_tasks])
        if not task_history:
            task_history = "No past tasks yet."

        smart_description = ai.get_smart_description(db_task.title, str(db_task.due_date), str(db_task.due_time), task_history)
        db_task.description = smart_description

    db.commit()
    db.refresh(db_task)
    return db_task

@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_task = db.query(models.Task).filter(models.Task.id == task_id, models.Task.owner_id == current_user.id).first()
    if db_task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(db_task)
    db.commit()
    return {"message": "Task deleted"}