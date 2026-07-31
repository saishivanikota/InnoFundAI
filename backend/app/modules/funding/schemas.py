from pydantic import BaseModel, ConfigDict
from datetime import date, datetime

class FundingOpportunityBase(BaseModel):
    title: str
    organization: str
    research_domain: str
    funding_amount: float
    deadline: date
    country: str
    description: str
    funding_type: str = "Grant"
    eligibility: str = "Academic Researchers"
    status: str = "Open"

class FundingOpportunityCreate(FundingOpportunityBase):
    pass

class FundingOpportunityResponse(FundingOpportunityBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class SavedFundingResponse(BaseModel):
    id: int
    user_id: int
    funding_opportunity_id: int
    saved_at: datetime
    opportunity: FundingOpportunityResponse | None = None

    model_config = ConfigDict(from_attributes=True)
