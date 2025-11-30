

from pydantic import BaseModel, EmailStr
from typing import Optional
import datetime

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    is_medic: Optional[bool] = False

class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    is_medic: bool
    created_at: Optional[datetime.datetime]
    model_config = {"from_attributes": True}

class LoginForm(BaseModel):
    email: EmailStr
    password: str

class EvalIn(BaseModel):
    age: int
    gender: int
    weight: float
    cholesterol: int
    ap_hi: int
    ap_lo: int
    smoke: bool
    active: bool

class EvalOut(BaseModel):
    id: int
    user_id: int
    age: int
    gender: int
    weight: float
    cholesterol: int
    ap_hi: int
    ap_lo: int
    smoke: bool
    active: bool
    risk: float
    created_at: datetime.datetime
    model_config = {"from_attributes": True}

class Token(BaseModel):
    access_token: str
    token_type: str
    is_medic: bool
    user_id: int
    name: str
