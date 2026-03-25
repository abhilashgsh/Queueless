from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database.connection import Base

class Order(Base):
    __tablename__ = "orders"

    order_id = Column(String, primary_key=True, index=True)
    user_id = Column(String, index=True, nullable=False)
    shop_id = Column(Integer, ForeignKey("shops.shop_id"), nullable=False)
    file_path = Column(String, nullable=False)
    copies = Column(Integer, default=1, nullable=False)
    print_type = Column(String, default="bw", nullable=False) # "color", "bw"
    status = Column(String, default="queued", nullable=False) # "queued", "printing", "ready"
    queue_number = Column(Integer, nullable=False)
    addons = Column(JSON, default=list, nullable=False)
    total_cost = Column(Float, default=0.0, nullable=False)
    
    # Automatically tracks creation time
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship to the shop
    shop = relationship("Shop", back_populates="orders")
