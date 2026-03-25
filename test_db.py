import sys
import os
sys.path.append(os.path.join(os.path.abspath('.'), 'backend'))

from app.database.connection import SessionLocal
from app.models.order import Order

db = SessionLocal()
try:
    orders = db.query(Order).all()
    print(f"Success! Found {len(orders)} orders.")
except Exception as e:
    print(f"DB Error: {e}")
finally:
    db.close()
