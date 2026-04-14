from pydantic import BaseModel
from typing import Optional

class UserBase(BaseModel):
    name: str
    email: str
    role: str = "student"
    shop_id: Optional[int] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    user_id: int

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None
    shop_id: Optional[int] = None
