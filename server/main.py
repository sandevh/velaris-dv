from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.compare_routes import router as compare_router
from routes.test_route import router as test_router
try:
    from config import config
except ImportError:
    # Fallback if config.py doesn't exist
    class config:
        CORS_ORIGINS = ["*"]
        ENABLE_LOGGING = True

app = FastAPI(title="CSV Comparison API - Dynamic Configuration")

# CORS middleware with dynamic origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS, 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if config.ENABLE_LOGGING:
    import logging
    logging.basicConfig(level=logging.INFO)

# Include routers
app.include_router(compare_router, prefix="/compare")
app.include_router(test_router)
