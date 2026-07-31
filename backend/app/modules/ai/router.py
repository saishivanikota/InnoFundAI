from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import json

from app.database import get_db
from app.modules.auth.router import get_current_user
from app.modules.ai.models import AIHistory
from app.modules.ai.schemas import AIAnalyzeRequest, AIHistoryResponse
from app.modules.ai.services import AIService

router = APIRouter()
ai_service = AIService()

@router.post("/analyze")
async def analyze_idea(
    req_body: AIAnalyzeRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        idea = req_body.idea.strip()
        analysis_result = await ai_service.analyze_idea(idea)
        
        # Save to database
        db_history = AIHistory(
            user_id=current_user.id,
            prompt=idea,
            response=json.dumps(analysis_result)
        )
        db.add(db_history)
        db.commit()
        db.refresh(db_history)

        return {
            "idea": idea,
            "result": analysis_result
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate AI analysis: {str(e)}"
        )


@router.get("/history")
def get_ai_history(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    history_records = db.query(AIHistory).filter(
        AIHistory.user_id == current_user.id
    ).order_by(AIHistory.created_at.desc()).limit(20).all()

    response_data = []
    for h in history_records:
        try:
            parsed_res = json.loads(h.response)
        except Exception:
            parsed_res = {}
            
        response_data.append({
            "id": h.id,
            "user_id": h.user_id,
            "prompt": h.prompt,
            "response": h.response,
            "created_at": h.created_at,
            "result": parsed_res
        })
        
    return response_data


@router.get("/scoring")
def get_user_scoring(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = current_user.profile
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Research profile not found. Please set up a profile first."
        )

    score_data = ai_service.calculate_innovation_score(profile, db)
    return score_data
