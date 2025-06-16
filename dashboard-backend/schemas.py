from pydantic import BaseModel
from typing import List

class TaskModel(BaseModel):
    id: int
    name: str
    status: str
    role: str

class ProjectModel(BaseModel):
    id: int
    name: str
    tasks: List[TaskModel]

class AIRequest(BaseModel):
    query: str  # ✅ The user input (natural language)
