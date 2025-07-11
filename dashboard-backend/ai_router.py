from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Project, Task
from schemas import AIRequest
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("API_KEY"))

router = APIRouter()
from pydantic import BaseModel

class AIRequest(BaseModel):
    projectName: str
    prompt: str

@router.post("/ai/analyze")
def analyze_project(request: AIRequest, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.name.ilike(f"%{request.projectName}%")).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Build project context
    input_text = f"Project Name: {project.name}\n"
    if project.address:
        input_text += f"Address: {project.address}\n"
    if project.client_name:
        input_text += f"Client: {project.client_name}, Email: {project.client_email}, Phone: {project.client_phone}\n"
    input_text += "Tasks:\n"
    if project.tasks:
        for task in project.tasks:
            input_text += f"- {task.name} (Role: {task.role}, Status: {task.status}"
            if task.who: input_text += f", Who: {task.who}"
            if task.when: input_text += f", When: {task.when}"
            input_text += ")\n"
    else:
        input_text += "- No tasks found.\n"

    # Final prompt to Gemini
    final_prompt = f"Project data:\n\n{input_text}\n\nUser request: \"{request.prompt}\""
    model = genai.GenerativeModel("models/gemini-1.5-flash")
    response = model.generate_content(final_prompt)

    return {"analysis": response.text}
