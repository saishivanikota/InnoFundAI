from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.modules.auth.models import User
from app.modules.auth.schemas import UserRegister
from app.modules.auth.utils import hash_password

def get_user_by_email_or_username(db: Session, identifier: str):
    return db.query(User).filter(
        or_(User.email == identifier, User.username == identifier)
    ).first()

def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def create_user(db: Session, user_in: UserRegister):
    hashed_pwd = hash_password(user_in.password)
    user = User(
        username=user_in.username,
        email=user_in.email,
        password=hashed_pwd,
        role=user_in.role or "researcher"
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
