from fastapi import FastAPI, HTTPException, Depends, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
import google.generativeai as genai
import os
from database import SessionLocal, engine, Base
from models import Project, Task, User, Notification
from fastapi import Body
from auth import hash_password, verify_password, create_access_token, decode_access_token
from ai_router import router as ai_router
from schemas import ProjectCreateFull
from fastapi import Query
from ai_router import router as ai_router
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all for now
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ai_router)

def generate_default_tasks(project_id, db):
    default_tasks = [
        {
            "name": "Receive Order", "role": "Project Coordinator",
            "who": "Project Coordinator",
            "what": "Receive client order and confirm it in the system",
            "when": "At the start of the project",
            "how": "Via client call/email and enter into dashboard"
        },
        {
            "name": "Get Drawing Approved", "role": "Project Engineer",
            "who": "Project Engineer",
            "what": "Submit design for approval by client",
            "when": "After order confirmation",
            "how": "Upload CAD files or drawings and notify client"
        },
        {
            "name": "Kick-off Meeting", "role": "Supervisor",
            "who": "Supervisor",
            "what": "Conduct initial meeting with stakeholders",
            "when": "Before execution begins",
            "how": "Schedule meeting, set agenda, share link/invite"
        },
        {
            "name": "Send Electrical Load", "role": "Project Engineer",
            "who": "Project Engineer",
            "what": "Calculate and share estimated electrical load",
            "when": "Before procurement starts",
            "how": "Use internal tools and email to vendor/client"
        },
        {
            "name": "Prepare Estimation", "role": "Measurement Engineer",
            "who": "Measurement Engineer",
            "what": "Estimate project cost and resource needs",
            "when": "After load calculation",
            "how": "Use templates and update the dashboard"
        },
        {
            "name": "Approve Estimation", "role": "Operation Head",
            "who": "Operation Head",
            "what": "Review and approve estimation",
            "when": "Post estimation submission",
            "how": "Check against budget and approve in dashboard"
        },
        {
            "name": "Raise PO", "role": "Purchase Coordinator",
            "who": "Purchase Coordinator",
            "what": "Create and submit Purchase Order",
            "when": "After estimation approval",
            "how": "Use company PO tool and send to vendors"
        },
        {
            "name": "Approve PO", "role": "Director",
            "who": "Director",
            "what": "Review and approve raised Purchase Order",
            "when": "After PO is raised",
            "how": "Check details in PO and sign-off in system"
        },
        {
            "name": "Upload RFQ", "role": "Purchase Coordinator",
            "who": "Purchase Coordinator",
            "what": "Upload Request for Quotation to system",
            "when": "After PO approval",
            "how": "Gather vendor quotes and upload to dashboard"
        },
        {
            "name": "Vendor Follow-ups", "role": "Purchase Coordinator",
            "who": "Purchase Coordinator",
            "what": "Follow up with vendors for quotes/delivery",
            "when": "After RFQ is sent",
            "how": "Email and call vendors regularly"
        },
        {
            "name": "Prepare Delivery Challan", "role": "Store Coordinator",
            "who": "Store Coordinator",
            "what": "Create delivery documentation",
            "when": "Before dispatch of goods",
            "how": "Use delivery challan format and print it"
        },
        {
            "name": "Receive Material", "role": "Store Coordinator",
            "who": "Store Coordinator",
            "what": "Physically receive and verify materials",
            "when": "Upon delivery",
            "how": "Check items, sign delivery challan, upload to system"
        },
        {
            "name": "Upload Invoice", "role": "Purchase Coordinator",
            "who": "Purchase Coordinator",
            "what": "Scan and upload vendor invoice",
            "when": "After material receipt",
            "how": "Use scanner and upload PDF to dashboard"
        },
        {
            "name": "Upload Measurement", "role": "Measurement Engineer",
            "who": "Measurement Engineer",
            "what": "Measure completed work and upload data",
            "when": "After job completion",
            "how": "Use on-site tools and submit via dashboard"
        },
        {
            "name": "Final Approvals", "role": "Operation Head",
            "who": "Operation Head",
            "what": "Give final sign-off on all project deliverables",
            "when": "At project closure",
            "how": "Cross-check all tasks and click approve"
        }
    ]

    for task_data in default_tasks:
        task = Task(
            name=task_data["name"],
            role=task_data["role"],
            status="Pending",
            project_id=project_id,
            who=task_data["who"],
            what=task_data["what"],
            when=task_data["when"],
            how=task_data["how"]
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

@app.get("/projects")
def list_projects(db: Session = Depends(get_db)):
    projects = db.query(Project).all()
    return [{"id": p.id, "name": p.name} for p in projects]


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
# @app.patch("/tasks/{task_id}/status")
# def update_task_status(task_id: int, status: str, db: Session = Depends(get_db)):
#     task = db.query(Task).filter(Task.id == task_id).first()
#     if not task:
#         raise HTTPException(status_code=404, detail="Task not found")

#     task.status = status
#     db.commit()
#     db.refresh(task)
#     return task


@app.get("/projects/{project_id}")
def get_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    return {
        "id": project.id,
        "name": project.name,
        "drawing_number": project.drawing_number,
        "drawing_version": project.drawing_version,
        "tasks": [
            {
                "id": t.id,
                "name": t.name,
                "status": t.status,
                "role": t.role,
                "who": t.who,
                "what": t.what,
                "when": t.when,
                "how": t.how
            }
            for t in project.tasks
        ]
    }

@app.get("/users")
def get_all_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    return [{"id": u.id, "username": u.username, "role": u.role} for u in users]
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

@app.get("/test-tasks")
def test_tasks(db: Session = Depends(get_db)):
    return db.query(Task).all()

@app.post("/projects/full-create")
def create_full_project(data: ProjectCreateFull, db: Session = Depends(get_db)):
    # Step 1: Create the Project
    new_project = Project(
        name=data.name,
        client_name=data.clientName,
        client_email=data.clientEmail,
        client_phone=data.clientPhone,
        address=data.address
    )
    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    # Updated FCM with extra details
    default_tasks = [
    {
        "name": "Receive Order", "role": "Project Coordinator",
        "who": "Project Coordinator",
        "what": "Receive client order and confirm it in the system",
        "when": "At the start of the project",
        "how": "Via client call/email, enter order into dashboard"
    },
    {
        "name": "Get Drawing Approved", "role": "Project Engineer",
        "who": "Project Engineer",
        "what": "Submit design for approval",
        "when": "After initial planning",
        "how": "Share CAD files or blueprints with client"
    },
    {
        "name": "Kick-off Meeting", "role": "Supervisor",
        "who": "Supervisor",
        "what": "Conduct the kick-off meeting with all stakeholders",
        "when": "After order confirmation",
        "how": "Schedule meeting, set agenda, send invites"
    },
    {
        "name": "Send Electrical Load", "role": "Project Engineer",
        "who": "Project Engineer",
        "what": "Send the estimated electrical load to the vendor",
        "when": "Before material procurement",
        "how": "Use estimation tools and email the results"
    },
    {
        "name": "Prepare Estimation", "role": "Measurement Engineer",
        "who": "Measurement Engineer",
        "what": "Estimate project cost and resource needs",
        "when": "After load calculation",
        "how": "Use templates and update the dashboard"
    },
    {
        "name": "Approve Estimation", "role": "Operation Head",
        "who": "Operation Head",
        "what": "Review and approve estimation",
        "when": "Post estimation submission",
        "how": "Check against budget and approve in dashboard"
    },
    {
        "name": "Raise PO", "role": "Purchase Coordinator",
        "who": "Purchase Coordinator",
        "what": "Create and submit Purchase Order",
        "when": "After estimation approval",
        "how": "Use company PO tool and send to vendors"
    },
    {
        "name": "Approve PO", "role": "Director",
        "who": "Director",
        "what": "Review and approve raised Purchase Order",
        "when": "After PO is raised",
        "how": "Check details in PO and sign-off in system"
    },
    {
        "name": "Upload RFQ", "role": "Purchase Coordinator",
        "who": "Purchase Coordinator",
        "what": "Upload Request for Quotation to system",
        "when": "After PO approval",
        "how": "Gather vendor quotes and upload to dashboard"
    },
    {
        "name": "Vendor Follow-ups", "role": "Purchase Coordinator",
        "who": "Purchase Coordinator",
        "what": "Follow up with vendors for quotes/delivery",
        "when": "After RFQ is sent",
        "how": "Email and call vendors regularly"
    },
    {
        "name": "Prepare Delivery Challan", "role": "Store Coordinator",
        "who": "Store Coordinator",
        "what": "Create delivery documentation",
        "when": "Before dispatch of goods",
        "how": "Use delivery challan format and print it"
    },
    {
        "name": "Receive Material", "role": "Store Coordinator",
        "who": "Store Coordinator",
        "what": "Physically receive and verify materials",
        "when": "Upon delivery",
        "how": "Check items, sign delivery challan, upload to system"
    },
    {
        "name": "Upload Invoice", "role": "Purchase Coordinator",
        "who": "Purchase Coordinator",
        "what": "Scan and upload vendor invoice",
        "when": "After material receipt",
        "how": "Use scanner and upload PDF to dashboard"
    },
    {
        "name": "Upload Measurement", "role": "Measurement Engineer",
        "who": "Measurement Engineer",
        "what": "Measure completed work and upload data",
        "when": "After job completion",
        "how": "Use on-site tools and submit via dashboard"
    },
    {
        "name": "Final Approvals", "role": "Operation Head",
        "who": "Operation Head",
        "what": "Give final sign-off on all project deliverables",
        "when": "At project closure",
        "how": "Cross-check all tasks and click approve"
    }
]
    # Create mapping: role ➝ userId
    role_user_map = {role.role: role.userId for role in data.roles}

    for task_data in default_tasks:
        role = task_data["role"]
        if role in role_user_map:
            user = db.query(User).filter(User.id == role_user_map[role]).first()
            if not user:
                raise HTTPException(status_code=404, detail=f"User with ID {role_user_map[role]} not found")

            task = Task(
                name=task_data["name"],
                role=role,
                user_id=user.id,
                project_id=new_project.id,
                who=task_data["who"],
                what=task_data["what"],
                when=task_data["when"],
                how=task_data["how"]
            )
            db.add(task)

    db.commit()
    for t in db.query(Task).filter(Task.project_id == new_project.id).all():
        print(t.name, t.who, t.what)
    return {"message": "Project and detailed tasks created successfully", "project_id": new_project.id}

@app.get("/my-tasks")
def get_my_tasks(user=Depends(get_current_user), db: Session = Depends(get_db)):
    tasks = db.query(Task).filter(Task.user_id == user.id).all()

    project_map = {}
    for task in tasks:
        if task.project_id not in project_map:
            project_map[task.project_id] = {
                "project_id": task.project.id,
                "project_name": task.project.name,
                "tasks": []
            }
        project_map[task.project_id]["tasks"].append({
            "id": task.id,
            "name": task.name,
            "status": task.status,
            "role": task.role,
            "who": task.who,
            "what": task.what,
            "when": task.when,
            "how": task.how
        })

    return list(project_map.values())

@app.patch("/tasks/{task_id}/status")
def update_task_status(
    task_id: int,
    status: str = Query(...),
    db: Session = Depends(get_db)
):
    print(f"🛠️ PATCH /tasks/{task_id}/status?status={status}")

    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        print("❌ Task not found.")
        raise HTTPException(status_code=404, detail="Task not found")

    print(f"✅ Found task: {task.name} | Old Status: {task.status} | Assigned to: {task.user_id}")

    task.status = status
    db.commit()
    db.refresh(task)

    if status == "In Progress":
        print("🔥 Status is In Progress — creating notification...")

        if task.user_id:
            notification = Notification(
                user_id=task.user_id,
                message=f"Your task '{task.name}' is now in progress.",
                task_id=task.id
            )
            db.add(notification)
            db.commit()
            print("✅ Notification created.")
        else:
            print("⚠️ Task has no assigned user, so notification was skipped.")

    else:
        print(f"ℹ️ Status is '{status}', no notification created.")

    return {
        "id": task.id,
        "name": task.name,
        "status": task.status
    }

@app.get("/notifications")
def get_notifications(user=Depends(get_current_user), db: Session = Depends(get_db)):
    notifications = db.query(Notification).filter(Notification.user_id == user.id).all()
    return [{"id": n.id, "message": n.message, "task_id": n.task_id} for n in notifications]

@app.delete("/notifications/{notif_id}")
def delete_notification(notif_id: int, user=Depends(get_current_user), db: Session = Depends(get_db)):
    notif = db.query(Notification).filter(Notification.id == notif_id, Notification.user_id == user.id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    db.delete(notif)
    db.commit()
    return {"message": "Notification deleted"}

@app.get("/test-notifs")
def test_notifications(db: Session = Depends(get_db)):
    notifs = db.query(Notification).all()
    return [{"id": n.id, "user_id": n.user_id, "message": n.message} for n in notifs]

@app.patch("/projects/{project_id}/drawing-version")
def update_drawing_version(
    project_id: int,
    version: str = Query(...),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    project.drawing_version = version
    db.commit()

    # Notify all users assigned to this project via tasks or roles
    user_ids = set()

    for task in project.tasks:
        if task.user_id:
            user_ids.add(task.user_id)

    for role in project.roles:
        if role.user_id:
            user_ids.add(role.user_id)

    for uid in user_ids:
        notif = Notification(
            user_id=uid,
            message=f"Drawing version updated to '{version}' for project '{project.name}'",
            task_id=None
        )
        db.add(notif)

    db.commit()
    return {"message": "Drawing version updated and notifications sent."}
