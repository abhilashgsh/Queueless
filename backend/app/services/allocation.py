from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.shop import Shop

def get_least_loaded_shop(db: Session) -> Shop:
    """Finds the active shop with the least load (minimum current_queue_length)."""
    # Query only active shops, order by queue length ascending
    shop = db.query(Shop).filter(Shop.status == "active").order_by(Shop.current_queue_length.asc()).first()
    
    if not shop:
        raise HTTPException(status_code=503, detail="No active print shops available currently.")
        
    return shop
