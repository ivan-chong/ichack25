from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class RequestModel(BaseModel):
    request: str

@router.post("/request")
def calculate(request: RequestModel):
    return {"result": "hello"}