import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function VerifyOTP() {
  const navigate = useNavigate();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const email = localStorage.getItem("reset_email");

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    setError("");

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    if (!email) {
      setError("Email not found. Please try again.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/auth/verify-otp",
        {
          email: email,
          otp: otp,
        }
      );

      localStorage.setItem(
        "reset_verified",
        "true"
      );

      navigate("/reset-password");

    } catch (error) {
      console.error(
        "OTP verification error:",
        error
      );

      setError(
        error.response?.data?.detail ||
          "Invalid or expired OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f7fb",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          backgroundColor: "white",
          padding: "35px",
          borderRadius: "14px",
          boxShadow:
            "0 5px 20px rgba(0,0,0,0.1)",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            color: "#1e293b",
            lineHeight: "1.05",
            marginBottom: "8px",
          }}
        >
          📦 Parcel
          <br />
          Delivery
          <br />
          System
        </h1>

        <h2
          style={{
            textAlign: "center",
            marginTop: "25px",
            color: "#1e293b",
          }}
        >
          🔐 Verify OTP
        </h2>

        <p
          style={{
            textAlign: "center",
            color: "#64748b",
            fontSize: "14px",
            marginBottom: "25px",
          }}
        >
          Enter the 6-digit OTP sent to your email.
        </p>

        <form onSubmit={handleVerifyOTP}>

          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
              color: "#374151",
            }}
          >
            OTP
          </label>

          <input
            type="text"
            value={otp}
            onChange={(e) =>
              setOtp(
                e.target.value
                  .replace(/\D/g, "")
                  .slice(0, 6)
              )
            }
            placeholder="Enter 6-digit OTP"
            maxLength="6"
            required
            style={{
              width: "100%",
              padding: "13px",
              marginBottom: "18px",
              border:
                "1px solid #cbd5e1",
              borderRadius: "7px",
              boxSizing: "border-box",
              fontSize: "18px",
              textAlign: "center",
              letterSpacing: "5px",
              outline: "none",
            }}
          />

          {error && (
            <div
              style={{
                backgroundColor: "#fee2e2",
                color: "#991b1b",
                padding: "12px",
                borderRadius: "7px",
                marginBottom: "15px",
                fontSize: "14px",
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px",
              backgroundColor:
                loading
                  ? "#94a3b8"
                  : "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "7px",
              cursor:
                loading
                  ? "not-allowed"
                  : "pointer",
              fontSize: "16px",
              fontWeight: "600",
            }}
          >
            {loading
              ? "Verifying..."
              : "✅ Verify OTP"}
          </button>

        </form>

        <button
          type="button"
          onClick={() =>
            navigate("/forgot-password")
          }
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "15px",
            backgroundColor: "white",
            color: "#2563eb",
            border:
              "1px solid #2563eb",
            borderRadius: "7px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600",
          }}
        >
          ← Back
        </button>

      </div>
    </div>
  );
}

export default VerifyOTP;