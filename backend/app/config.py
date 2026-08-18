import os
from pydantic_settings import BaseSettings

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DEFAULT_DB_PATH = os.path.join(BASE_DIR, "research_platform.db").replace("\\", "/")
DEFAULT_DB_URL = f"sqlite:///{DEFAULT_DB_PATH}"

class Settings(BaseSettings):
    database_url: str = os.getenv("DATABASE_URL", DEFAULT_DB_URL)
    secret_key: str = os.getenv("SECRET_KEY", "supersecretkeyforresearchplatformjwt")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")

    class Config:
        env_file = os.path.join(BASE_DIR, ".env")
        extra = "ignore"

settings = Settings()
