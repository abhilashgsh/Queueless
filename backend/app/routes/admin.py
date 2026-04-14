from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import func
from typing import List
import logging

from app.database.connection import get_db
from app.models.user import User
from app.models.shop import Shop
from app.models.order import Order
from app.schemas.shop import ShopCreate, ShopResponse, ShopApproval
from app.dependencies import require_role

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin", tags=["Admin Dashboard"])

# All routes require 'admin' role
admin_deps = [Depends(require_role(["admin"]))]


@router.get("/analytics", dependencies=admin_deps)
def get_admin_analytics(db: Session = Depends(get_db)):
    try:
        total_orders = db.query(Order).count()
        total_shops = db.query(Shop).count()
        active_shops = db.query(Shop).filter(Shop.status == "active").count()
        print_ready = db.query(Order).filter(Order.status == "ready").count()

        return {
            "total_orders": total_orders,
            "total_shops": total_shops,
            "active_shops": active_shops,
            "orders_ready": print_ready
        }
    except SQLAlchemyError as e:
        logger.error(f"DB error fetching analytics: {e}")
        raise HTTPException(status_code=500, detail="Database error while fetching analytics.")


@router.get("/shops", response_model=List[ShopResponse], dependencies=admin_deps)
def get_all_shops(db: Session = Depends(get_db)):
    try:
        return db.query(Shop).all()
    except SQLAlchemyError as e:
        logger.error(f"DB error fetching shops (admin): {e}")
        raise HTTPException(status_code=500, detail="Database error while fetching shops.")


@router.post("/shops", response_model=ShopResponse, dependencies=admin_deps)
def create_shop(shop: ShopCreate, db: Session = Depends(get_db)):
    try:
        db_shop = Shop(**shop.model_dump())
        db.add(db_shop)
        db.commit()
        db.refresh(db_shop)
        return db_shop
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"DB error creating shop: {e}")
        raise HTTPException(status_code=500, detail="Database error while creating shop.")


@router.put("/shops/{shop_id}/status", response_model=ShopResponse, dependencies=admin_deps)
def toggle_shop_status(shop_id: int, status: str, db: Session = Depends(get_db)):
    try:
        shop = db.query(Shop).filter(Shop.shop_id == shop_id).first()
        if not shop:
            raise HTTPException(status_code=404, detail="Shop not found")
        shop.status = status
        db.commit()
        db.refresh(shop)
        return shop
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"DB error toggling shop status: {e}")
        raise HTTPException(status_code=500, detail="Database error while updating shop status.")


@router.put("/shops/{shop_id}/approval", response_model=ShopResponse, dependencies=admin_deps)
def update_shop_approval(shop_id: int, approval: ShopApproval, db: Session = Depends(get_db)):
    """Approve or reject a pending shop registration."""
    try:
        shop = db.query(Shop).filter(Shop.shop_id == shop_id).first()
        if not shop:
            raise HTTPException(status_code=404, detail="Shop not found")
        if approval.approval_status not in ["approved", "rejected"]:
            raise HTTPException(status_code=400, detail="approval_status must be 'approved' or 'rejected'")

        shop.approval_status = approval.approval_status
        shop.rejection_reason = approval.rejection_reason
        
        # Connect the loop: if approved, set status active and elevate owner
        if approval.approval_status == "approved":
            shop.status = "active"
            if shop.owner_id:
                owner = db.query(User).filter(User.user_id == shop.owner_id).first()
                if owner:
                    owner.role = "shopkeeper"
                    owner.shop_id = shop.shop_id

        db.commit()
        db.refresh(shop)
        return shop
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"DB error updating shop approval: {e}")
        raise HTTPException(status_code=500, detail="Database error while updating shop approval.")


@router.get("/orders", dependencies=admin_deps)
def get_all_orders_admin(db: Session = Depends(get_db)):
    try:
        orders = db.query(Order).order_by(Order.created_at.desc()).all()
        return orders
    except SQLAlchemyError as e:
        logger.error(f"DB error fetching all orders (admin): {e}")
        raise HTTPException(status_code=500, detail="Database error while fetching orders.")
