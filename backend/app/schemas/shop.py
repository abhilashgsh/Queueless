from pydantic import BaseModel
from typing import Optional


class ShopBase(BaseModel):
    name: str
    location: Optional[str] = "Campus"
    working_hours: Optional[str] = "9AM - 6PM"
    status: Optional[str] = "active"
    approval_status: Optional[str] = "approved"
    rejection_reason: Optional[str] = None
    speed_factor: Optional[float] = 1.0
    owner_id: Optional[int] = None


class ShopCreate(ShopBase):
    pass


class ShopUpdateStatus(BaseModel):
    status: str


class ShopApproval(BaseModel):
    approval_status: str  # "approved" | "rejected"
    rejection_reason: Optional[str] = None


class ShopResponse(ShopBase):
    shop_id: int
    current_queue_length: int

    class Config:
        from_attributes = True
