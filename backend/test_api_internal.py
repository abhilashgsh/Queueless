import sys
import os
import traceback
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.connection import SessionLocal
from app.models.order import Order
from app.schemas.order import OrderCreate
from app.routes.order import create_order
from app.routes.order import get_user_orders

db = SessionLocal()
try:
    print("Testing GET")
    orders = get_user_orders("user123", db)
    print(orders)
except Exception as e:
    print("GET Error:")
    traceback.print_exc()

try:
    print("Testing POST")
    order_in = OrderCreate(user_id="user123", file_path="test", copies=1, print_type="bw")
    res = create_order(order_in, db)
    print("Order created:", res.order_id)
except Exception as e:
    print("POST Error:")
    traceback.print_exc()
finally:
    db.close()
