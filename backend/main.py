import logging
import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.database.connection import engine, Base, SessionLocal
from app.routes import order, shop, auth, admin
from sqlalchemy.exc import OperationalError

# Explicitly import models so SQLAlchemy knows about them before create_all
from app.models.user import User
from app.models.shop import Shop
from app.models.order import Order

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

# Create database tables automatically on startup
try:
    logger.info(f"Connecting to database using engine: {engine.url}")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables verified/created successfully.")
except OperationalError as e:
    logger.error("Could not create database tables. Ensure PostgreSQL is running and the database exists.")
except Exception as e:
    logger.error(f"An error occurred while creating tables: {e}")

app = FastAPI(
    title="Queueless Backend",
    description="Smart queue management system for campus printing shops with automatic load-balanced shop allocation.",
    version="1.0.0"
)

# CORS configuration for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    logger.info(f"API Hit: {request.method} {request.url.path} - Status: {response.status_code} - Time: {process_time:.4f}s")
    return response

# Include routers
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(shop.router)
app.include_router(order.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Queueless API. Visit /docs for OpenAPI documentation."}

@app.get("/force-refresh-db")
def force_refresh_db():
    from sqlalchemy import text
    from app.services.auth_service import get_password_hash
    
    try:
        with engine.connect() as conn:
            conn.execute(text("DROP TABLE IF EXISTS orders CASCADE"))
            conn.execute(text("DROP TABLE IF EXISTS users CASCADE"))
            conn.execute(text("DROP TABLE IF EXISTS shops CASCADE"))
            conn.execute(text("DROP TABLE IF EXISTS alembic_version CASCADE"))
            conn.commit()
            
        Base.metadata.create_all(bind=engine)
        
        # Seed logic
        with SessionLocal() as db:
            # Add initial shops
            shop1 = Shop(name="shop1", location="North Campus", working_hours="8AM - 8PM", status="active", current_queue_length=0)
            shop2 = Shop(name="shop2", location="South Campus", working_hours="9AM - 5PM", status="active", current_queue_length=0)
            db.add(shop1)
            db.add(shop2)
            db.commit()
            
            # Add default admin
            admin_user = User(
                name="Admin User",
                email="admin@queueless.com",
                password_hash=get_password_hash("admin123"),
                role="admin"
            )
            
            # Add default shopkeeper for shop1
            shopkeeper_user = User(
                name="Shopkeeper One",
                email="shopkeeper@queueless.com",
                password_hash=get_password_hash("shop123"),
                role="shopkeeper",
                shop_id=shop1.shop_id
            )
            
            db.add(admin_user)
            db.add(shopkeeper_user)
            db.commit()

        return {"status": "success", "message": "Database refreshed and seeded."}
    except Exception as e:
        logger.error(f"Failed to refresh database: {e}")
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    # Ready to run using: uvicorn main:app --reload
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

