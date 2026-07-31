from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.modules.auth.router import get_current_user
from app.modules.profile.crud import (
    create_profile,
    get_profile_by_user_id,
    update_profile,
    delete_profile
)
from app.modules.profile.schemas import ProfileCreate, ProfileUpdate, ProfileResponse

router = APIRouter()

@router.get("", response_model=ProfileResponse)
def read_profile(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = get_profile_by_user_id(db, current_user.id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found. Please create a profile."
        )
    return profile


@router.post("", status_code=status.HTTP_201_CREATED)
def create_user_profile(
    profile_in: ProfileCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = get_profile_by_user_id(db, current_user.id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profile already exists. Use PUT to update it."
        )
    
    profile = create_profile(db, current_user.id, profile_in)
    return {
        "message": "Profile created successfully",
        "profile": ProfileResponse.model_validate(profile)
    }


@router.put("")
def update_user_profile(
    profile_in: ProfileUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    existing = get_profile_by_user_id(db, current_user.id)
    if not existing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile does not exist. Use POST to create one."
        )
    
    profile = update_profile(db, current_user.id, profile_in)
    return {
        "message": "Profile updated successfully",
        "profile": ProfileResponse.model_validate(profile)
    }


@router.delete("")
def delete_user_profile(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    deleted = delete_profile(db, current_user.id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found."
        )
    return {"message": "Profile deleted successfully."}
