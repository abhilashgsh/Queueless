from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.orm import relationship
from app.database.connection import Base

class Shop(Base):
    __tablename__ = "shops"

    shop_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    status = Column(String, default="active", nullable=False) # "active", "inactive"
    current_queue_length = Column(Integer, default=0, nullable=False)

    # Relationship to orders
    orders = relationship("Order", back_populates="shop")
