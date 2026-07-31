from sqlalchemy import Column, Integer, String
from app.database import Base

class Patent(Base):
    __tablename__ = "patents"

    id = Column(Integer, primary_key=True, index=True)
    patent_id = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, nullable=False)
    organization = Column(String, nullable=False)
    technology_domain = Column(String, nullable=False)
    inventor = Column(String, nullable=False)
    country = Column(String, nullable=False)
    year = Column(Integer, nullable=False)
    status = Column(String, default="Granted", nullable=False)
