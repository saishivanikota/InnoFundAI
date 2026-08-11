from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.database import get_db
from app.modules.auth.models import User
from app.modules.auth.schemas import UserRegister, UserLogin, AuthResponse, UserResponse
from app.modules.auth.crud import get_user_by_email_or_username, get_user_by_id, create_user
from app.modules.auth.utils import verify_password, create_access_token, decode_access_token
from app.modules.profile.crud import get_profile_by_user_id
from app.modules.profile.schemas import ProfileResponse

router = APIRouter()
security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id = int(payload["sub"])
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    existing = get_user_by_email_or_username(db, user_in.email) or get_user_by_email_or_username(db, user_in.username)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email or username already exists"
        )
    
    user = create_user(db, user_in)
    access_token = create_access_token({"sub": str(user.id)})
    profile = get_profile_by_user_id(db, user.id)
    profile_res = ProfileResponse.model_validate(profile) if profile else None
    
    return AuthResponse(
        token=access_token,
        user=UserResponse.model_validate(user),
        profile=profile_res
    )

@router.post("/login", response_model=AuthResponse)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    user = get_user_by_email_or_username(db, user_in.emailOrUsername)
    if not user or not verify_password(user_in.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email/username or password"
        )
    
    access_token = create_access_token({"sub": str(user.id)})
    profile = get_profile_by_user_id(db, user.id)
    profile_res = ProfileResponse.model_validate(profile) if profile else None

    return AuthResponse(
        token=access_token,
        user=UserResponse.model_validate(user),
        profile=profile_res
    )

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = get_profile_by_user_id(db, current_user.id)
    profile_res = ProfileResponse.model_validate(profile) if profile else None
    return {
        "user": UserResponse.model_validate(current_user),
        "profile": profile_res
    }
