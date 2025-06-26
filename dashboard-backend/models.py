from sqlalchemy import Column, Integer, String, ForeignKey, Date
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String)

    tasks = relationship("Task", back_populates="user")
    role_assignments = relationship("RoleAssignment", back_populates="user")

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    address = Column(String, nullable=True)
    client_name = Column(String, nullable=True)
    client_email = Column(String, nullable=True)
    client_phone = Column(String, nullable=True)
    drawing_number = Column(String, nullable=True)
    drawing_version = Column(String, nullable=True)

    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")
    roles = relationship("RoleAssignment", back_populates="project", cascade="all, delete-orphan")

class RoleAssignment(Base):
    __tablename__ = "role_assignments"
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    role = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))

    project = relationship("Project", back_populates="roles")
    user = relationship("User", back_populates="role_assignments")

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    status = Column(String, default="Pending")
    role = Column(String)
    project_id = Column(Integer, ForeignKey("projects.id"))
    user_id = Column(Integer, ForeignKey("users.id"))

    who = Column(String, nullable=True)
    what = Column(String, nullable=True)
    when = Column(String, nullable=True)
    how = Column(String, nullable=True)

    project = relationship("Project", back_populates="tasks")
    user = relationship("User", back_populates="tasks")

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    message = Column(String)
    task_id = Column(Integer, ForeignKey("tasks.id"))
    
    user = relationship("User")
    task = relationship("Task")
