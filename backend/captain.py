from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import SessionLocal
from models import User, Parcel
from auth import get_current_user
from schemas import ParcelStatusUpdate

from websocket import (
    send_tracking_update,
    send_captain_location
)


router = APIRouter(
    prefix="/captain",
    tags=["Captain"]
)


# =====================================================
# DATABASE
# =====================================================

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# =====================================================
# CAPTAIN PROFILE
# =====================================================

@router.get("/me")
def captain_profile(
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "captain":
        raise HTTPException(
            status_code=403,
            detail="Only captains can access this"
        )

    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "phone": current_user.phone,
        "role": current_user.role
    }


# =====================================================
# AVAILABLE PARCELS
# =====================================================

@router.get("/available-parcels")
def available_parcels(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if current_user.role != "captain":
        raise HTTPException(
            status_code=403,
            detail="Only captains can access this"
        )

    parcels = db.query(Parcel).filter(
        Parcel.status == "Booked"
    ).all()

    return parcels


# =====================================================
# ACCEPT PARCEL
# =====================================================

@router.put("/accept/{parcel_id}")
def accept_parcel(
    parcel_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if current_user.role != "captain":
        raise HTTPException(
            status_code=403,
            detail="Only captains can accept parcels"
        )

    parcel = db.query(Parcel).filter(
        Parcel.id == parcel_id,
        Parcel.status == "Booked"
    ).first()

    if parcel is None:
        raise HTTPException(
            status_code=404,
            detail="Parcel not available"
        )

    # Assign parcel to current captain
    parcel.status = "Captain Assigned"
    parcel.captain_id = current_user.id

    db.commit()
    db.refresh(parcel)

    return {
        "message": "Parcel accepted successfully",
        "parcel_id": parcel.id,
        "status": parcel.status,
        "captain_id": current_user.id
    }


# =====================================================
# MY ASSIGNED PARCELS
# =====================================================

@router.get("/my-parcels")
def my_assigned_parcels(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if current_user.role != "captain":
        raise HTTPException(
            status_code=403,
            detail="Only captains can access this"
        )

    parcels = db.query(Parcel).filter(
        Parcel.captain_id == current_user.id,
        Parcel.status.in_([
            "Captain Assigned",
            "Picked Up",
            "In Transit",
            "Out for Delivery",
            "Delivered"
        ])
    ).all()

    return parcels


# =====================================================
# UPDATE PARCEL STATUS
# =====================================================

@router.put("/update-status/{parcel_id}")
async def captain_update_status(
    parcel_id: int,
    status_data: ParcelStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if current_user.role != "captain":
        raise HTTPException(
            status_code=403,
            detail="Only captains can update parcel status"
        )

    # Find parcel assigned to current captain
    parcel = db.query(Parcel).filter(
        Parcel.id == parcel_id,
        Parcel.captain_id == current_user.id
    ).first()

    if parcel is None:
        raise HTTPException(
            status_code=404,
            detail="Parcel not found or not assigned to you"
        )

    allowed_statuses = [
        "Captain Assigned",
        "Picked Up",
        "In Transit",
        "Out for Delivery",
        "Delivered"
    ]

    if status_data.status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Invalid parcel status"
        )

    # Update parcel status
    parcel.status = status_data.status

    # Save changes
    db.commit()
    db.refresh(parcel)

    # Send real-time status update
    await send_tracking_update(
        parcel.id,
        parcel.status
    )

    return {
        "message": "Parcel status updated successfully",
        "parcel_id": parcel.id,
        "status": parcel.status,
        "captain_id": current_user.id
    }


# =====================================================
# CAPTAIN LIVE LOCATION
# =====================================================

@router.post("/location")
async def update_captain_location(
    latitude: float,
    longitude: float,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    # Check captain role
    if current_user.role != "captain":
        raise HTTPException(
            status_code=403,
            detail="Only captains can update location"
        )

    # Find active parcels assigned to this captain
    active_parcels = db.query(Parcel).filter(
        Parcel.captain_id == current_user.id,
        Parcel.status.in_([
            "Captain Assigned",
            "Picked Up",
            "In Transit",
            "Out for Delivery"
        ])
    ).all()

    # Send captain location to every active parcel
    for parcel in active_parcels:

        await send_captain_location(
            parcel.id,
            current_user.id,
            latitude,
            longitude
        )

    return {
        "message": "Captain location updated",
        "captain_id": current_user.id,
        "latitude": latitude,
        "longitude": longitude,
        "active_parcels": len(active_parcels)
    }