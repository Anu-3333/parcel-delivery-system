import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Password check
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Password length
    if (form.password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "https://parcel-delivery-system-39oz.onrender.com/auth/register",
        {
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          role: "user",
        }
      );

      setSuccess(
        response.data.message ||
          "Registration successful!"
      );

      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });

      // Login page ki redirect
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      setError(
        error.response?.data?.detail ||
          "Registration failed. Please try again."
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
        padding: "30px 20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "450px",
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
          }}
        >
          👤 Create Account
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#64748b",
            marginBottom: "28px",
          }}
        >
          Register for Parcel Delivery
        </p>

        <form onSubmit={handleRegister}>

          {/* Name */}

          <label style={labelStyle}>
            Full Name
          </label>

          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
            style={inputStyle}
          />

          {/* Email */}

          <label style={labelStyle}>
            Email
          </label>

          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
            style={inputStyle}
          />

          {/* Phone */}

          <label style={labelStyle}>
            Phone Number
          </label>

          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Enter your phone number"
            required
            style={inputStyle}
          />

          {/* Password */}

          <label style={labelStyle}>
            Password
          </label>

          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Create a password"
            required
            style={inputStyle}
          />

          {/* Confirm Password */}

          <label style={labelStyle}>
            Confirm Password
          </label>

          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            required
            style={inputStyle}
          />

          {/* Error */}

          {error && (
            <div
              style={{
                marginBottom: "15px",
                padding: "12px",
                backgroundColor: "#fee2e2",
                color: "#991b1b",
                borderRadius: "7px",
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
                marginBottom: "15px",
                padding: "12px",
                backgroundColor: "#dcfce7",
                color: "#166534",
                borderRadius: "7px",
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

          {/* Register Button */}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "13px",
              backgroundColor: loading
                ? "#94a3b8"
                : "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "7px",
              cursor: loading
                ? "not-allowed"
                : "pointer",
              fontSize: "16px",
              fontWeight: "600",
            }}
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
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

const labelStyle = {
  display: "block",
  marginBottom: "7px",
  fontWeight: "600",
  color: "#374151",
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginBottom: "17px",
  border:
    "1px solid #cbd5e1",
  borderRadius: "7px",
  boxSizing: "border-box",
  fontSize: "14px",
  outline: "none",
};

export default Register;