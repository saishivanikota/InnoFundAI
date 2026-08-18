from pydantic import BaseModel, EmailStr
from typing import Optional
from app.modules.profile.schemas import ProfileResponse

class UserRegister(BaseModel):
    username: Optional[str] = None
    full_name: Optional[str] = None
    email: EmailStr
    password: str
    role: Optional[str] = "researcher"

class UserLogin(BaseModel):
    emailOrUsername: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str

    class Config:
        from_attributes = True

class AuthResponse(BaseModel):
    token: str
    user: UserResponse
    profile: Optional[ProfileResponse] = None
