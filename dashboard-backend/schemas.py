from pydantic import BaseModel
from typing import List
from typing import List
from pydantic import BaseModel, EmailStr

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



class RoleAssignment(BaseModel):
    role: str
    userId: int

class ProjectCreateFull(BaseModel):
    name: str
    clientName: str
    clientEmail: EmailStr
    clientPhone: str
    address: str
    roles: List[RoleAssignment]

from pydantic import BaseModel, EmailStr
from typing import List

class RoleAssignment(BaseModel):
    role: str  # still needed to map predefined role ➝ userId
    userId: int

class ProjectCreateFull(BaseModel):
    name: str
    clientName: str
    clientEmail: EmailStr
    clientPhone: str
    address: str
    roles: List[RoleAssignment]
