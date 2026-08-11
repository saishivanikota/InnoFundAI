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
    funding_type = Column(String, nullable=False)
    eligibility = Column(String, nullable=False)
    status = Column(String, default="Open")
    url = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

class SavedFunding(Base):
    __tablename__ = "saved_funding"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    funding_id = Column(Integer, ForeignKey("funding_opportunities.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
