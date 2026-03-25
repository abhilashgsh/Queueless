from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class OrderCreate(BaseModel):
    user_id: str
    file_path: str
    copies: Optional[int] = 1
    print_type: Optional[str] = "bw"
    addons: Optional[List[str]] = []

class OrderUpdateStatus(BaseModel):
    status: str

class OrderResponse(BaseModel):
    order_id: str
    user_id: str
    shop_id: int
    file_path: str
    copies: int
    print_type: str
    status: str
    queue_number: int
    addons: List[str]
    total_cost: float
    created_at: datetime

    class Config:
        from_attributes = True
