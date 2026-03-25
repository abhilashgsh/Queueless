import logging
import sys
import os

# Setup path and logging
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
logging.basicConfig(level=logging.INFO)

from app.database.connection import SessionLocal
from app.models.shop import Shop
from app.models.order import Order
from app.services.queue import generate_queue_number

db = SessionLocal()
try:
    # Ensure Shop 1 exists
    shop = db.query(Shop).first()
    if not shop:
        shop = Shop(name="Test Shop", status="active", current_queue_length=0)
        db.add(shop)
        db.commit()

    shop_id = shop.shop_id
    
    # Place 3 orders
    for _ in range(3):
        qn = generate_queue_number(db, shop_id)
        order = Order(user_id="user", shop_id=shop_id, file_path="test.pdf", queue_number=qn)
        db.add(order)
        db.commit()
        db.refresh(order)
        print(f"Placed order in Shop {shop_id}: queue_number = {order.queue_number}")
        
finally:
    db.close()
