from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import Column, Integer, String, Boolean, create_engine, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from pydantic import BaseModel
import os
from passlib.context import CryptContext
from fastapi import Header, HTTPException
from jose import jwt # Add this to your imports
from datetime import datetime, timedelta


# Security Settings
SECRET_KEY = os.getenv("JWT_SECRET", "fallback_key_for_local_testing")
ALGORITHM = "HS256"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

# DB Setup
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()


class DBUser(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    
    # Relationship: A user can have many tasks
    tasks = relationship("DBTask", back_populates="owner")


class UserCreate(BaseModel):
    username: str
    password: str


class DBTask(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    completed = Column(Boolean, default=False)
    priority = Column(String, default="Medium")
    # New: Link task to a user
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("DBUser", back_populates="tasks")


Base.metadata.create_all(bind=engine)

app = FastAPI()

# Middleware
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# Dependency
def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

# Schema
class TaskSchema(BaseModel):
    title: str
    completed: bool
    priority: str


def get_current_user(authorization: str = Header(None), db: Session = Depends(get_db)):
    if not authorization: raise HTTPException(status_code=401)
    token = authorization.split(" ")[1] # Remove "Bearer " prefix
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        return db.query(DBUser).filter(DBUser.username == username).first()
    except:
        raise HTTPException(status_code=401, detail="Invalid token")


@app.get("/")
def read_root():
    return {"message": "API is Online"}


@app.post("/tasks")
def create_task(task: TaskSchema, db: Session = Depends(get_db), current_user: DBUser = Depends(get_current_user)):
    # We explicitly link the task to the logged-in user's ID
    new_task = DBTask(title=task.title, completed=task.completed, owner_id=current_user.id)
    db.add(new_task)
    db.commit()
    return {"message": "Saved"}

@app.get("/tasks")
def get_tasks(db: Session = Depends(get_db), current_user: DBUser = Depends(get_current_user)):
    # Only fetch tasks belonging to this user
    return db.query(DBTask).filter(DBTask.owner_id == current_user.id).all()

@app.delete("/tasks/{title}/")
def delete_task(title: str, db: Session = Depends(get_db), current_user: DBUser = Depends(get_current_user)):
    # Ensure user can only delete their own tasks
    db.query(DBTask).filter(DBTask.title == title, DBTask.owner_id == current_user.id).delete()
    db.commit()
    return {"message": "Deleted"}




@app.post("/signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):
    hashed = get_password_hash(user.password)
    new_user = DBUser(username=user.username, hashed_password=hashed)
    db.add(new_user)
    db.commit()
    return {"message": "User created successfully"}    




# Add this function to generate the "Digital Key" (Token)
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=30) # Token lasts 30 mins
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Add the Login Route (The part that gives the user the key)
@app.post("/login")
def login(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(DBUser).filter(DBUser.username == user.username).first()
    if not db_user or not pwd_context.verify(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    token = create_access_token(data={"sub": db_user.username})
    return {"access_token": token, "token_type": "bearer"} 


@app.patch("/tasks/{task_id}/toggle")
def toggle_task(task_id: int, db: Session = Depends(get_db), current_user: DBUser = Depends(get_current_user)):
    task = db.query(DBTask).filter(DBTask.id == task_id, DBTask.owner_id == current_user.id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task.completed = not task.completed # Flips the switch
    db.commit()
    return {"message": "Updated", "completed": task.completed}       