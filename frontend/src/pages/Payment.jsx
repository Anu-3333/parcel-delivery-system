import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Payment() {
  const navigate = useNavigate();

  const [parcel, setParcel] = useState(null);

  const [paymentMethod, setPaymentMethod] =
    useState("UPI");

  const [upiApp, setUpiApp] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const savedParcel =
      localStorage.getItem("pendingParcel");

    if (!savedParcel) {
      navigate("/book-parcel");
      return;
    }

    try {
      setParcel(JSON.parse(savedParcel));
    } catch (error) {
      console.error(
        "Payment data error:",
        error
      );

      navigate("/book-parcel");
    }
  }, [navigate]);

  const handlePaymentMethod = (method) => {
    setPaymentMethod(method);
    setError("");

    if (method !== "UPI") {
      setUpiApp("");
    }
  };

  const handlePayment = async () => {
    if (!parcel) {
      return;
    }

    if (
      paymentMethod === "UPI" &&
      !upiApp
    ) {
      setError(
        "Please select Google Pay, PhonePe, or Paytm."
      );
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    const token =
      localStorage.getItem("token");

    if (!token) {
      setError(
        "Your login session has expired. Please login again."
      );
      setLoading(false);
      return;
    }

    try {
      // Demo payment processing
      await new Promise((resolve) =>
        setTimeout(resolve, 1500)
      );

      // Create parcel in live backend
      const response = await axios.post(
        "https://parcel-delivery-system-39oz.onrender.com/parcels/book",
        {
          receiver_name:
            parcel.receiver_name,

          receiver_phone:
            parcel.receiver_phone,

          pickup_address:
            parcel.pickup_address,

          delivery_address:
            parcel.delivery_address,

          parcel_type:
            parcel.parcel_type,

          weight:
            parcel.weight,

          price:
            Number(parcel.price),
        },
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
            "Content-Type":
              "application/json",
          },
        }
      );

      console.log(
        "Parcel booking response:",
        response.data
      );

      // Remove temporary parcel data
      localStorage.removeItem(
        "pendingParcel"
      );

      setMessage(
        `Payment successful! Parcel ID: ${response.data.parcel_id}`
      );

      setTimeout(() => {
        navigate("/my-parcels");
      }, 2000);

    } catch (error) {
      console.error(
        "Payment error:",
        error
      );

      if (error.response) {
        console.error(
          "Backend status:",
          error.response.status
        );

        console.error(
          "Backend response:",
          error.response.data
        );

        const backendError =
          error.response.data?.detail;

        if (Array.isArray(backendError)) {
          setError(
            backendError
              .map(
                (item) =>
                  item.msg ||
                  "Invalid parcel information"
              )
              .join(", ")
          );
        } else {
          setError(
            backendError ||
              `Payment failed. Server returned ${error.response.status}.`
          );
        }

      } else if (error.request) {
        console.error(
          "No response received from backend:",
          error.request
        );

        setError(
          "Unable to connect to the server. Please check your internet connection and try again."
        );

      } else {
        setError(
          error.message ||
            "Payment failed. Please try again."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  if (!parcel) {
    return (
      <div style={loadingPageStyle}>
        <div style={loadingCardStyle}>
          <div style={loadingIconStyle}>
            💳
          </div>

          <h3
            style={{
              margin: "0 0 8px",
              color: "#111827",
            }}
          >
            Loading Payment
          </h3>

          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            Preparing your payment details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>

        {/* Back Button */}
        <button
          onClick={() =>
            navigate("/book-parcel")
          }
          disabled={loading}
          style={backButtonStyle}
        >
          ← Back to Parcel Details
        </button>

        {/* Header */}
        <div style={headerCardStyle}>
          <div style={headerIconStyle}>
            💳
          </div>

          <h1 style={headerTitleStyle}>
            Secure Payment
          </h1>

          <p style={headerSubtitleStyle}>
            Review your parcel details and
            complete your payment.
          </p>

          <div style={secureBadgeStyle}>
            🔒 Secure Demo Payment
          </div>
        </div>

        {/* Order Summary */}
        <div style={cardStyle}>
          <div style={sectionHeaderStyle}>
            <div style={sectionIconStyle}>
              📦
            </div>

            <div>
              <h2 style={sectionTitleStyle}>
                Order Summary
              </h2>

              <p style={sectionSubtitleStyle}>
                Your parcel information
              </p>
            </div>
          </div>

          <div style={detailsContainerStyle}>

            <div style={detailRowStyle}>
              <span style={detailLabelStyle}>
                Receiver
              </span>

              <strong style={detailValueStyle}>
                {parcel.receiver_name}
              </strong>
            </div>

            <div style={detailRowStyle}>
              <span style={detailLabelStyle}>
                Receiver Phone
              </span>

              <strong style={detailValueStyle}>
                {parcel.receiver_phone}
              </strong>
            </div>

            <div style={detailRowStyle}>
              <span style={detailLabelStyle}>
                Pickup
              </span>

              <strong
                style={{
                  ...detailValueStyle,
                  maxWidth: "65%",
                  textAlign: "right",
                }}
              >
                {parcel.pickup_address}
              </strong>
            </div>

            <div style={detailRowStyle}>
              <span style={detailLabelStyle}>
                Delivery
              </span>

              <strong
                style={{
                  ...detailValueStyle,
                  maxWidth: "65%",
                  textAlign: "right",
                }}
              >
                {parcel.delivery_address}
              </strong>
            </div>

            <div style={detailRowStyle}>
              <span style={detailLabelStyle}>
                Parcel Type
              </span>

              <strong style={detailValueStyle}>
                {parcel.parcel_type}
              </strong>
            </div>

            <div
              style={{
                ...detailRowStyle,
                borderBottom: "none",
              }}
            >
              <span style={detailLabelStyle}>
                Weight
              </span>

              <strong style={detailValueStyle}>
                {parcel.weight}
              </strong>
            </div>

          </div>

          {/* Total Amount */}
          <div style={totalBoxStyle}>
            <div>
              <span
                style={{
                  display: "block",
                  color: "#64748b",
                  fontSize: "13px",
                  marginBottom: "4px",
                }}
              >
                Total Amount
              </span>

              <strong
                style={{
                  color: "#111827",
                  fontSize: "17px",
                }}
              >
                Delivery Charge
              </strong>
            </div>

            <strong style={totalAmountStyle}>
              ₹{parcel.price}
            </strong>
          </div>
        </div>

        {/* Payment Methods */}
        <div style={cardStyle}>

          <div style={sectionHeaderStyle}>
            <div style={sectionIconStyle}>
              💰
            </div>

            <div>
              <h2 style={sectionTitleStyle}>
                Payment Method
              </h2>

              <p style={sectionSubtitleStyle}>
                Choose your preferred payment option
              </p>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gap: "12px",
            }}
          >

            {/* UPI */}
            <div>
              <div
                onClick={() =>
                  handlePaymentMethod("UPI")
                }
                style={getPaymentOptionStyle(
                  paymentMethod === "UPI"
                )}
              >
                <div
                  style={radioCircleStyle(
                    paymentMethod === "UPI"
                  )}
                >
                  {paymentMethod === "UPI" && (
                    <div
                      style={radioInnerStyle}
                    />
                  )}
                </div>

                <div style={paymentIconStyle}>
                  📱
                </div>

                <div
                  style={{
                    flex: 1,
                  }}
                >
                  <div style={paymentTitleStyle}>
                    UPI
                  </div>

                  <div
                    style={
                      paymentDescriptionStyle
                    }
                  >
                    Pay using UPI apps
                  </div>
                </div>

                {paymentMethod === "UPI" && (
                  <span style={selectedStyle}>
                    ✓
                  </span>
                )}
              </div>

              {/* UPI APP MODULES */}
              {paymentMethod === "UPI" && (
                <div
                  style={{
                    marginTop: "12px",
                    padding: "15px",
                    backgroundColor: "#f8fafc",
                    borderRadius: "14px",
                    border:
                      "1px solid #e2e8f0",
                  }}
                >
                  <p
                    style={{
                      margin:
                        "0 0 12px",
                      color: "#475569",
                      fontSize: "13px",
                      fontWeight: "600",
                    }}
                  >
                    Select UPI App
                  </p>

                  <div
                    style={upiGridStyle}
                  >

                    {/* Google Pay */}
                    <div
                      onClick={() =>
                        setUpiApp("Google Pay")
                      }
                      style={getUpiAppStyle(
                        upiApp ===
                          "Google Pay"
                      )}
                    >
                      <div
                        style={{
                          ...upiLogoStyle,
                          backgroundColor:
                            "#f1f5f9",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "24px",
                            fontWeight: "800",
                            color: "#4285F4",
                          }}
                        >
                          G
                        </span>
                      </div>

                      <span
                        style={upiAppNameStyle}
                      >
                        Google Pay
                      </span>

                      {upiApp ===
                        "Google Pay" && (
                        <span
                          style={
                            upiSelectedStyle
                          }
                        >
                          ✓
                        </span>
                      )}
                    </div>

                    {/* PhonePe */}
                    <div
                      onClick={() =>
                        setUpiApp("PhonePe")
                      }
                      style={getUpiAppStyle(
                        upiApp ===
                          "PhonePe"
                      )}
                    >
                      <div
                        style={{
                          ...upiLogoStyle,
                          backgroundColor:
                            "#f3e8ff",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "22px",
                            fontWeight: "800",
                            color: "#6f2da8",
                          }}
                        >
                          P
                        </span>
                      </div>

                      <span
                        style={upiAppNameStyle}
                      >
                        PhonePe
                      </span>

                      {upiApp ===
                        "PhonePe" && (
                        <span
                          style={
                            upiSelectedStyle
                          }
                        >
                          ✓
                        </span>
                      )}
                    </div>

                    {/* Paytm */}
                    <div
                      onClick={() =>
                        setUpiApp("Paytm")
                      }
                      style={getUpiAppStyle(
                        upiApp === "Paytm"
                      )}
                    >
                      <div
                        style={{
                          ...upiLogoStyle,
                          backgroundColor:
                            "#e0f2fe",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "20px",
                            fontWeight: "800",
                            color: "#0284c7",
                          }}
                        >
                          P
                        </span>
                      </div>

                      <span style={upiAppNameStyle}>
                        Paytm
                      </span>

                      {upiApp ===
                        "Paytm" && (
                        <span
                          style={
                            upiSelectedStyle
                          }
                        >
                          ✓
                        </span>
                      )}
                    </div>

                  </div>
                </div>
              )}
            </div>

            {/* CARD */}
            <div
              onClick={() =>
                handlePaymentMethod("Card")
              }
              style={getPaymentOptionStyle(
                paymentMethod === "Card"
              )}
            >
              <div
                style={radioCircleStyle(
                  paymentMethod === "Card"
                )}
              >
                {paymentMethod === "Card" && (
                  <div
                    style={radioInnerStyle}
                  />
                )}
              </div>

              <div style={paymentIconStyle}>
                💳
              </div>

              <div
                style={{
                  flex: 1,
                }}
              >
                <div style={paymentTitleStyle}>
                  Debit / Credit Card
                </div>

                <div
                  style={
                    paymentDescriptionStyle
                  }
                >
                  Visa • Mastercard • RuPay
                </div>
              </div>

              {paymentMethod === "Card" && (
                <span style={selectedStyle}>
                  ✓
                </span>
              )}
            </div>

            {/* NET BANKING */}
            <div
              onClick={() =>
                handlePaymentMethod(
                  "Net Banking"
                )
              }
              style={getPaymentOptionStyle(
                paymentMethod ===
                  "Net Banking"
              )}
            >
              <div
                style={radioCircleStyle(
                  paymentMethod ===
                    "Net Banking"
                )}
              >
                {paymentMethod ===
                  "Net Banking" && (
                  <div
                    style={radioInnerStyle}
                  />
                )}
              </div>

              <div style={paymentIconStyle}>
                🏦
              </div>

              <div
                style={{
                  flex: 1,
                }}
              >
                <div style={paymentTitleStyle}>
                  Net Banking
                </div>

                <div
                  style={
                    paymentDescriptionStyle
                  }
                >
                  Pay using your bank account
                </div>
              </div>

              {paymentMethod ===
                "Net Banking" && (
                <span style={selectedStyle}>
                  ✓
                </span>
              )}
            </div>

          </div>
        </div>

        {/* Selected Payment Info */}
        {paymentMethod === "UPI" &&
          upiApp && (
            <div
              style={{
                marginBottom: "18px",
                padding: "12px 15px",
                backgroundColor: "#eff6ff",
                border:
                  "1px solid #bfdbfe",
                borderRadius: "10px",
                color: "#1d4ed8",
                fontSize: "13px",
                textAlign: "center",
              }}
            >
              ✓ Selected payment app:{" "}
              <strong>{upiApp}</strong>
            </div>
          )}

        {/* Error */}
        {error && (
          <div style={errorStyle}>
            <div
              style={{
                fontSize: "22px",
              }}
            >
              ⚠️
            </div>

            <div>
              <strong
                style={{
                  display: "block",
                  marginBottom: "3px",
                }}
              >
                Payment Failed
              </strong>

              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Success */}
        {message && (
          <div style={successStyle}>
            <div style={successIconStyle}>
              ✓
            </div>

            <div>
              <strong
                style={{
                  display: "block",
                  marginBottom: "4px",
                  fontSize: "15px",
                }}
              >
                Payment Successful!
              </strong>

              <span
                style={{
                  fontSize: "13px",
                }}
              >
                {message}
              </span>

              <span
                style={{
                  display: "block",
                  fontSize: "12px",
                  marginTop: "5px",
                  color: "#15803d",
                }}
              >
                Redirecting to My Parcels...
              </span>
            </div>
          </div>
        )}

        {/* Pay Button */}
        <button
          onClick={handlePayment}
          disabled={
            loading || !!message
          }
          style={{
            ...payButtonStyle,
            background:
              loading || message
                ? "#94a3b8"
                : "linear-gradient(135deg, #16a34a, #059669)",
            cursor:
              loading || message
                ? "not-allowed"
                : "pointer",
          }}
        >
          {loading ? (
            <>
              ⏳ Processing Payment...
            </>
          ) : (
            <>
              💳 Pay ₹{parcel.price}
            </>
          )}
        </button>

        {/* Security Note */}
        <div style={securityNoteStyle}>
          <span
            style={{
              fontSize: "18px",
            }}
          >
            🔐
          </span>

          <div>
            <strong
              style={{
                display: "block",
                color: "#475569",
                fontSize: "13px",
                marginBottom: "3px",
              }}
            >
              Safe & Secure
            </strong>

            <span
              style={{
                color: "#94a3b8",
                fontSize: "12px",
              }}
            >
              Your payment details are protected.
              This is a demo payment system.
            </span>
          </div>
        </div>

        <p style={footerStyle}>
          Parcel Delivery System • Fast & Reliable
        </p>

      </div>
    </div>
  );
}

/* ============================= */
/* PAGE STYLES */
/* ============================= */

const pageStyle = {
  minHeight: "100vh",
  background:
    "linear-gradient(135deg, #f8fbff 0%, #eef4ff 100%)",
  padding: "40px 20px",
  fontFamily:
    "Arial, Helvetica, sans-serif",
};

const containerStyle = {
  maxWidth: "760px",
  margin: "auto",
};

const backButtonStyle = {
  background: "transparent",
  border: "none",
  color: "#2563eb",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer",
  padding: "5px 0",
  marginBottom: "18px",
};

const headerCardStyle = {
  backgroundColor: "white",
  padding: "30px 25px",
  borderRadius: "20px",
  boxShadow:
    "0 8px 30px rgba(15, 23, 42, 0.10)",
  border: "1px solid #e5e7eb",
  textAlign: "center",
  marginBottom: "20px",
};

const headerIconStyle = {
  width: "64px",
  height: "64px",
  margin: "0 auto 14px",
  borderRadius: "18px",
  backgroundColor: "#dbeafe",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "31px",
};

const headerTitleStyle = {
  margin: "0 0 8px",
  color: "#111827",
  fontSize: "28px",
};

const headerSubtitleStyle = {
  margin: "0 0 16px",
  color: "#64748b",
  fontSize: "14px",
};

const secureBadgeStyle = {
  display: "inline-block",
  padding: "7px 13px",
  borderRadius: "20px",
  backgroundColor: "#ecfdf5",
  color: "#15803d",
  fontSize: "12px",
  fontWeight: "600",
};

const cardStyle = {
  backgroundColor: "white",
  padding: "28px",
  borderRadius: "18px",
  boxShadow:
    "0 8px 30px rgba(15, 23, 42, 0.08)",
  border: "1px solid #e5e7eb",
  marginBottom: "20px",
};

const sectionHeaderStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginBottom: "22px",
};

const sectionIconStyle = {
  width: "42px",
  height: "42px",
  borderRadius: "12px",
  backgroundColor: "#eff6ff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "20px",
};

const sectionTitleStyle = {
  margin: 0,
  color: "#1e293b",
  fontSize: "18px",
};

const sectionSubtitleStyle = {
  margin: "4px 0 0",
  color: "#94a3b8",
  fontSize: "12px",
};

const detailsContainerStyle = {
  border: "1px solid #e5e7eb",
  borderRadius: "12px",
  padding: "5px 15px",
};

const detailRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "20px",
  padding: "12px 0",
  borderBottom:
    "1px solid #f1f5f9",
};

const detailLabelStyle = {
  color: "#64748b",
  fontSize: "13px",
};

const detailValueStyle = {
  color: "#1e293b",
  fontSize: "13px",
  textAlign: "right",
};

const totalBoxStyle = {
  marginTop: "20px",
  padding: "18px",
  borderRadius: "12px",
  background:
    "linear-gradient(135deg, #eff6ff, #eef2ff)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "15px",
};

const totalAmountStyle = {
  fontSize: "25px",
  color: "#2563eb",
};

/* ============================= */
/* PAYMENT OPTION */
/* ============================= */

const getPaymentOptionStyle = (
  selected
) => ({
  display: "flex",
  alignItems: "center",
  gap: "12px",
  border: selected
    ? "2px solid #2563eb"
    : "1px solid #d1d5db",
  borderRadius: "12px",
  padding: "15px",
  cursor: "pointer",
  backgroundColor: selected
    ? "#eff6ff"
    : "white",
  transition: "0.2s",
});

const radioCircleStyle = (
  selected
) => ({
  width: "18px",
  height: "18px",
  borderRadius: "50%",
  border: selected
    ? "2px solid #2563eb"
    : "2px solid #94a3b8",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
});

const radioInnerStyle = {
  width: "9px",
  height: "9px",
  borderRadius: "50%",
  backgroundColor: "#2563eb",
};

const paymentIconStyle = {
  width: "38px",
  height: "38px",
  borderRadius: "10px",
  backgroundColor: "#f8fafc",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "20px",
};

const paymentTitleStyle = {
  color: "#1e293b",
  fontWeight: "700",
  fontSize: "14px",
};

const paymentDescriptionStyle = {
  color: "#94a3b8",
  fontSize: "12px",
  marginTop: "4px",
};

const selectedStyle = {
  width: "24px",
  height: "24px",
  borderRadius: "50%",
  backgroundColor: "#2563eb",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "13px",
  fontWeight: "bold",
};

/* ============================= */
/* UPI APPS */
/* ============================= */

const upiGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(3, 1fr)",
  gap: "10px",
};

const getUpiAppStyle = (
  selected
) => ({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "9px",
  minHeight: "115px",
  padding: "12px",
  border: selected
    ? "2px solid #2563eb"
    : "1px solid #dbe3ee",
  borderRadius: "12px",
  backgroundColor: selected
    ? "#eff6ff"
    : "white",
  cursor: "pointer",
  transition: "0.2s",
  boxSizing: "border-box",
});

const upiLogoStyle = {
  width: "48px",
  height: "48px",
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const upiAppNameStyle = {
  color: "#1e293b",
  fontSize: "13px",
  fontWeight: "700",
};

const upiSelectedStyle = {
  position: "absolute",
  top: "7px",
  right: "7px",
  width: "20px",
  height: "20px",
  borderRadius: "50%",
  backgroundColor: "#2563eb",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "11px",
  fontWeight: "bold",
};

/* ============================= */
/* ERROR / SUCCESS */
/* ============================= */

const errorStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "14px",
  marginBottom: "18px",
  backgroundColor: "#fef2f2",
  color: "#991b1b",
  border: "1px solid #fecaca",
  borderRadius: "10px",
  fontSize: "13px",
};

const successStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "15px",
  marginBottom: "18px",
  backgroundColor: "#f0fdf4",
  color: "#166534",
  border: "1px solid #bbf7d0",
  borderRadius: "10px",
};

const successIconStyle = {
  width: "36px",
  height: "36px",
  borderRadius: "50%",
  backgroundColor: "#22c55e",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "bold",
  fontSize: "18px",
};

/* ============================= */
/* PAY BUTTON */
/* ============================= */

const payButtonStyle = {
  width: "100%",
  padding: "15px",
  color: "white",
  border: "none",
  borderRadius: "10px",
  fontSize: "17px",
  fontWeight: "700",
  boxShadow:
    "0 5px 18px rgba(22, 163, 74, 0.22)",
  cursor: "pointer",
};

/* ============================= */
/* SECURITY */
/* ============================= */

const securityNoteStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "10px",
  marginTop: "18px",
  padding: "13px",
  backgroundColor:
    "rgba(255,255,255,0.7)",
  borderRadius: "10px",
};

const footerStyle = {
  textAlign: "center",
  color: "#94a3b8",
  fontSize: "12px",
  marginTop: "20px",
};

/* ============================= */
/* LOADING */
/* ============================= */

const loadingPageStyle = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background:
    "linear-gradient(135deg, #f8fbff 0%, #eef4ff 100%)",
  fontFamily:
    "Arial, Helvetica, sans-serif",
};

const loadingCardStyle = {
  backgroundColor: "white",
  padding: "35px",
  borderRadius: "18px",
  textAlign: "center",
  boxShadow:
    "0 8px 30px rgba(15, 23, 42, 0.10)",
};

const loadingIconStyle = {
  width: "60px",
  height: "60px",
  margin: "0 auto 15px",
  borderRadius: "16px",
  backgroundColor: "#dbeafe",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "28px",
};

export default Payment;