from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional
from database import get_db
from auth import get_optional_user
import models, schemas

router = APIRouter()

# Clothing sub-categories that YOLO detection returns
CLOTHES_CATEGORIES = [
    "Shoes",
    "Shirts / Tops",
    "Pants / Bottoms",
    "Jackets / Coats",
    "Dresses",
    "Accessories",
]


@router.get("/items", response_model=list[schemas.ItemOut])
def get_items(
    category: Optional[str] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search by title"),
    db: Session = Depends(get_db),
    current_user: models.User | None = Depends(get_optional_user),
):
    query = db.query(models.Item)

    # Exclude the logged-in user's own donated items
    if current_user:
        query = query.filter(
            or_(
                models.Item.donor_id != current_user.id,
                models.Item.donor_id.is_(None),
            )
        )

    if category and category.lower() not in ("", "all categories", "all"):
        # "Clothes" is a meta-category grouping all clothing sub-categories
        if category == "Clothes":
            query = query.filter(
                or_(
                    models.Item.category.in_(CLOTHES_CATEGORIES),
                    models.Item.detected_category.in_(CLOTHES_CATEGORIES),
                )
            )
        else:
            query = query.filter(
                or_(
                    models.Item.category == category,
                    models.Item.detected_category == category,
                )
            )

    if search and search.strip():
        query = query.filter(models.Item.title.ilike(f"%{search.strip()}%"))

    return query.order_by(models.Item.created_at.desc()).all()


@router.get("/items/{item_id}", response_model=schemas.ItemDetailOut)
def get_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(models.Item).filter(models.Item.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    # Look up donor info if available
    donor_name = None
    donor_phone = None
    donor_email = None
    if item.donor_id:
        donor = db.query(models.User).filter(models.User.id == item.donor_id).first()
        if donor:
            donor_name = donor.name
            donor_phone = donor.phone
            donor_email = donor.email

    return schemas.ItemDetailOut(
        id=item.id,
        title=item.title,
        category=item.category,
        detected_category=item.detected_category,
        condition=item.condition,
        location=item.location,
        image_url=item.image_url,
        created_at=item.created_at,
        donor_name=donor_name,
        donor_phone=donor_phone,
        donor_email=donor_email,
    )
