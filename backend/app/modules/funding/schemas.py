from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class FundingResponse(BaseModel):
    id: int
    title: str
    organization: str
    research_domain: str
    funding_amount: float
    deadline: date
    country: str
    description: str
    funding_type: str
    eligibility: str
    status: str
    url: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
