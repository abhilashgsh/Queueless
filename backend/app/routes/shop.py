from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.connection import get_db
from app.models.shop import Shop
from app.models.order import Order
from app.schemas.shop import ShopResponse, ShopUpdateStatus
from app.schemas.order import OrderResponse

router = APIRouter(prefix="/shops", tags=["Shops"])

@router.get("/", response_model=List[ShopResponse])
def get_all_shops(db: Session = Depends(get_db)):
    """List all shops with current queue lengths."""
    return db.query(Shop).all()

@router.get("/{shop_id}/queue", response_model=List[OrderResponse])
def get_shop_queue(shop_id: int, db: Session = Depends(get_db)):
    """Get active queue of a specific shop."""
    shop = db.query(Shop).filter(Shop.shop_id == shop_id).first()
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")
        
    orders = db.query(Order).filter(
        Order.shop_id == shop_id,
        Order.status.in_(["queued", "printing"])
    ).order_by(Order.queue_number.asc()).all()
    
    return orders

@router.put("/{shop_id}/status", response_model=ShopResponse)
def update_shop_status(shop_id: int, status_update: ShopUpdateStatus, db: Session = Depends(get_db)):
    """Activate or deactivate a shop."""
    shop = db.query(Shop).filter(Shop.shop_id == shop_id).first()
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")
        
    if status_update.status not in ["active", "inactive"]:
        raise HTTPException(status_code=400, detail="Invalid status. Must be 'active' or 'inactive'")
        
    shop.status = status_update.status
    db.commit()
    db.refresh(shop)
    return shop
