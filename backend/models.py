
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_medic = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    evaluations = relationship("Evaluation", back_populates="user", cascade="all, delete-orphan")

class Evaluation(Base):
    __tablename__ = "evaluations"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    age = Column(Integer, nullable=False)
    gender = Column(Integer, nullable=False)
    weight = Column(Float, nullable=False)
    cholesterol = Column(Integer, nullable=False)
    ap_hi = Column(Integer, nullable=False)
    ap_lo = Column(Integer, nullable=False)
    smoke = Column(Boolean, default=False)
    active = Column(Boolean, default=True)
    risk = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    user = relationship("User", back_populates="evaluations")
