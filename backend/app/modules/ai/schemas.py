from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AIAnalyzeRequest(BaseModel):
    idea: str

class AIAnalyzeResponse(BaseModel):
    id: Optional[int] = None
    idea: str
    novelty_score: float
    commercial_viability_score: float
    feasibility_score: float
    overall_score: float
    summary: str
    suggestions: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
