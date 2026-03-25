from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database.connection import get_db
from app.models.order import Order
from app.schemas.order import OrderCreate, OrderResponse, OrderUpdateStatus
from app.services.allocation import get_least_loaded_shop
from app.services.queue import generate_queue_number, update_shop_queue_length
import random
import string

def generate_order_code() -> str:
    return "ORD-" + ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

ADDON_PRICING = {
    "Pen": 0.50, "Pencil": 0.20, "Eraser": 0.30, "Sharpener": 0.40,
    "Highlighter": 1.00, "Marker": 1.20, "Sticky notes": 1.50,
    "Notebook": 3.00, "Exam pad": 2.50, "Spiral binding": 2.00,
    "Comb binding": 1.50, "File cover": 0.80, "Transparent sheets": 0.50,
    "Report file": 1.00, "Paper clips": 0.50, "Binder clips": 0.80,
    "Stapler / staples": 2.00, "A4 sheets": 0.05, "Colored paper": 0.10,
    "Photo paper": 0.50, "Envelopes": 0.20, "Glue stick": 0.80,
    "Tape": 1.00, "Correction fluid": 1.50, "Scissors": 2.50,
    "Printed report + binding": 5.00, "File cover + transparent sheets": 1.50,
    "Complete project kit": 10.00
}

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("/", response_model=OrderResponse)
def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    """Create an order and automatically assign it to the least loaded shop."""
    # 1. Smart Allocation Engine: Find least loaded active shop
    assigned_shop = get_least_loaded_shop(db)
    
    # 2. Queue Management: Generate sequence number
    queue_number = generate_queue_number(db, assigned_shop.shop_id)
    
    # 3. Calculate Pricing
    base_cost = order.copies * (0.10 if order.print_type == "bw" else 0.50)
    addons_cost = sum(ADDON_PRICING.get(addon, 0) for addon in order.addons)
    total_cost = base_cost + addons_cost
    
    # 4. Create the order storing a mock file_path reference
    new_order = Order(
        order_id=generate_order_code(),
        user_id=order.user_id,
        shop_id=assigned_shop.shop_id,
        file_path=order.file_path,
        copies=order.copies,
        print_type=order.print_type,
        queue_number=queue_number,
        status="queued",
        addons=order.addons,
        total_cost=total_cost
    )
    
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    
    # 4. Update the assigned shop's current queue length
    update_shop_queue_length(db, assigned_shop.shop_id)
    
    return new_order

@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: str, db: Session = Depends(get_db)):
    """Get the status of a specific order."""
    order = db.query(Order).filter(Order.order_id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.get("/user/{user_id}", response_model=List[OrderResponse])
def get_user_orders(user_id: str, db: Session = Depends(get_db)):
    """List all orders for a specific user."""
    orders = db.query(Order).filter(Order.user_id == user_id).order_by(Order.created_at.desc()).all()
    return orders

@router.put("/{order_id}/status", response_model=OrderResponse)
def update_order_status(order_id: str, status_update: OrderUpdateStatus, db: Session = Depends(get_db)):
    """Update order status (queued -> printing -> ready)."""
    order = db.query(Order).filter(Order.order_id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    valid_statuses = ["queued", "printing", "ready", "completed", "cancelled"]
    if status_update.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")
        
    order.status = status_update.status
    db.commit()
    db.refresh(order)
    
    # Update shop queue length if status changes bounds
    update_shop_queue_length(db, order.shop_id)
    
    return order
