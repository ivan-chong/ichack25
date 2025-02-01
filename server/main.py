from fastapi import FastAPI, Path, HTTPException
from api.routes import logic
from pydantic import BaseModel
from typing import List, Tuple
import json

app = FastAPI()

app.include_router(logic.router)

class ARequest(BaseModel):
    operation: str

class Question(BaseModel):
    id: int
    blocks: List[str]
    description: str

@app.get("/")
async def root():
    return {"message": "hello world"}

questions = None
with open("questions.json", "r") as f:
    questions = json.load(f)

@app.get("/questions/{id}", response_model=Question)
async def get_question(id: int = Path(..., description="id of question")):
    if str(id) not in questions:
        raise HTTPException(status_code=404)
    return questions[str(id)]