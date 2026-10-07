from pydantic import BaseModel, EmailStr


# =========================
# USER REGISTER
# =========================

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str
    role: str = "user"


# =========================
# PARCEL CREATE
# =========================

class ParcelCreate(BaseModel):
    receiver_name: str
    receiver_phone: str
    pickup_address: str
    delivery_address: str
    parcel_type: str
    weight: str
    price: int


# =========================
# PARCEL STATUS UPDATE
# =========================

class ParcelStatusUpdate(BaseModel):
    status: str


# =========================
# FORGOT PASSWORD
# =========================

class ForgotPasswordRequest(BaseModel):
    email: EmailStr


# =========================
# VERIFY OTP
# =========================

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp: str


# =========================
# RESET PASSWORD
# =========================

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    new_password: str