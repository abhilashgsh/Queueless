import sys
import os
sys.path.append(os.path.join(os.path.abspath('.'), 'backend'))
from app.database.connection import engine
from sqlalchemy import text

try:
    with engine.connect() as conn:
        conn.execute(text("DROP TABLE IF EXISTS orders CASCADE"))
        conn.commit()
        print("Table 'orders' dropped successfully via SQLAlchemy.")
except Exception as e:
    print(f"Error dropping table: {e}")
