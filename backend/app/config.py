import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./research_platform.db")
    secret_key: str = os.getenv("SECRET_KEY", "supersecretkeyforresearchplatformjwt")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
