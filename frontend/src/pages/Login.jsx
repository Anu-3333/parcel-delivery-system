import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setErrorMessage("");
    setLoading(true);

    try {
      const formData = new URLSearchParams();

      formData.append("username", email.trim());
      formData.append("password", password);

      const response = await axios.post(
        "https://parcel-delivery-system-39oz.onrender.com/auth/login",
        formData,
        {
          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
          },
        }
      );

      console.log("Login successful:", response.data);

      // Save login information
      localStorage.setItem(
        "token",
        response.data.access_token
      );

      localStorage.setItem(
        "role",
        response.data.role
      );

      localStorage.setItem(
        "user_id",
        response.data.user_id
      );

      // Navigate based on role
      if (response.data.role === "admin") {
        navigate("/admin");
      } else if (
        response.data.role === "captain"
      ) {
        navigate("/captain");
      } else {
        navigate("/dashboard");
      }

    } catch (error) {
      console.error("Login Error:", error);

      if (error.response) {
        console.error(
          "Backend Status:",
          error.response.status
        );

        console.error(
          "Backend Response:",
          error.response.data
        );

        const backendError =
          error.response.data?.detail;

        if (Array.isArray(backendError)) {
          setErrorMessage(
            backendError
              .map(
                (item) =>
                  item.msg || "Invalid input"
              )
              .join(", ")
          );
        } else {
          setErrorMessage(
            backendError ||
              `Login failed. Server returned ${error.response.status}.`
          );
        }
      } else if (error.request) {
        console.error(
          "No response received from backend:",
          error.request
        );

        setErrorMessage(
          "Unable to connect to the server. Please check your internet connection and try again."
        );
      } else {
        setErrorMessage(
          error.message ||
            "Login failed. Please try again."
        );
      }

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

        {/* Header */}

        <h1
          style={{
            textAlign: "center",
            marginBottom: "8px",
            color: "#1e293b",
            lineHeight: "1.05",
          }}
        >
          📦 Parcel
          <br />
          Delivery
          <br />
          System
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#64748b",
            marginBottom: "28px",
          }}
        >
          Login to your account
        </p>

        {/* Login Form */}

        <form onSubmit={handleLogin}>

          {/* Email */}

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
            placeholder="Enter your email"
            required
            style={inputStyle}
          />

          {/* Password */}

          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
              color: "#374151",
            }}
          >
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            placeholder="Enter your password"
            required
            style={inputStyle}
          />

          {/* Forgot Password */}

          <div
            style={{
              textAlign: "right",
              marginTop: "-8px",
              marginBottom: "18px",
            }}
          >
            <button
              type="button"
              onClick={() =>
                navigate("/forgot-password")
              }
              style={{
                background: "none",
                border: "none",
                color: "#2563eb",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
                padding: 0,
              }}
            >
              Forgot Password?
            </button>
          </div>

          {/* Error */}

          {errorMessage && (
            <div
              style={{
                color: "#dc2626",
                backgroundColor: "#fee2e2",
                padding: "10px",
                borderRadius: "6px",
                marginBottom: "15px",
                fontSize: "14px",
              }}
            >
              ⚠️ {errorMessage}
            </div>
          )}

          {/* Login Button */}

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
              ? "Logging in..."
              : "Login"}
          </button>

        </form>

        {/* Register Section */}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            margin: "25px 0",
          }}
        >
          <div
            style={{
              flex: 1,
              height: "1px",
              backgroundColor: "#e5e7eb",
            }}
          />

          <span
            style={{
              color: "#9ca3af",
              fontSize: "13px",
            }}
          >
            OR
          </span>

          <div
            style={{
              flex: 1,
              height: "1px",
              backgroundColor: "#e5e7eb",
            }}
          />
        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/register")
          }
          style={{
            width: "100%",
            padding: "13px",
            backgroundColor: "white",
            color: "#2563eb",
            border:
              "1px solid #2563eb",
            borderRadius: "7px",
            cursor: "pointer",
            fontSize: "15px",
            fontWeight: "600",
          }}
        >
          👤 Create New Account
        </button>

      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "18px",
  border:
    "1px solid #cbd5e1",
  borderRadius: "7px",
  boxSizing: "border-box",
  fontSize: "14px",
  outline: "none",
};

export default Login;