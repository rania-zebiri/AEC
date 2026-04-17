from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Claude API
    ANTHROPIC_API_KEY: str
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # App
    DEBUG: bool = False
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000"]
    
    # Retention defaults
    DEFAULT_RETENTION_CAPACITY_DZD: int = 1_000_000_000
    DEFAULT_REINSURANCE_RATIO: float = 0.40
    
    class Config:
        env_file = ".env"

settings = Settings()