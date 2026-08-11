from sqlalchemy.orm import Session
from app.modules.profile.models import Profile
from app.modules.profile.schemas import ProfileCreate, ProfileUpdate

def get_profile_by_user_id(db: Session, user_id: int):
    return db.query(Profile).filter(Profile.user_id == user_id).first()

def create_profile(db: Session, user_id: int, profile_in: ProfileCreate):
    db_profile = Profile(
        user_id=user_id,
        full_name=profile_in.full_name,
        organization=profile_in.organization,
        research_domain=profile_in.research_domain,
        keywords=profile_in.keywords,
        research_interests=profile_in.research_interests
    )
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile

def update_profile(db: Session, user_id: int, profile_in: ProfileUpdate):
    db_profile = get_profile_by_user_id(db, user_id)
    if not db_profile:
        return None
    
    db_profile.full_name = profile_in.full_name
    db_profile.organization = profile_in.organization
    db_profile.research_domain = profile_in.research_domain
    db_profile.keywords = profile_in.keywords
    db_profile.research_interests = profile_in.research_interests
    
    db.commit()
    db.refresh(db_profile)
    return db_profile

def delete_profile(db: Session, user_id: int):
    db_profile = get_profile_by_user_id(db, user_id)
    if not db_profile:
        return False
    db.delete(db_profile)
    db.commit()
    return True
