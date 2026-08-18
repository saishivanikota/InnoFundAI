from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, func
from app.database import Base

class AIHistory(Base):
    __tablename__ = "ai_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    idea = Column(String, nullable=False)
    result_json = Column(String, nullable=True)
    novelty_score = Column(Float, nullable=True, default=0.0)
    commercial_viability_score = Column(Float, nullable=True, default=0.0)
    feasibility_score = Column(Float, nullable=True, default=0.0)
    overall_score = Column(Float, nullable=True, default=0.0)
    summary = Column(String, nullable=True, default="")
    suggestions = Column(String, nullable=True, default="")
    created_at = Column(DateTime, server_default=func.now())
