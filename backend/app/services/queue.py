from sqlalchemy.orm import Session
from app.models.shop import Shop
from app.models.order import Order

def generate_queue_number(db: Session, shop_id: int) -> int:
    """Gets the next queue number for a shop based on current maximum."""
    from sqlalchemy import func
    max_queue = db.query(func.max(Order.queue_number)).filter(Order.shop_id == shop_id).scalar()
    return (max_queue or 0) + 1

def update_shop_queue_length(db: Session, shop_id: int):
    """Updates the shop's active queue length."""
    shop = db.query(Shop).filter(Shop.shop_id == shop_id).first()
    if not shop:
        return
    
    # Count orders that are queued or printing
    active_orders_count = db.query(Order).filter(
        Order.shop_id == shop_id,
        Order.status.in_(["queued", "printing"])
    ).count()
    
    shop.current_queue_length = active_orders_count
    db.commit()
