import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSendOTP = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/auth/forgot-password",
        {
          email: email,
        }
      );

      setMessage(
        response.data.message ||
          "OTP sent successfully to your email."
      );

      // Save email for next OTP page
      localStorage.setItem(
        "reset_email",
        email
      );

      // Go to OTP page
      setTimeout(() => {
        navigate("/verify-otp");
      }, 1500);

    } catch (error) {
      console.error(
        "Forgot password error:",
        error
      );

      setError(
        error.response?.data?.detail ||
          "Unable to send OTP. Please try again."
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
          🔐 Forgot Password
        </h2>

        <p
          style={{
            textAlign: "center",
            color: "#64748b",
            fontSize: "14px",
            marginBottom: "25px",
          }}
        >
          Enter your registered email to receive
          an OTP.
        </p>

        <form onSubmit={handleSendOTP}>

          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
              color: "#374151",
            }}
          >
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            placeholder="Enter your registered email"
            required
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "18px",
              border:
                "1px solid #cbd5e1",
              borderRadius: "7px",
              boxSizing: "border-box",
              fontSize: "14px",
            }}
          />

          {message && (
            <div
              style={{
                backgroundColor: "#dcfce7",
                color: "#166534",
                padding: "12px",
                borderRadius: "7px",
                marginBottom: "15px",
                fontSize: "14px",
              }}
            >
              ✅ {message}
            </div>
          )}

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
              ? "Sending OTP..."
              : "📧 Send OTP"}
          </button>

        </form>

        <button
          type="button"
          onClick={() =>
            navigate("/login")
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
          ← Back to Login
        </button>

      </div>
    </div>
  );
}

export default ForgotPassword;