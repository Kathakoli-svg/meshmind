from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# ─── Auth ────────────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None

    model_config = {"from_attributes": True}


# ─── Items ───────────────────────────────────────────────────────────────────

class ItemOut(BaseModel):
    id: int
    title: str
    category: str
    detected_category: Optional[str] = None
    condition: str
    location: str
    image_url: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ItemDetailOut(BaseModel):
    id: int
    title: str
    category: str
    detected_category: Optional[str] = None
    condition: str
    location: str
    image_url: Optional[str] = None
    created_at: datetime
    donor_name: Optional[str] = None
    donor_phone: Optional[str] = None
    donor_email: Optional[str] = None


class CategoryDetectResponse(BaseModel):
    category: str


class DonateResponse(BaseModel):
    id: int
    detected_category: str
    message: str


# ─── Donation Requests ──────────────────────────────────────────────────────

class DonationRequestCreate(BaseModel):
    item_id: int


class DonationRequestOut(BaseModel):
    id: int
    item_id: int
    requester_id: int
    status: str
    created_at: datetime
    responded_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class IncomingRequestOut(BaseModel):
    """Shown to the donor — includes requester info and item info."""
    id: int
    item_id: int
    item_title: str
    item_category: str
    item_image_url: Optional[str] = None
    requester_name: str
    requester_email: str
    requester_phone: Optional[str] = None
    status: str
    created_at: datetime


class OutgoingRequestOut(BaseModel):
    """Shown to the requester — includes item info and status."""
    id: int
    item_id: int
    item_title: str
    item_category: str
    item_image_url: Optional[str] = None
    donor_name: Optional[str] = None
    status: str
    created_at: datetime


class RequestRespondBody(BaseModel):
    status: str  # "accepted" or "rejected"


# ─── Dashboard ──────────────────────────────────────────────────────────────

class MyItemOut(BaseModel):
    """Donor's own donated item with its current status."""
    id: int
    title: str
    category: str
    detected_category: Optional[str] = None
    condition: str
    location: str
    image_url: Optional[str] = None
    created_at: datetime
    status: str  # "available" or "claimed"

    model_config = {"from_attributes": True}


class DashboardStats(BaseModel):
    items_shared: int
    items_requested: int
    resources_reused: str
    people_helped: int

