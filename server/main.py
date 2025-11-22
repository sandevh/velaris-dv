from fastapi import FastAPI
from routes.compare_routes import router as compare_router

app = FastAPI(title="External → Velaris Comparison API")

app.include_router(compare_router, prefix="/compare")
