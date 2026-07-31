from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base

class AIHistory(Base):
    __tablename__ = "ai_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    prompt = Column(String, nullable=False)
    response = Column(String, nullable=False)  # JSON-encoded string
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="ai_histories")
