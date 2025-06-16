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

@router.post("/ai/analyze")
def analyze_project(request: AIRequest, db: Session = Depends(get_db)):
    query = request.query.lower()

    # Try to find matching project
    project = db.query(Project).filter(Project.name.ilike(f"%{query}%")).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Build input text for Gemini
    input_text = f"Project Name: {project.name}\n\nTasks:\n"
    for task in project.tasks:
        input_text += f"- {task.name} (Role: {task.role}, Status: {task.status})\n"

    model = genai.GenerativeModel("models/gemini-1.5-flash")

    response = model.generate_content(
        f"You are a project manager AI. Analyze the following project status, identify risks, summarize progress, and give a client-friendly update:\n\n{input_text}"
    )

    return {"analysis": response.text}
