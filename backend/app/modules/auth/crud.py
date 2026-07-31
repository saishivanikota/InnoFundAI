import bcrypt
from sqlalchemy.orm import Session
from app.modules.auth.models import User
from app.modules.auth.schemas import UserCreate

def hash_password(password: str) -> str:
    # bcrypt.gensalt() returns bytes, hashpw requires bytes
    salt = bcrypt.gensalt(10)
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def get_user_by_email_or_username(db: Session, value: str):
    return db.query(User).filter(
        (User.email == value) | (User.username == value)
    ).first()

def create_user(db: Session, user_in: UserCreate):
    hashed_pwd = hash_password(user_in.password)
    db_user = User(
        username=user_in.username,
        email=user_in.email,
        password=hashed_pwd,
        role=user_in.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
