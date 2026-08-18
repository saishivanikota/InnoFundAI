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
    
    # Resolve username
    uname = user_in.username
    if not uname:
        if user_in.full_name:
            uname = user_in.full_name.strip().replace(" ", "_").lower()
        else:
            uname = user_in.email.split("@")[0]
            
    # Ensure username is unique if collision
    existing = db.query(User).filter(User.username == uname).first()
    if existing:
        import random
        uname = f"{uname}_{random.randint(100, 999)}"
        
    user = User(
        username=uname,
        email=user_in.email,
        password=hashed_pwd,
        role=user_in.role or "researcher"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Create initial baseline profile if full_name is provided or defaults
    try:
        from app.modules.profile.models import Profile
        full_name = user_in.full_name or uname.replace("_", " ").title()
        profile = Profile(
            user_id=user.id,
            full_name=full_name,
            organization="Independent Researcher",
            research_domain="General Research",
            keywords="Research, Innovation",
            research_interests="Exploring funding opportunities and innovation intelligence."
        )
        db.add(profile)
        db.commit()
    except Exception:
        db.rollback()

    return user
