from fastapi import APIRouter
from pydantic import BaseModel

class Request(BaseModel):
    request: str

@router.post("/request")
def calculate(request: Request):
    if 1 == 1:
        return {"result": "hello"}