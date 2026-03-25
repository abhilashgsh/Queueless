import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.connection import SessionLocal
from app.models.shop import Shop
from app.models.order import Order
from sqlalchemy import func
from app.services.queue import generate_queue_number
import random

def test_queue():
    db = SessionLocal()
    try:
        shop = db.query(Shop).first()
        if not shop:
            print("No shops found.")
            return

        qn1 = generate_queue_number(db, shop.shop_id)
        order1 = Order(user_id="test_user", shop_id=shop.shop_id, file_path="test_path", queue_number=qn1, copies=1, print_type="bw", status="queued")
        db.add(order1)
        db.commit()
        
        qn2 = generate_queue_number(db, shop.shop_id)
        print(f"Shop: {shop.name}, qn1: {qn1}, qn2: {qn2}")
        
    finally:
        db.close()

if __name__ == "__main__":
    test_queue()
