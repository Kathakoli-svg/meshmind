from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user
import models, schemas

router = APIRouter()


@router.get("/dashboard/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Return real-time dashboard stats for the logged-in user."""

    # Items shared: items this user donated
    items_shared = (
        db.query(models.Item)
        .filter(models.Item.donor_id == current_user.id)
        .count()
    )

    # Items requested: outgoing requests by this user
    items_requested = (
        db.query(models.DonationRequest)
        .filter(models.DonationRequest.requester_id == current_user.id)
        .count()
    )

    # People helped: distinct requesters who got an "accepted" request
    # for items donated by this user
    donor_item_ids = [
        item_id
        for (item_id,) in db.query(models.Item.id)
        .filter(models.Item.donor_id == current_user.id)
        .all()
    ]

    people_helped = 0
    accepted_total = 0
    total_requests = 0
    if donor_item_ids:
        people_helped = (
            db.query(models.DonationRequest.requester_id)
            .filter(
                models.DonationRequest.item_id.in_(donor_item_ids),
                models.DonationRequest.status == "accepted",
            )
            .distinct()
            .count()
        )
        accepted_total = (
            db.query(models.DonationRequest)
            .filter(
                models.DonationRequest.item_id.in_(donor_item_ids),
                models.DonationRequest.status == "accepted",
            )
            .count()
        )
        total_requests = (
            db.query(models.DonationRequest)
            .filter(models.DonationRequest.item_id.in_(donor_item_ids))
            .count()
        )

    # Resources reused percentage
    if total_requests > 0:
        pct = round((accepted_total / total_requests) * 100)
        resources_reused = f"{pct}%"
    elif items_shared > 0:
        resources_reused = "0%"
    else:
        resources_reused = "—"

    return schemas.DashboardStats(
        items_shared=items_shared,
        items_requested=items_requested,
        resources_reused=resources_reused,
        people_helped=people_helped,
    )


@router.get("/dashboard/my-items", response_model=list[schemas.MyItemOut])
def get_my_items(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """Return the donor's own donated items with their current status."""
    items = (
        db.query(models.Item)
        .filter(models.Item.donor_id == current_user.id)
        .order_by(models.Item.created_at.desc())
        .all()
    )

    result = []
    for item in items:
        # Check if any request has been accepted
        has_accepted = (
            db.query(models.DonationRequest)
            .filter(
                models.DonationRequest.item_id == item.id,
                models.DonationRequest.status == "accepted",
            )
            .first()
        )
        result.append(
            schemas.MyItemOut(
                id=item.id,
                title=item.title,
                category=item.category,
                detected_category=item.detected_category,
                condition=item.condition,
                location=item.location,
                image_url=item.image_url,
                created_at=item.created_at,
                status="claimed" if has_accepted else "available",
            )
        )
    return result
