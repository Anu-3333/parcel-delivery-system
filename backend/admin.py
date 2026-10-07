from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import SessionLocal
from models import User, Parcel
from auth import get_current_user


router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
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
# ADMIN PROFILE
# =====================================================

@router.get("/me")
def admin_profile(
    current_user: User = Depends(get_current_user)
):

    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only admins can access this"
        )

    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "phone": current_user.phone,
        "role": current_user.role
    }


# =====================================================
# ALL USERS
# =====================================================

@router.get("/users")
def get_all_users(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only admins can access this"
        )

    users = db.query(User).all()

    return [
        {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "role": user.role
        }
        for user in users
    ]


# =====================================================
# ALL PARCELS
# =====================================================

@router.get("/parcels")
def get_all_parcels(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    if current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only admins can access this"
        )

    parcels = db.query(Parcel).all()

    result = []

    for parcel in parcels:

        # Find sender
        sender = db.query(User).filter(
            User.id == parcel.sender_id
        ).first()

        # Find captain
        captain = None

        if parcel.captain_id:

            captain = db.query(User).filter(
                User.id == parcel.captain_id
            ).first()

        result.append({

            "id": parcel.id,

            "sender_id": parcel.sender_id,

            "sender_name":
                sender.name
                if sender
                else "Unknown",

            "captain_id":
                parcel.captain_id,

            "captain_name":
                captain.name
                if captain
                else "Not Assigned",

            "receiver_name":
                parcel.receiver_name,

            "receiver_phone":
                parcel.receiver_phone,

            "pickup_address":
                parcel.pickup_address,

            "delivery_address":
                parcel.delivery_address,

            "parcel_type":
                parcel.parcel_type,

            "weight":
                parcel.weight,

            "price":
                parcel.price,

            "status":
                parcel.status
        })

    return result