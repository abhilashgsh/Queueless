from app.database.connection import SessionLocal
from app.models.shop import Shop
from app.models.user import User
from app.services.auth_service import get_password_hash


def run_seed():
    db = SessionLocal()
    try:
        # Only seed if no shops exist
        if db.query(Shop).count() == 0:
            shops = [
                Shop(name="shop1", location="North Campus", working_hours="8AM - 8PM", status="active", current_queue_length=3),
                Shop(name="shop2", location="South Campus", working_hours="9AM - 5PM", status="active", current_queue_length=1),
                Shop(name="Campus Print Hub", location="Library, 1st Floor", working_hours="24/7", status="active", current_queue_length=5),
                Shop(name="QuickCopy Station", location="Student Union", working_hours="10AM - 4PM", status="inactive", current_queue_length=0)
            ]
            db.add_all(shops)
            db.commit()
            
            # Add default users if missing
            if db.query(User).filter(User.email == "admin@queueless.com").count() == 0:
                admin_user = User(
                    name="Admin User",
                    email="admin@queueless.com",
                    password_hash=get_password_hash("admin123"),
                    role="admin"
                )
                db.add(admin_user)
                
            shop1_instance = db.query(Shop).filter(Shop.name == "shop1").first()
            if shop1_instance and db.query(User).filter(User.email == "shopkeeper@queueless.com").count() == 0:
                shopkeeper_user = User(
                    name="Shopkeeper One",
                    email="shopkeeper@queueless.com",
                    password_hash=get_password_hash("shop123"),
                    role="shopkeeper",
                    shop_id=shop1_instance.shop_id
                )
                db.add(shopkeeper_user)
                
            db.commit()
            print("Database seeded with default shops and users!")
        else:
            print("Shops already exist in the database. Seed skipped.")
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
