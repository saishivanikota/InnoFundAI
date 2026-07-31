from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import datetime
from app.modules.profile.schemas import ProfileResponse

class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: str = "researcher"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    emailOrUsername: str
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
    profile: ProfileResponse | None = None

class SessionResponse(BaseModel):
    user: UserResponse
    profile: ProfileResponse | None = None
