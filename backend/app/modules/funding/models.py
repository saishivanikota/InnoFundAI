from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base

class FundingOpportunity(Base):
    __tablename__ = "funding_opportunities"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    organization = Column(String, nullable=False)
    research_domain = Column(String, nullable=False)
    funding_amount = Column(Float, nullable=False)
    deadline = Column(Date, nullable=False)
    country = Column(String, nullable=False)
    description = Column(String, nullable=False)
    funding_type = Column(String, default="Grant", nullable=False)
    eligibility = Column(String, default="Academic Researchers", nullable=False)
    status = Column(String, default="Open", nullable=False)
    url = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    saved_by_users = relationship("SavedFunding", back_populates="opportunity", cascade="all, delete-orphan")


class SavedFunding(Base):
    __tablename__ = "saved_funding"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    funding_opportunity_id = Column(Integer, ForeignKey("funding_opportunities.id", ondelete="CASCADE"), nullable=False)
    saved_at = Column(DateTime, server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="saved_fundings")
    opportunity = relationship("FundingOpportunity", back_populates="saved_by_users")
