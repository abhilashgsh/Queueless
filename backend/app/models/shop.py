from sqlalchemy import Column, Integer, String, Boolean, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.database.connection import Base

class Shop(Base):
    __tablename__ = "shops"

    shop_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    location = Column(String, default="Campus", nullable=False)
    working_hours = Column(String, default="9AM - 6PM", nullable=False)
    status = Column(String, default="active", nullable=False)      # active | inactive
    approval_status = Column(String, default="approved", nullable=False)  # pending | approved | rejected
    rejection_reason = Column(String, nullable=True)
    current_queue_length = Column(Integer, default=0, nullable=False)
    speed_factor = Column(Float, default=1.0, nullable=False)       # higher = faster shop

    # Owner link
    owner_id = Column(Integer, ForeignKey("users.user_id"), nullable=True)
    owner = relationship("User", back_populates="owned_shops", foreign_keys=[owner_id])

    # Shopkeepers assigned to this shop
    shopkeepers = relationship("User", back_populates="shop", foreign_keys="User.shop_id")

    # Orders
    orders = relationship("Order", back_populates="shop")
