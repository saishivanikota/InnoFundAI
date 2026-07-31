from sqlalchemy import Column, Integer, String, UniqueConstraint
from app.database import Base

class ResearchTrend(Base):
    __tablename__ = "research_trends"

    id = Column(Integer, primary_key=True, index=True)
    year = Column(Integer, nullable=False)
    research_domain = Column(String, nullable=False)
    publication_count = Column(Integer, nullable=False)

    __table_args__ = (
        UniqueConstraint("year", "research_domain", name="uix_year_domain"),
    )
