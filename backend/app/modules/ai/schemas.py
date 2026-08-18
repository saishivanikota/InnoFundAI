from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class AIAnalyzeRequest(BaseModel):
    idea: str

class AIAnalyzeResult(BaseModel):
    impact: str
    commercialization: List[str]
    industries: List[str]
    funding: List[str]
    improvements: List[str]
    collaborators: List[str]
    trl: str

class AIAnalyzeResponse(BaseModel):
    id: Optional[int] = None
    prompt: str
    result: AIAnalyzeResult
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
