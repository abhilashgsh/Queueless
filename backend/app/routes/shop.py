from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import List
import logging

from app.database.connection import get_db
from app.models.shop import Shop
from app.models.order import Order
from app.schemas.shop import ShopResponse, ShopUpdateStatus
from app.schemas.order import OrderResponse
from app.dependencies import require_role
from app.models.user import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/shops", tags=["Shops"])


@router.get("/", response_model=List[ShopResponse])
def get_all_shops(db: Session = Depends(get_db)):
    """List all approved and active shops."""
    try:
        return db.query(Shop).filter(
            Shop.approval_status == "approved",
            Shop.status == "active"
        ).all()
    except SQLAlchemyError as e:
        logger.error(f"DB error fetching shops: {e}")
        raise HTTPException(status_code=500, detail="Database error while fetching shops.")


from app.schemas.shop import ShopCreate
from app.dependencies import get_current_user

@router.post("/register", response_model=ShopResponse)
def register_shop(shop: ShopCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Allow any authenticated user to register a shop."""
    try:
        db_shop = Shop(
            name=shop.name,
            location=shop.location,
            working_hours=shop.working_hours,
            status="inactive",
            approval_status="pending",
            owner_id=current_user.user_id
        )
        db.add(db_shop)
        db.commit()
        db.refresh(db_shop)
        return db_shop
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"DB error registering shop: {e}")
        raise HTTPException(status_code=500, detail="Database error while registering shop.")


@router.get("/{shop_id}/queue", response_model=List[OrderResponse])
def get_shop_queue(shop_id: int, db: Session = Depends(get_db)):
    """Get active queue of a specific shop."""
    try:
        shop = db.query(Shop).filter(Shop.shop_id == shop_id).first()
        if not shop:
            raise HTTPException(status_code=404, detail="Shop not found")

        orders = db.query(Order).filter(
            Order.shop_id == shop_id,
            Order.status.in_(["queued", "printing"])
        ).order_by(Order.queue_number.asc()).all()

        return orders
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"DB error fetching shop queue: {e}")
        raise HTTPException(status_code=500, detail="Database error while fetching queue.")


@router.put("/{shop_id}/status", response_model=ShopResponse)
def update_shop_status(shop_id: int, status_update: ShopUpdateStatus, db: Session = Depends(get_db)):
    """Activate or deactivate a shop."""
    try:
        shop = db.query(Shop).filter(Shop.shop_id == shop_id).first()
        if not shop:
            raise HTTPException(status_code=404, detail="Shop not found")

        if status_update.status not in ["active", "inactive"]:
            raise HTTPException(status_code=400, detail="Invalid status. Must be 'active' or 'inactive'")

        shop.status = status_update.status
        db.commit()
        db.refresh(shop)
        return shop
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"DB error updating shop status: {e}")
        raise HTTPException(status_code=500, detail="Database error while updating shop status.")


@router.get("/dashboard/queue", response_model=List[OrderResponse])
def get_my_queue(current_user: User = Depends(require_role(["shopkeeper"])), db: Session = Depends(get_db)):
    """Shopkeeper views their own shop's active queue."""
    if not current_user.shop_id:
        raise HTTPException(status_code=400, detail="User is not assigned to a shop")

    try:
        orders = db.query(Order).filter(
            Order.shop_id == current_user.shop_id,
            Order.status.in_(["queued", "printing"])
        ).order_by(Order.queue_number.asc()).all()

        return orders
    except SQLAlchemyError as e:
        logger.error(f"DB error fetching shopkeeper queue: {e}")
        raise HTTPException(status_code=500, detail="Database error while fetching your queue.")


@router.put("/dashboard/orders/{order_id}/status", response_model=OrderResponse)
def update_my_order_status(
    order_id: str,
    status: str,
    current_user: User = Depends(require_role(["shopkeeper"])),
    db: Session = Depends(get_db)
):
    """Shopkeeper updates order status."""
    try:
        order = db.query(Order).filter(Order.order_id == order_id).first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        if order.shop_id != current_user.shop_id:
            raise HTTPException(status_code=403, detail="Not authorized to update this shop's orders")

        order.status = status
        db.commit()
        db.refresh(order)
        return order
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"DB error updating order status: {e}")
        raise HTTPException(status_code=500, detail="Database error while updating order status.")


@router.get("/dashboard/stats")
def get_my_stats(current_user: User = Depends(require_role(["shopkeeper"])), db: Session = Depends(get_db)):
    """Shopkeeper views their stats."""
    if not current_user.shop_id:
        raise HTTPException(status_code=400, detail="No shop assigned")

    try:
        total_orders = db.query(Order).filter(Order.shop_id == current_user.shop_id).count()
        completed_orders = db.query(Order).filter(
            Order.shop_id == current_user.shop_id,
            Order.status == "ready"
        ).count()

        return {
            "total_orders": total_orders,
            "completed_orders": completed_orders
        }
    except SQLAlchemyError as e:
        logger.error(f"DB error fetching shopkeeper stats: {e}")
        raise HTTPException(status_code=500, detail="Database error while fetching stats.")
