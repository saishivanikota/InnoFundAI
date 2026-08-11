from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PatentResponse(BaseModel):
    id: int
    patent_id: str
    title: str
    organization: str
    technology_domain: str
    inventor: str
    country: str
    year: int
    url: Optional[str] = None
    status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
