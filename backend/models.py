from sqlalchemy import Column, Integer, String

from database import Base


# =========================
# USER MODEL
# =========================

class User(Base):
    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String(100),
        nullable=False
    )

    email = Column(
        String(100),
        unique=True,
        nullable=False,
        index=True
    )

    phone = Column(
        String(15),
        nullable=False
    )

    password = Column(
        String(255),
        nullable=False
    )

    role = Column(
        String(20),
        nullable=False,
        default="user"
    )


# =========================
# PARCEL MODEL
# =========================

class Parcel(Base):
    __tablename__ = "parcels"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    sender_id = Column(
        Integer,
        nullable=False
    )

    captain_id = Column(
        Integer,
        nullable=True
    )

    receiver_name = Column(
        String(100),
        nullable=False
    )

    receiver_phone = Column(
        String(15),
        nullable=False
    )

    pickup_address = Column(
        String(255),
        nullable=False
    )

    delivery_address = Column(
        String(255),
        nullable=False
    )

    parcel_type = Column(
        String(50),
        nullable=False
    )

    weight = Column(
        String(20),
        nullable=False
    )

    price = Column(
        Integer,
        nullable=False
    )

    status = Column(
        String(50),
        nullable=False,
        default="Booked"
    )