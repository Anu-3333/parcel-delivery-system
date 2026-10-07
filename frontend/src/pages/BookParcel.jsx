import { useState } from "react";
import { useNavigate } from "react-router-dom";

function BookParcel() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    receiver_name: "",
    receiver_phone: "",
    pickup_address: "",
    delivery_address: "",
    parcel_type: "",
    weight: "",
    price: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setError("");

    // Save parcel details temporarily
    localStorage.setItem(
      "pendingParcel",
      JSON.stringify({
        receiver_name: form.receiver_name,
        receiver_phone: form.receiver_phone,
        pickup_address: form.pickup_address,
        delivery_address: form.delivery_address,
        parcel_type: form.parcel_type,
        weight: form.weight,
        price: Number(form.price),
      })
    );

    // Go to payment page
    navigate("/payment");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f8fbff 0%, #eef4ff 100%)",
        padding: "40px 20px",
        fontFamily:
          "Arial, Helvetica, sans-serif",
      }}
    >
      {/* ================= MAIN CONTAINER ================= */}

      <div
        style={{
          maxWidth: "760px",
          margin: "auto",
        }}
      >
        {/* BACK BUTTON */}

        <button
          onClick={() => navigate("/dashboard")}
          style={{
            background: "transparent",
            border: "none",
            color: "#2563eb",
            fontSize: "15px",
            fontWeight: "600",
            cursor: "pointer",
            marginBottom: "18px",
            padding: "5px 0",
          }}
        >
          ← Back to Dashboard
        </button>

        {/* ================= CARD ================= */}

        <div
          style={{
            backgroundColor: "white",
            padding: "35px",
            borderRadius: "20px",
            boxShadow:
              "0 8px 30px rgba(15, 23, 42, 0.10)",
            border:
              "1px solid #e5e7eb",
          }}
        >
          {/* HEADER */}

          <div
            style={{
              textAlign: "center",
              marginBottom: "32px",
            }}
          >
            <div
              style={{
                width: "65px",
                height: "65px",
                margin: "0 auto 15px",
                borderRadius: "18px",
                backgroundColor: "#dbeafe",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "32px",
              }}
            >
              📦
            </div>

            <h1
              style={{
                margin: "0 0 8px",
                color: "#111827",
                fontSize: "28px",
              }}
            >
              Book New Parcel
            </h1>

            <p
              style={{
                margin: 0,
                color: "#64748b",
                fontSize: "15px",
              }}
            >
              Enter the parcel details to continue
              with payment.
            </p>
          </div>

          {/* ================= FORM ================= */}

          <form onSubmit={handleSubmit}>
            {/* RECEIVER SECTION */}

            <div
              style={{
                marginBottom: "28px",
              }}
            >
              <h3 style={sectionTitleStyle}>
                👤 Receiver Details
              </h3>

              {/* Receiver Name */}

              <label style={labelStyle}>
                Receiver Name
              </label>

              <input
                type="text"
                name="receiver_name"
                value={form.receiver_name}
                onChange={handleChange}
                placeholder="Enter receiver name"
                required
                style={inputStyle}
              />

              {/* Receiver Phone */}

              <label style={labelStyle}>
                Receiver Phone
              </label>

              <input
                type="tel"
                name="receiver_phone"
                value={form.receiver_phone}
                onChange={handleChange}
                placeholder="Enter 10-digit phone number"
                pattern="[0-9]{10}"
                maxLength="10"
                required
                style={inputStyle}
              />
            </div>

            {/* ADDRESS SECTION */}

            <div
              style={{
                marginBottom: "28px",
              }}
            >
              <h3 style={sectionTitleStyle}>
                📍 Delivery Details
              </h3>

              {/* Pickup Address */}

              <label style={labelStyle}>
                Pickup Address
              </label>

              <input
                type="text"
                name="pickup_address"
                value={form.pickup_address}
                onChange={handleChange}
                placeholder="Enter pickup location"
                required
                style={inputStyle}
              />

              {/* Delivery Address */}

              <label style={labelStyle}>
                Delivery Address
              </label>

              <input
                type="text"
                name="delivery_address"
                value={form.delivery_address}
                onChange={handleChange}
                placeholder="Enter delivery location"
                required
                style={inputStyle}
              />
            </div>

            {/* PARCEL SECTION */}

            <div
              style={{
                marginBottom: "28px",
              }}
            >
              <h3 style={sectionTitleStyle}>
                📦 Parcel Details
              </h3>

              {/* Parcel Type */}

              <label style={labelStyle}>
                Parcel Type
              </label>

              <select
                name="parcel_type"
                value={form.parcel_type}
                onChange={handleChange}
                required
                style={inputStyle}
              >
                <option value="">
                  Select parcel type
                </option>

                <option value="Documents">
                  Documents
                </option>

                <option value="Clothes">
                  Clothes
                </option>

                <option value="Electronics">
                  Electronics
                </option>

                <option value="Food">
                  Food
                </option>

                <option value="Other">
                  Other
                </option>
              </select>

              {/* Weight */}

              <label style={labelStyle}>
                Parcel Weight
              </label>

              <input
                type="text"
                name="weight"
                value={form.weight}
                onChange={handleChange}
                placeholder="Example: 2 kg"
                required
                style={inputStyle}
              />

              {/* Price */}

              <label style={labelStyle}>
                Delivery Price
              </label>

              <div
                style={{
                  position: "relative",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    left: "14px",
                    top: "12px",
                    color: "#64748b",
                    fontWeight: "600",
                  }}
                >
                  ₹
                </span>

                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="Enter delivery price"
                  min="1"
                  required
                  style={{
                    ...inputStyle,
                    paddingLeft: "32px",
                  }}
                />
              </div>
            </div>

            {/* ERROR */}

            {error && (
              <div
                style={{
                  marginBottom: "18px",
                  padding: "13px",
                  backgroundColor: "#fee2e2",
                  color: "#991b1b",
                  borderRadius: "8px",
                  border:
                    "1px solid #fecaca",
                  fontSize: "14px",
                }}
              >
                ⚠️ {error}
              </div>
            )}

            {/* PAYMENT BUTTON */}

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "14px",
                background:
                  "linear-gradient(135deg, #2563eb, #4f46e5)",
                color: "white",
                border: "none",
                borderRadius: "9px",
                fontSize: "16px",
                cursor: "pointer",
                fontWeight: "700",
                boxShadow:
                  "0 5px 15px rgba(37, 99, 235, 0.25)",
              }}
            >
              💳 Continue to Payment →
            </button>

            {/* SECURITY TEXT */}

            <p
              style={{
                textAlign: "center",
                color: "#94a3b8",
                fontSize: "12px",
                marginTop: "15px",
                marginBottom: 0,
              }}
            >
              🔒 Your parcel details are securely
              processed.
            </p>
          </form>
        </div>

        {/* FOOTER */}

        <p
          style={{
            textAlign: "center",
            color: "#94a3b8",
            fontSize: "12px",
            marginTop: "20px",
          }}
        >
          Parcel Delivery System • Fast & Reliable
        </p>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const sectionTitleStyle = {
  color: "#1e293b",
  fontSize: "17px",
  marginBottom: "18px",
  paddingBottom: "10px",
  borderBottom: "1px solid #e5e7eb",
};

const labelStyle = {
  display: "block",
  fontWeight: "600",
  color: "#374151",
  marginBottom: "7px",
  fontSize: "14px",
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  marginBottom: "18px",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  boxSizing: "border-box",
  fontSize: "14px",
  outline: "none",
  backgroundColor: "#ffffff",
};

export default BookParcel;