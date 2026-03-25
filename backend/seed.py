from app.database.connection import SessionLocal
from app.models.shop import Shop
from app.models.order import Order

db = SessionLocal()
if db.query(Shop).count() == 0:
    shops = [
        Shop(name="Campus Print Hub", status="active", current_queue_length=3),
        Shop(name="TechDocs Express", status="active", current_queue_length=12),
        Shop(name="Design Studio Hub", status="active", current_queue_length=1),
        Shop(name="QuickCopy Station", status="inactive", current_queue_length=0)
    ]
    db.add_all(shops)
    db.commit()
    print("Database seeded with default shops!")
else:
    print("Shops already exist in the database.")
db.close()
