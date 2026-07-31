import jwt
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.modules.auth.crud import (
    create_user,
    get_user_by_email_or_username,
    get_user_by_id,
    get_user_by_username,
    get_user_by_email,
    verify_password
)
from app.modules.auth.schemas import UserCreate, UserLogin, UserResponse
from app.modules.profile.schemas import ProfileResponse

router = APIRouter()
security = HTTPBearer()

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(hours=24)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.jwt_secret, algorithm="HS256")

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
        user_id: int = payload.get("id")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: user ID missing"
            )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
    
    user = get_user_by_id(db, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    return user


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check if username or email already registered
    existing_user = get_user_by_username(db, user_in.username)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered."
        )
    
    existing_email = get_user_by_email(db, user_in.email)
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered."
        )
    
    user = create_user(db, user_in)
    
    # Generate JWT
    token = create_access_token(data={"id": user.id, "username": user.username, "role": user.role})
    
    return {
        "message": "Registration successful",
        "token": token,
        "user": UserResponse.model_validate(user)
    }


@router.post("/login")
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    user = get_user_by_email_or_username(db, login_in.emailOrUsername)
    if not user or not verify_password(login_in.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials."
        )
    
    token = create_access_token(data={"id": user.id, "username": user.username, "role": user.role})
    
    profile_data = None
    if user.profile:
        profile_data = ProfileResponse.model_validate(user.profile)

    return {
        "message": "Login successful",
        "token": token,
        "user": UserResponse.model_validate(user),
        "profile": profile_data
    }


@router.get("/me")
def me(current_user=Depends(get_current_user)):
    profile_data = None
    if current_user.profile:
        profile_data = ProfileResponse.model_validate(current_user.profile)
        
    return {
        "user": UserResponse.model_validate(current_user),
        "profile": profile_data
    }
