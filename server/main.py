from fastapi import FastAPI
from api.routes import logic

app = FastAPI()
app.include_router(logic)

class ARequest(BaseModel):
    operation: str


@app.get("/")
async def root():
    return {"message": "hello world"}