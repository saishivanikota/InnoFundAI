from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, default="researcher", nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    saved_fundings = relationship("SavedFunding", back_populates="user", cascade="all, delete-orphan")
    ai_histories = relationship("AIHistory", back_populates="user", cascade="all, delete-orphan")
