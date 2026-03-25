from pydantic import BaseModel
from typing import Optional

class ShopBase(BaseModel):
    name: str
    status: Optional[str] = "active"

class ShopCreate(ShopBase):
    pass

class ShopUpdateStatus(BaseModel):
    status: str

class ShopResponse(ShopBase):
    shop_id: int
    current_queue_length: int

    class Config:
        from_attributes = True
