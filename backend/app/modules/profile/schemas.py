from pydantic import BaseModel, ConfigDict
from datetime import datetime

class ProfileBase(BaseModel):
    full_name: str
    organization: str
    research_domain: str
    keywords: str
    research_interests: str

class ProfileCreate(ProfileBase):
    pass

class ProfileUpdate(ProfileBase):
    pass

class ProfileResponse(ProfileBase):
    id: int
    user_id: int
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
