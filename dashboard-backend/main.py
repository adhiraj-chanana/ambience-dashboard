from fastapi import FastAPI, HTTPException, Depends, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware

from database import SessionLocal, engine, Base
from models import Project, Task, User
from fastapi import Body
from auth import hash_password, verify_password, create_access_token, decode_access_token

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all for now
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
def generate_default_tasks(project_id, db):
    default_tasks = [
        {"name": "Receive Order", "role": "Project Coordinator"},
        {"name": "Get Drawing Approved", "role": "Project Engineer"},
        {"name": "Kick-off Meeting", "role": "Supervisor"},
        {"name": "Send Electrical Load", "role": "Project Engineer"},
        {"name": "Prepare Estimation", "role": "Measurement Engineer"},
        {"name": "Approve Estimation", "role": "Operation Head"},
        {"name": "Raise PO", "role": "Purchase Coordinator"},
        {"name": "Approve PO", "role": "Director"},
        {"name": "Upload RFQ", "role": "Purchase Coordinator"},
        {"name": "Vendor Follow-ups", "role": "Purchase Coordinator"},
        {"name": "Prepare Delivery Challan", "role": "Store Coordinator"},
        {"name": "Receive Material", "role": "Store Coordinator"},
        {"name": "Upload Invoice", "role": "Purchase Coordinator"},
        {"name": "Upload Measurement", "role": "Measurement Engineer"},
        {"name": "Final Approvals", "role": "Operation Head"}
    ]

    for task_data in default_tasks:
        task = Task(
            name=task_data["name"],
            role=task_data["role"],
            status="Pending",
            project_id=project_id
        )
        db.add(task)
    db.commit()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
# Register model
class UserCreate(BaseModel):
    username: str
    password: str
    role: str

@app.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already exists")
    
    db_user = User(
        username=user.username,
        password_hash=hash_password(user.password),
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return {"message": "User registered successfully"}

# Login model
class LoginInput(BaseModel):
    username: str
    password: str

@app.post("/login")
def login(input: LoginInput = Body(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == input.username).first()
    if not user or not verify_password(input.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token = create_access_token({"sub": user.username, "role": user.role})
    return {"access_token": token, "token_type": "bearer"}
# Create Project
@app.post("/projects/")
def create_project(name: str, db: Session = Depends(get_db)):
    project = Project(name=name)
    db.add(project)
    db.commit()
    db.refresh(project)

    # 🔥 AUTO-GENERATE TASKS HERE:
    generate_default_tasks(project.id, db)

    return project


# Read all Projects
@app.get("/projects/")
def read_projects(db: Session = Depends(get_db)):
    projects = db.query(Project).all()
    result = []
    for project in projects:
        result.append({
            "id": project.id,
            "name": project.name,
            "tasks": [{"id": t.id, "name": t.name, "status": t.status, "role": t.role} for t in project.tasks]
        })
    return result
@app.patch("/tasks/{task_id}/status")
def update_task_status(task_id: int, status: str, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.status = status
    db.commit()
    db.refresh(task)
    return task


@app.get("/projects/{project_id}")
def get_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    return {
        "id": project.id,
        "name": project.name,
        "tasks": [
            {"id": t.id, "name": t.name, "status": t.status, "role": t.role}
            for t in project.tasks
        ]
    }
# Delete Project
@app.delete("/projects/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(project)
    db.commit()
    return {"message": "Project deleted"}
# Create Task
@app.post("/projects/{project_id}/tasks/")
def create_task(project_id: int, name: str, db: Session = Depends(get_db)):
    task = Task(name=name, project_id=project_id)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

# Get Tasks for Project
@app.get("/projects/{project_id}/tasks/")
def get_tasks(project_id: int, db: Session = Depends(get_db)):
    return db.query(Task).filter(Task.project_id == project_id).all()

# Delete Task
@app.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return {"message": "Task deleted"}

def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing token")
    
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.username == payload["sub"]).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user
