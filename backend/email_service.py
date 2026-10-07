import os
import requests
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

ENV_FILE = os.path.join(
    BASE_DIR,
    ".env"
)

load_dotenv(ENV_FILE)


def send_otp_email(
    receiver_email: str,
    otp: str
):
    api_key = os.getenv(
        "BREVO_API_KEY"
    )

    sender_email = os.getenv(
        "BREVO_SENDER_EMAIL"
    )

    sender_name = os.getenv(
        "BREVO_SENDER_NAME",
        "Parcel Delivery System"
    )

    if not api_key:
        raise Exception(
            "BREVO_API_KEY is missing in .env"
        )

    if not sender_email:
        raise Exception(
            "BREVO_SENDER_EMAIL is missing in .env"
        )

    url = "https://api.brevo.com/v3/smtp/email"

    headers = {
        "accept": "application/json",
        "api-key": api_key,
        "content-type": "application/json",
    }

    data = {
        "sender": {
            "name": sender_name,
            "email": sender_email,
        },
        "to": [
            {
                "email": receiver_email
            }
        ],
        "subject": "Parcel Delivery - Password Reset OTP",
        "textContent": f"""
Hello,

You requested to reset your Parcel Delivery account password.

Your OTP is:

{otp}

This OTP is valid for 5 minutes.

If you did not request a password reset,
please ignore this email.

Regards,
Parcel Delivery System
""",
    }

    response = requests.post(
        url,
        headers=headers,
        json=data,
        timeout=30
    )

    if response.status_code not in [200, 201, 202]:
        raise Exception(
            f"Brevo email error: "
            f"{response.status_code} - "
            f"{response.text}"
        )

    return response.json()