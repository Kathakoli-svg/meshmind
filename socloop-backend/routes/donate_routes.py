import os
import uuid
from fastapi import APIRouter, File, Form, UploadFile, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from auth import get_optional_user
import models, schemas
from yolo_detect import detect_category

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_TYPES = {"image/jpeg", "image/jpg", "image/png"}


async def _read_and_detect(file: UploadFile) -> tuple[bytes, str]:
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Only JPEG and PNG images are supported",
        )
    image_bytes = await file.read()
    try:
        detected = detect_category(image_bytes)
    except Exception:
        from yolo_detect import FALLBACK_CATEGORY

        detected = FALLBACK_CATEGORY
    return image_bytes, detected


@router.post("/donate/detect-category", response_model=schemas.CategoryDetectResponse)
async def preview_category(file: UploadFile = File(...)):
    _, detected = await _read_and_detect(file)
    return schemas.CategoryDetectResponse(category=detected)


@router.post("/donate", response_model=schemas.DonateResponse)
async def donate(
    title: str = Form(...),
    location: str = Form(...),
    condition: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User | None = Depends(get_optional_user),
):
    image_bytes, detected = await _read_and_detect(file)

    # ── Save image file ──────────────────────────────────────────────────────
    ext = (file.filename or "upload").rsplit(".", 1)[-1].lower()
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)
    with open(filepath, "wb") as f:
        f.write(image_bytes)

    # ── Persist to DB ────────────────────────────────────────────────────────
    item = models.Item(
        title=title,
        category=detected,
        detected_category=detected,
        condition=condition,
        location=location,
        image_url=f"/uploads/{filename}",
        donor_id=current_user.id if current_user else None,
    )
    db.add(item)
    db.commit()
    db.refresh(item)

    return schemas.DonateResponse(
        id=item.id,
        detected_category=detected,
        message="Donation submitted successfully",
    )
