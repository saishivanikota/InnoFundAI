import random
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.modules.ai.models import AIHistory
from app.modules.ai.schemas import AIAnalyzeRequest, AIAnalyzeResponse

router = APIRouter()

@router.post("/analyze", response_model=AIAnalyzeResponse)
def analyze_idea(payload: AIAnalyzeRequest, db: Session = Depends(get_db)):
    idea = payload.idea.strip()
    if not idea:
        raise HTTPException(status_code=400, detail="Idea description cannot be empty.")
    
    # Calculate mock scores based on idea heuristic or random for demonstration
    novelty = round(random.uniform(7.0, 9.8), 1)
    commercial = round(random.uniform(6.5, 9.5), 1)
    feasibility = round(random.uniform(7.2, 9.6), 1)
    overall = round((novelty + commercial + feasibility) / 3.0, 1)

    summary = f"The proposed innovation targeting '{idea[:60]}...' shows strong market potential and technical feasibility."
    suggestions = "1. Focus on patenting early core algorithms.\n2. Apply for relevant AI/technology grants.\n3. Conduct benchmark testing against current industry standards."

    history_item = AIHistory(
        idea=idea,
        novelty_score=novelty,
        commercial_viability_score=commercial,
        feasibility_score=feasibility,
        overall_score=overall,
        summary=summary,
        suggestions=suggestions
    )
    db.add(history_item)
    db.commit()
    db.refresh(history_item)

    return history_item

@router.get("/history", response_model=List[AIAnalyzeResponse])
def get_ai_history(db: Session = Depends(get_db)):
    return db.query(AIHistory).order_by(AIHistory.created_at.desc()).all()

@router.get("/scoring")
def get_ai_scoring():
    return {
        "metrics": ["Novelty", "Commercial Viability", "Technical Feasibility"],
        "scoring_range": "1.0 - 10.0"
    }
