from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import List, Dict, Any

class AIHistoryResponse(BaseModel):
    id: int
    user_id: int
    prompt: str
    response: str  # Original JSON string
    created_at: datetime
    result: Dict[str, Any] | None = None  # Parsed JSON result

    model_config = ConfigDict(from_attributes=True)

class AIAnalyzeRequest(BaseModel):
    idea: str = Field(..., min_length=10)

class AIAnalyzeResult(BaseModel):
    commercialization: List[str]
    industries: List[str]
    funding: List[str]
    improvements: List[str]
    impact: str
    collaborators: List[str]
    trl: str

class AIAnalyzeResponse(BaseModel):
    idea: str
    result: AIAnalyzeResult
