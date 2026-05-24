from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Item(Base):
    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    category = Column(String, nullable=False)          # user-chosen category
    detected_category = Column(String, nullable=True)  # YOLO detected
    condition = Column(String, nullable=False)
    location = Column(String, nullable=False)
    image_url = Column(String, nullable=True)
    donor_id = Column(Integer, nullable=True)          # FK to users.id
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class DonationRequest(Base):
    __tablename__ = "donation_requests"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, nullable=False)           # FK to items.id
    requester_id = Column(Integer, nullable=False)      # FK to users.id
    status = Column(String, nullable=False, default="pending")  # pending/accepted/rejected
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    responded_at = Column(DateTime(timezone=True), nullable=True)

