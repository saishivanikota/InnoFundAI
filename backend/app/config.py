import os
from urllib.parse import quote_plus, unquote
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, model_validator

class Settings(BaseSettings):
    port: int = Field(default=5001, validation_alias="PORT")
    jwt_secret: str = Field(default="platform_secret_jwt_key_2026", validation_alias="JWT_SECRET")
    node_env: str = Field(default="development", validation_alias="NODE_ENV")
    database_url: str = Field(
        default="postgresql://postgres:postgres@localhost:5432/research_platform",
        validation_alias="DATABASE_URL"
    )
    gemini_api_key: str | None = Field(default=None, validation_alias="GEMINI_API_KEY")

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @model_validator(mode="after")
    def make_url_safe(self) -> 'Settings':
        db_url = self.database_url
        if db_url and db_url.startswith("postgresql"):
            try:
                scheme, rest = db_url.split("://", 1)
                if "@" in rest:
                    userinfo, hostinfo = rest.rsplit("@", 1)
                    if ":" in userinfo:
                        username, password = userinfo.split(":", 1)
                        # Decode first in case already encoded, then encode
                        decoded_password = unquote(password)
                        encoded_password = quote_plus(decoded_password)
                        self.database_url = f"{scheme}://{username}:{encoded_password}@{hostinfo}"
            except Exception:
                pass
        return self

settings = Settings()
