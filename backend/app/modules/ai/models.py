from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, func
from app.database import Base

class AIHistory(Base):
    __tablename__ = "ai_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    idea = Column(String, nullable=False)
    novelty_score = Column(Float, nullable=False)
    commercial_viability_score = Column(Float, nullable=False)
    feasibility_score = Column(Float, nullable=False)
    overall_score = Column(Float, nullable=False)
    summary = Column(String, nullable=False)
    suggestions = Column(String, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
