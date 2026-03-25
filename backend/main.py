import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.connection import engine, Base
from app.routes import order, shop
from sqlalchemy.exc import OperationalError

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

# Create database tables automatically on startup
try:
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

# Include routers
app.include_router(shop.router)
app.include_router(order.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Queueless API. Visit /docs for OpenAPI documentation."}

@app.get("/force-refresh-db")
def force_refresh_db():
    from sqlalchemy import text
    try:
        with engine.connect() as conn:
            conn.execute(text("DROP TABLE IF EXISTS orders CASCADE"))
            conn.commit()
        Base.metadata.create_all(bind=engine)
        return {"status": "success", "message": "Database refreshed."}
    except Exception as e:
        logger.error(f"Failed to refresh database: {e}")
        return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    # Ready to run using: uvicorn main:app --reload
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

