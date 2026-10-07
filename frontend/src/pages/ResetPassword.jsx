import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function ResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const email = localStorage.getItem("reset_email");
  const verified =
    localStorage.getItem("reset_verified");

  const handleResetPassword = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email) {
      setError(
        "Email not found. Please start the password reset process again."
      );
      return;
    }

    if (verified !== "true") {
      setError(
        "OTP verification required."
      );
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/auth/reset-password",
        {
          email: email,
          new_password: password,
        }
      );

      setSuccess(
        response.data.message ||
          "Password reset successfully!"
      );

      localStorage.removeItem(
        "reset_email"
      );

      localStorage.removeItem(
        "reset_verified"
      );

      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (error) {
      console.error(
        "Reset password error:",
        error
      );

      setError(
        error.response?.data?.detail ||
          "Unable to reset password."
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
          🔑 Reset Password
        </h2>

        <p
          style={{
            textAlign: "center",
            color: "#64748b",
            fontSize: "14px",
            marginBottom: "25px",
          }}
        >
          Create a new password for your account.
        </p>

        <form onSubmit={handleResetPassword}>

          {/* New Password */}

          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
              color: "#374151",
            }}
          >
            New Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            placeholder="Enter new password"
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

          {/* Confirm Password */}

          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
              color: "#374151",
            }}
          >
            Confirm New Password
          </label>

          <input
            type="password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(
                e.target.value
              )
            }
            placeholder="Confirm new password"
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

          {/* Error */}

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

          {/* Success */}

          {success && (
            <div
              style={{
                backgroundColor: "#dcfce7",
                color: "#166534",
                padding: "12px",
                borderRadius: "7px",
                marginBottom: "15px",
                fontSize: "14px",
                textAlign: "center",
              }}
            >
              ✅ {success}
              <br />
              <small>
                Redirecting to Login...
              </small>
            </div>
          )}

          {/* Reset Button */}

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
              ? "Resetting..."
              : "🔑 Reset Password"}
          </button>

        </form>

        {/* Back to Login */}

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

export default ResetPassword;