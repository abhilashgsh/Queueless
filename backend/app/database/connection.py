import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Provided PostgreSQL connection string
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://postgres:2005@localhost:5432/queueless_db"
)

# Create SQLAlchemy engine
engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True)

try:
    # Test connection on startup
    with engine.connect() as connection:
        logger.info("Successfully connected to the PostgreSQL database.")
except OperationalError as e:
    logger.error(f"Failed to connect to the database. Ensure postgres is running. Error: {e}")
except Exception as e:
    logger.error(f"An unexpected error occurred during database connection: {e}")

# Create a scoped session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all models
Base = declarative_base()

def get_db():
    """Dependency to inject DB session into routes"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
