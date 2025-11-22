"""
Dynamic configuration for the CSV comparison API.
All values can be overridden via environment variables.
"""
import os
import json

class Config:
    # API Configuration
    HOST = os.getenv("API_HOST", "0.0.0.0")
    PORT = int(os.getenv("API_PORT", "8000"))
    
    # CORS Settings
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")
    
    # Available Transforms
    AVAILABLE_TRANSFORMS = os.getenv("AVAILABLE_TRANSFORMS", "trim,lower,upper").split(",")
    
    # Available Comparison Rules
    AVAILABLE_RULES = json.loads(os.getenv(
        "AVAILABLE_RULES",
        '["equals", "case_insensitive_equals", "contains"]'
    ))
    
    # Feature Flags
    ENABLE_LOGGING = os.getenv("ENABLE_LOGGING", "true").lower() == "true"
    MAX_CSV_SIZE_MB = int(os.getenv("MAX_CSV_SIZE_MB", "50"))

config = Config()
