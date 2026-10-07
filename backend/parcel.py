from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import SessionLocal
from models import Parcel, User
from schemas import ParcelCreate, ParcelStatusUpdate
from auth import get_current_user


router = APIRouter(
    prefix="/parcels",
    tags=["Parcels"]
)


# =========================
# DATABASE
# =========================

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# =========================
# BOOK PARCEL
# =========================

@router.post("/book")
def book_parcel(
    parcel: ParcelCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    new_parcel = Parcel(
        sender_id=current_user.id,
        receiver_name=parcel.receiver_name,
        receiver_phone=parcel.receiver_phone,
        pickup_address=parcel.pickup_address,
        delivery_address=parcel.delivery_address,
        parcel_type=parcel.parcel_type,
        weight=parcel.weight,
        price=parcel.price,
        status="Booked"
    )

    db.add(new_parcel)
    db.commit()
    db.refresh(new_parcel)

    return {
        "message": "Parcel booked successfully",
        "parcel_id": new_parcel.id,
        "status": new_parcel.status
    }


# =========================
# MY PARCELS
# =========================

@router.get("/my-parcels")
def get_my_parcels(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    parcels = db.query(Parcel).filter(
        Parcel.sender_id == current_user.id
    ).all()

    return parcels


# =========================
# UPDATE PARCEL STATUS
# =========================

@router.put("/{parcel_id}/status")
def update_parcel_status(
    parcel_id: int,
    status_data: ParcelStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    parcel = db.query(Parcel).filter(
        Parcel.id == parcel_id,
        Parcel.sender_id == current_user.id
    ).first()

    if parcel is None:
        raise HTTPException(
            status_code=404,
            detail="Parcel not found"
        )

    parcel.status = status_data.status

    db.commit()
    db.refresh(parcel)

    return {
        "message": "Parcel status updated successfully",
        "parcel_id": parcel.id,
        "status": parcel.status
    }