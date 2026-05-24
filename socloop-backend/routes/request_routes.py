from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user
import models, schemas

router = APIRouter()


@router.post("/requests", response_model=schemas.DonationRequestOut)
def create_request(
    body: schemas.DonationRequestCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """A logged-in user requests a donated item."""
    item = db.query(models.Item).filter(models.Item.id == body.item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    # Cannot request your own item
    if item.donor_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot request your own item")

    # Check for duplicate pending request
    existing = (
        db.query(models.DonationRequest)
        .filter(
            models.DonationRequest.item_id == body.item_id,
            models.DonationRequest.requester_id == current_user.id,
            models.DonationRequest.status == "pending",
        )
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="You already have a pending request for this item")

    req = models.DonationRequest(
        item_id=body.item_id,
        requester_id=current_user.id,
        status="pending",
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return req


@router.get("/requests/incoming", response_model=list[schemas.IncomingRequestOut])
def get_incoming_requests(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Donor sees all requests for their donated items."""
    # Get all item IDs belonging to this donor
    donor_item_ids = [
        item_id
        for (item_id,) in db.query(models.Item.id)
        .filter(models.Item.donor_id == current_user.id)
        .all()
    ]

    if not donor_item_ids:
        return []

    requests = (
        db.query(models.DonationRequest)
        .filter(models.DonationRequest.item_id.in_(donor_item_ids))
        .order_by(models.DonationRequest.created_at.desc())
        .all()
    )

    result = []
    for req in requests:
        item = db.query(models.Item).filter(models.Item.id == req.item_id).first()
        requester = db.query(models.User).filter(models.User.id == req.requester_id).first()
        if not item or not requester:
            continue
        result.append(
            schemas.IncomingRequestOut(
                id=req.id,
                item_id=req.item_id,
                item_title=item.title,
                item_category=item.detected_category or item.category,
                item_image_url=item.image_url,
                requester_name=requester.name,
                requester_email=requester.email,
                requester_phone=requester.phone,
                status=req.status,
                created_at=req.created_at,
            )
        )
    return result


@router.get("/requests/my", response_model=list[schemas.OutgoingRequestOut])
def get_my_requests(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Requester sees their outgoing requests."""
    requests = (
        db.query(models.DonationRequest)
        .filter(models.DonationRequest.requester_id == current_user.id)
        .order_by(models.DonationRequest.created_at.desc())
        .all()
    )

    result = []
    for req in requests:
        item = db.query(models.Item).filter(models.Item.id == req.item_id).first()
        if not item:
            continue
        donor_name = None
        if item.donor_id:
            donor = db.query(models.User).filter(models.User.id == item.donor_id).first()
            if donor:
                donor_name = donor.name
        result.append(
            schemas.OutgoingRequestOut(
                id=req.id,
                item_id=req.item_id,
                item_title=item.title,
                item_category=item.detected_category or item.category,
                item_image_url=item.image_url,
                donor_name=donor_name,
                status=req.status,
                created_at=req.created_at,
            )
        )
    return result


@router.put("/requests/{request_id}/respond", response_model=schemas.DonationRequestOut)
def respond_to_request(
    request_id: int,
    body: schemas.RequestRespondBody,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Donor accepts or rejects a donation request."""
    if body.status not in ("accepted", "rejected"):
        raise HTTPException(status_code=400, detail="Status must be 'accepted' or 'rejected'")

    req = (
        db.query(models.DonationRequest)
        .filter(models.DonationRequest.id == request_id)
        .first()
    )
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")

    # Verify the current user owns the item
    item = db.query(models.Item).filter(models.Item.id == req.item_id).first()
    if not item or item.donor_id != current_user.id:
        raise HTTPException(status_code=403, detail="You are not the donor of this item")

    if req.status != "pending":
        raise HTTPException(status_code=400, detail="Request has already been responded to")

    req.status = body.status
    req.responded_at = datetime.utcnow()
    db.commit()
    db.refresh(req)
    return req
