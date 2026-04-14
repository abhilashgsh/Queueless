from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database.connection import Base

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=True)  # Nullable for future OAuth users
    google_id = Column(String, unique=True, nullable=True, index=True)
    role = Column(String, default="student", nullable=False)  # admin | shopkeeper | student
    shop_id = Column(Integer, ForeignKey("shops.shop_id"), nullable=True)

    # Relationships
    shop = relationship("Shop", back_populates="shopkeepers", foreign_keys=[shop_id])
    owned_shops = relationship("Shop", back_populates="owner", foreign_keys="Shop.owner_id")
