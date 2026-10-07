from fastapi import APIRouter, Depends, HTTPException, Form
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt

import secrets
import time

from database import SessionLocal
from models import User

from schemas import (
    UserRegister,
    ForgotPasswordRequest,
    VerifyOTPRequest,
    ResetPasswordRequest
)

from email_service import send_otp_email


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login"
)


pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


SECRET_KEY = "parcel_delivery_secret_key"
ALGORITHM = "HS256"


# Stores OTP information temporarily
reset_otps = {}


def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# =========================================================
# GET CURRENT USER
# =========================================================

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("user_id")

        if user_id is None:

            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )

        user = db.query(User).filter(
            User.id == user_id
        ).first()

        if user is None:

            raise HTTPException(
                status_code=401,
                detail="User not found"
            )

        return user

    except Exception:

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )


# =========================================================
# REGISTER
# =========================================================

@router.post("/register")
def register_user(
    user: UserRegister,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    hashed_password = pwd_context.hash(
        user.password
    )

    new_user = User(
        name=user.name,
        email=user.email,
        phone=user.phone,
        password=hashed_password,
        role=user.role
    )

    db.add(new_user)

    db.commit()

    db.refresh(new_user)

    return {
        "message": "User registered successfully",
        "user_id": new_user.id
    }


# =========================================================
# LOGIN
# =========================================================

@router.post("/login")
def login_user(
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.email == username
    ).first()

    if not existing_user:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    password_valid = pwd_context.verify(
        password,
        existing_user.password
    )

    if not password_valid:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token_data = {
        "user_id": existing_user.id,
        "email": existing_user.email,
        "role": existing_user.role
    }

    access_token = jwt.encode(
        token_data,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": existing_user.id,
        "role": existing_user.role
    }


# =========================================================
# FORGOT PASSWORD - SEND OTP
# =========================================================

@router.post("/forgot-password")
def forgot_password(
    data: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):

    email = data.email

    user = db.query(User).filter(
        User.email == email
    ).first()

    if user is None:

        raise HTTPException(
            status_code=404,
            detail="Email address not registered."
        )

    # Generate 6 digit OTP
    otp = str(
        secrets.randbelow(900000) + 100000
    )

    # OTP valid for 5 minutes
    expiry_time = time.time() + 300

    reset_otps[email] = {
        "otp": otp,
        "expires": expiry_time,
        "verified": False
    }

    try:

        send_otp_email(
            email,
            otp
        )

    except Exception as error:

        print(
            "Email sending error:",
            error
        )

        reset_otps.pop(
            email,
            None
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to send OTP email."
        )

    return {
        "message":
            "OTP sent successfully to your email."
    }


# =========================================================
# VERIFY OTP
# =========================================================

@router.post("/verify-otp")
def verify_otp(
    data: VerifyOTPRequest
):

    email = data.email
    otp = data.otp

    stored_data = reset_otps.get(email)

    if stored_data is None:

        raise HTTPException(
            status_code=400,
            detail=
                "OTP not found. Please request a new OTP."
        )

    # Check expiry
    if time.time() > stored_data["expires"]:

        reset_otps.pop(
            email,
            None
        )

        raise HTTPException(
            status_code=400,
            detail=
                "OTP has expired. Please request a new OTP."
        )

    # Check OTP
    if stored_data["otp"] != otp:

        raise HTTPException(
            status_code=400,
            detail="Invalid OTP."
        )

    # Mark OTP as verified
    stored_data["verified"] = True

    return {
        "message":
            "OTP verified successfully."
    }


# =========================================================
# RESET PASSWORD
# =========================================================

@router.post("/reset-password")
def reset_password(
    data: ResetPasswordRequest,
    db: Session = Depends(get_db)
):

    email = data.email
    new_password = data.new_password

    # Find OTP information
    stored_data = reset_otps.get(email)

    if stored_data is None:

        raise HTTPException(
            status_code=400,
            detail=
                "Password reset session not found. "
                "Please request a new OTP."
        )

    # Check OTP expiry
    if time.time() > stored_data["expires"]:

        reset_otps.pop(
            email,
            None
        )

        raise HTTPException(
            status_code=400,
            detail=
                "OTP has expired. Please request a new OTP."
        )

    # Check whether OTP was verified
    if not stored_data.get("verified", False):

        raise HTTPException(
            status_code=400,
            detail=
                "OTP not verified. Please verify the OTP first."
        )

    # Find user
    user = db.query(User).filter(
        User.email == email
    ).first()

    if user is None:

        reset_otps.pop(
            email,
            None
        )

        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    # Hash new password
    hashed_password = pwd_context.hash(
        new_password
    )

    # Update password
    user.password = hashed_password

    db.commit()

    db.refresh(user)

    # Remove OTP information
    reset_otps.pop(
        email,
        None
    )

    return {
        "message":
            "Password reset successfully."
    }


# =========================================================
# MY PROFILE
# =========================================================

@router.get("/me")
def get_my_profile(
    current_user: User = Depends(
        get_current_user
    )
):

    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "phone": current_user.phone,
        "role": current_user.role
    }