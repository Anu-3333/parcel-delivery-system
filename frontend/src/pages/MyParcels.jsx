import { useEffect, useState } from "react";
import axios from "axios";

import MapView from "../MapView";

function MyParcels() {
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedParcelId, setSelectedParcelId] = useState(null);
  const [captainLocations, setCaptainLocations] = useState({});

  const trackingSteps = [
    "Booked",
    "Captain Assigned",
    "Picked Up",
    "In Transit",
    "Out for Delivery",
    "Delivered",
  ];

  // =====================================================
  // GET MY PARCELS
  // =====================================================

  useEffect(() => {
    const getMyParcels = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login again.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/parcels/my-parcels",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setParcels(response.data);

        if (response.data.length > 0) {
          setSelectedParcelId(response.data[0].id);
        }
      } catch (error) {
        console.error("My Parcels Error:", error);

        setError(
          error.response?.data?.detail ||
            "Failed to load parcels."
        );
      } finally {
        setLoading(false);
      }
    };

    getMyParcels();
  }, []);

  // =====================================================
  // SELECTED PARCEL
  // =====================================================

  const selectedParcel = parcels.find(
    (parcel) => parcel.id === selectedParcelId
  );

  // =====================================================
  // WEBSOCKET LIVE TRACKING
  // =====================================================

  useEffect(() => {
    if (parcels.length === 0) {
      return;
    }

    const sockets = [];

    parcels.forEach((parcel) => {
      const socket = new WebSocket(
        `ws://127.0.0.1:8000/ws/tracking/${parcel.id}`
      );

      socket.onopen = () => {
        console.log(
          `WebSocket connected for Parcel #${parcel.id}`
        );
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Captain live location
          if (data.type === "captain_location") {
            setCaptainLocations((currentLocations) => ({
              ...currentLocations,
              [data.parcel_id]: {
                latitude: Number(data.latitude),
                longitude: Number(data.longitude),
                captain_id: data.captain_id,
                updatedAt: Date.now(),
              },
            }));

            return;
          }

          // Parcel status
          if (data.parcel_id && data.status) {
            setParcels((currentParcels) =>
              currentParcels.map((item) =>
                item.id === data.parcel_id
                  ? {
                      ...item,
                      status: data.status,
                    }
                  : item
              )
            );
          }
        } catch (error) {
          console.error(
            "WebSocket message error:",
            error
          );
        }
      };

      socket.onerror = (error) => {
        console.error(
          `WebSocket error for Parcel #${parcel.id}:`,
          error
        );
      };

      socket.onclose = () => {
        console.log(
          `WebSocket disconnected for Parcel #${parcel.id}`
        );
      };

      sockets.push(socket);
    });

    return () => {
      sockets.forEach((socket) => {
        if (
          socket.readyState === WebSocket.OPEN ||
          socket.readyState === WebSocket.CONNECTING
        ) {
          socket.close();
        }
      });
    };
  }, [parcels.length]);

  // =====================================================
  // HELPERS
  // =====================================================

  const getCurrentStep = (status) => {
    const index = trackingSteps.indexOf(status);

    return index !== -1 ? index : 0;
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Delivered":
        return {
          backgroundColor: "#dcfce7",
          color: "#15803d",
        };

      case "Out for Delivery":
        return {
          backgroundColor: "#fef3c7",
          color: "#b45309",
        };

      case "In Transit":
        return {
          backgroundColor: "#dbeafe",
          color: "#1d4ed8",
        };

      case "Picked Up":
        return {
          backgroundColor: "#ede9fe",
          color: "#6d28d9",
        };

      case "Captain Assigned":
        return {
          backgroundColor: "#e0f2fe",
          color: "#0369a1",
        };

      default:
        return {
          backgroundColor: "#f1f5f9",
          color: "#475569",
        };
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Delivered":
        return "✅";

      case "Out for Delivery":
        return "🚚";

      case "In Transit":
        return "🛣️";

      case "Picked Up":
        return "📦";

      case "Captain Assigned":
        return "👨‍✈️";

      default:
        return "📝";
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div style={loadingPageStyle}>
        <div style={loadingCardStyle}>
          <div style={loadingIconStyle}>📦</div>

          <h2 style={loadingTitleStyle}>
            Loading Your Parcels
          </h2>

          <p style={loadingTextStyle}>
            Please wait while we fetch your parcel
            details...
          </p>

          <div style={loadingLineStyle}></div>
        </div>
      </div>
    );
  }

  // =====================================================
  // MAIN PAGE
  // =====================================================

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>

        {/* HEADER */}

        <div style={pageHeaderStyle}>
          <div>
            <div style={smallLabelStyle}>
              DELIVERY MANAGEMENT
            </div>

            <h1 style={pageTitleStyle}>
              📦 My Parcels
            </h1>

            <p style={pageSubtitleStyle}>
              View and track all your deliveries in
              real time.
            </p>
          </div>

          <div style={parcelCountStyle}>
            <span style={countLabelStyle}>
              TOTAL PARCELS
            </span>

            <strong style={countNumberStyle}>
              {parcels.length}
            </strong>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div style={errorStyle}>
            <div style={errorIconStyle}>⚠️</div>

            <div>
              <strong style={errorTitleStyle}>
                Unable to load parcels
              </strong>

              <div>{error}</div>
            </div>
          </div>
        )}

        {/* EMPTY */}

        {!error && parcels.length === 0 && (
          <div style={emptyCardStyle}>
            <div style={emptyIconStyle}>📦</div>

            <h2 style={emptyTitleStyle}>
              No Parcels Yet
            </h2>

            <p style={emptyTextStyle}>
              You haven't booked any parcels yet.
            </p>

            <button
              onClick={() =>
                (window.location.href =
                  "/book-parcel")
              }
              style={primaryButtonStyle}
            >
              📦 Book Your First Parcel
            </button>
          </div>
        )}

        {/* LIVE MAP */}

        {parcels.length > 0 && selectedParcel && (
          <div style={mapCardStyle}>

            <div style={sectionHeaderStyle}>
              <div style={sectionIconStyle}>
                🗺️
              </div>

              <div>
                <h2 style={sectionTitleStyle}>
                  Live Delivery Tracking
                </h2>

                <p style={sectionSubtitleStyle}>
                  Tracking Parcel #{selectedParcel.id}
                </p>
              </div>

              <div
                style={{
                  marginLeft: "auto",
                  ...getStatusStyle(
                    selectedParcel.status
                  ),
                  padding: "8px 13px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: "700",
                  whiteSpace: "nowrap",
                }}
              >
                {getStatusIcon(selectedParcel.status)}{" "}
                {selectedParcel.status}
              </div>
            </div>

            {/* ROUTE */}

            <div style={routeBoxStyle}>
              <div style={routePointStyle}>
                <div style={routeDotPickupStyle}>
                  📍
                </div>

                <div>
                  <span style={routeLabelStyle}>
                    PICKUP LOCATION
                  </span>

                  <strong style={routeTextStyle}>
                    {selectedParcel.pickup_address}
                  </strong>
                </div>
              </div>

              <div style={routeArrowStyle}>
                →
              </div>

              <div style={routePointStyle}>
                <div style={routeDotDeliveryStyle}>
                  🏁
                </div>

                <div>
                  <span style={routeLabelStyle}>
                    DELIVERY LOCATION
                  </span>

                  <strong style={routeTextStyle}>
                    {selectedParcel.delivery_address}
                  </strong>
                </div>
              </div>
            </div>

            {/* CAPTAIN LOCATION */}

            {captainLocations[selectedParcel.id] ? (
              <div style={liveLocationStyle}>
                <div style={truckCircleStyle}>
                  🚚
                </div>

                <div style={{ flex: 1 }}>
                  <strong style={liveTitleStyle}>
                    Captain Live Location Active
                  </strong>

                  <span style={liveSubtitleStyle}>
                    Your captain is currently sharing
                    live location.
                  </span>
                </div>

                <div style={coordinatesStyle}>
                  <div>
                    LAT{" "}
                    {Number(
                      captainLocations[
                        selectedParcel.id
                      ].latitude
                    ).toFixed(5)}
                  </div>

                  <div>
                    LNG{" "}
                    {Number(
                      captainLocations[
                        selectedParcel.id
                      ].longitude
                    ).toFixed(5)}
                  </div>
                </div>
              </div>
            ) : (
              <div style={waitingLocationStyle}>
                <span style={{ fontSize: "18px" }}>
                  📍
                </span>

                <span>
                  Waiting for captain live location...
                </span>
              </div>
            )}

            {/* MAP */}

            <div style={mapWrapperStyle}>
              <MapView
                pickupAddress={
                  selectedParcel.pickup_address
                }
                deliveryAddress={
                  selectedParcel.delivery_address
                }
                captainLocation={
                  captainLocations[selectedParcel.id]
                }
              />
            </div>
          </div>
        )}

        {/* PARCEL LIST */}

        {parcels.length > 0 && (
          <div style={parcelSectionStyle}>

            <div style={listHeaderStyle}>
              <div>
                <h2 style={listTitleStyle}>
                  Your Parcels
                </h2>

                <p style={listSubtitleStyle}>
                  Select a parcel to view its live
                  location and delivery progress.
                </p>
              </div>

              <div style={liveBadgeStyle}>
                <span>🟢</span>
                Live Tracking
              </div>
            </div>

            <div style={parcelGridStyle}>
              {parcels.map((parcel) => {
                const currentStep =
                  getCurrentStep(parcel.status);

                const isSelected =
                  selectedParcelId === parcel.id;

                const hasCaptainLocation =
                  captainLocations[parcel.id];

                return (
                  <div
                    key={parcel.id}
                    style={{
                      ...parcelCardStyle,
                      border: isSelected
                        ? "2px solid #2563eb"
                        : "1px solid #e2e8f0",
                      boxShadow: isSelected
                        ? "0 12px 30px rgba(37,99,235,0.14)"
                        : "0 6px 22px rgba(15,23,42,0.06)",
                      transform: isSelected
                        ? "translateY(-2px)"
                        : "none",
                    }}
                  >

                    {/* CARD HEADER */}

                    <div style={parcelHeaderStyle}>
                      <div>
                        <div style={parcelIdLabelStyle}>
                          PARCEL ID
                        </div>

                        <h3 style={parcelIdStyle}>
                          📦 #{parcel.id}
                        </h3>
                      </div>

                      <span
                        style={{
                          ...getStatusStyle(
                            parcel.status
                          ),
                          padding: "7px 10px",
                          borderRadius: "20px",
                          fontSize: "11px",
                          fontWeight: "700",
                        }}
                      >
                        {getStatusIcon(parcel.status)}{" "}
                        {parcel.status}
                      </span>
                    </div>

                    {/* RECEIVER */}

                    <div style={infoBlockStyle}>
                      <span style={infoLabelStyle}>
                        👤 Receiver
                      </span>

                      <strong style={infoValueStyle}>
                        {parcel.receiver_name}
                      </strong>
                    </div>

                    {/* PHONE */}

                    <div style={infoBlockStyle}>
                      <span style={infoLabelStyle}>
                        📞 Phone
                      </span>

                      <strong style={infoValueStyle}>
                        {parcel.receiver_phone}
                      </strong>
                    </div>

                    {/* PICKUP */}

                    <div style={infoBlockStyle}>
                      <span style={infoLabelStyle}>
                        📍 Pickup
                      </span>

                      <strong style={addressValueStyle}>
                        {parcel.pickup_address}
                      </strong>
                    </div>

                    {/* DELIVERY */}

                    <div style={infoBlockStyle}>
                      <span style={infoLabelStyle}>
                        🏁 Delivery
                      </span>

                      <strong style={addressValueStyle}>
                        {parcel.delivery_address}
                      </strong>
                    </div>

                    {/* DETAILS */}

                    <div style={detailsGridStyle}>
                      <div style={miniDetailStyle}>
                        <span>📦 Type</span>

                        <strong>
                          {parcel.parcel_type}
                        </strong>
                      </div>

                      <div style={miniDetailStyle}>
                        <span>⚖️ Weight</span>

                        <strong>
                          {parcel.weight}
                        </strong>
                      </div>

                      <div style={miniDetailStyle}>
                        <span>💰 Price</span>

                        <strong
                          style={{
                            color: "#2563eb",
                          }}
                        >
                          ₹{parcel.price}
                        </strong>
                      </div>
                    </div>

                    {/* CAPTAIN LIVE */}

                    {hasCaptainLocation && (
                      <div style={captainLiveMiniStyle}>
                        <span>🟢</span>
                        Captain is Live
                      </div>
                    )}

                    {/* TRACK BUTTON */}

                    <button
                      onClick={() =>
                        setSelectedParcelId(
                          parcel.id
                        )
                      }
                      style={{
                        ...trackButtonStyle,
                        background: isSelected
                          ? "linear-gradient(135deg,#1d4ed8,#2563eb)"
                          : "linear-gradient(135deg,#2563eb,#4f46e5)",
                      }}
                    >
                      🗺️{" "}
                      {isSelected
                        ? "Currently Tracking"
                        : "Track This Parcel"}
                    </button>

                    {/* TIMELINE */}

                    <div style={timelineStyle}>
                      <h4 style={timelineTitleStyle}>
                        🚚 Delivery Timeline
                      </h4>

                      {trackingSteps.map(
                        (step, index) => {
                          const completed =
                            index <= currentStep;

                          const isCurrent =
                            index === currentStep;

                          return (
                            <div
                              key={step}
                              style={{
                                display: "flex",
                                alignItems:
                                  "flex-start",
                                position: "relative",
                                minHeight:
                                  index ===
                                  trackingSteps.length -
                                    1
                                    ? "35px"
                                    : "48px",
                              }}
                            >
                              {/* CIRCLE */}

                              <div
                                style={{
                                  width: "26px",
                                  height: "26px",
                                  minWidth: "26px",
                                  borderRadius: "50%",
                                  backgroundColor:
                                    completed
                                      ? "#2563eb"
                                      : "#e2e8f0",
                                  color: completed
                                    ? "white"
                                    : "#94a3b8",
                                  display: "flex",
                                  alignItems:
                                    "center",
                                  justifyContent:
                                    "center",
                                  fontSize: "11px",
                                  fontWeight: "700",
                                  zIndex: 2,
                                  boxShadow:
                                    isCurrent
                                      ? "0 0 0 4px #dbeafe"
                                      : "none",
                                }}
                              >
                                {completed
                                  ? "✓"
                                  : index + 1}
                              </div>

                              {/* LINE */}

                              {index <
                                trackingSteps.length -
                                  1 && (
                                <div
                                  style={{
                                    position:
                                      "absolute",
                                    left: "12px",
                                    top: "26px",
                                    width: "2px",
                                    height: "22px",
                                    backgroundColor:
                                      index <
                                      currentStep
                                        ? "#2563eb"
                                        : "#e2e8f0",
                                  }}
                                />
                              )}

                              {/* TEXT */}

                              <div
                                style={{
                                  marginLeft: "12px",
                                  marginTop: "3px",
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: "12px",
                                    fontWeight:
                                      isCurrent
                                        ? "700"
                                        : "500",
                                    color: completed
                                      ? "#334155"
                                      : "#94a3b8",
                                  }}
                                >
                                  {step}
                                </div>

                                {isCurrent && (
                                  <div
                                    style={{
                                      fontSize: "10px",
                                      color: "#2563eb",
                                      marginTop: "3px",
                                      fontWeight: "700",
                                    }}
                                  >
                                    ● Current Status
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>

                    {/* FOOTER */}

                    <div style={liveTrackingFooterStyle}>
                      <span>🟢</span>
                      Live Tracking Active
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* =====================================================
   STYLES
===================================================== */

const pageStyle = {
  minHeight: "100vh",
  background:
    "linear-gradient(135deg,#f8fbff 0%,#eef4ff 100%)",
  padding: "38px 20px 60px",
  fontFamily:
    "Arial, Helvetica, sans-serif",
};

const containerStyle = {
  maxWidth: "1180px",
  margin: "auto",
};

const pageHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "20px",
  marginBottom: "28px",
};

const smallLabelStyle = {
  color: "#2563eb",
  fontSize: "11px",
  fontWeight: "700",
  letterSpacing: "1.5px",
  marginBottom: "7px",
};

const pageTitleStyle = {
  margin: 0,
  color: "#0f172a",
  fontSize: "31px",
  fontWeight: "800",
};

const pageSubtitleStyle = {
  margin: "8px 0 0",
  color: "#64748b",
  fontSize: "14px",
};

const parcelCountStyle = {
  minWidth: "110px",
  padding: "15px 20px",
  backgroundColor: "white",
  borderRadius: "15px",
  border: "1px solid #e2e8f0",
  boxShadow:
    "0 7px 25px rgba(15,23,42,0.06)",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};

const countLabelStyle = {
  fontSize: "10px",
  color: "#94a3b8",
  fontWeight: "700",
  letterSpacing: "0.7px",
};

const countNumberStyle = {
  fontSize: "25px",
  color: "#2563eb",
  marginTop: "3px",
};

const mapCardStyle = {
  backgroundColor: "white",
  padding: "25px",
  borderRadius: "19px",
  border: "1px solid #e2e8f0",
  boxShadow:
    "0 10px 35px rgba(15,23,42,0.08)",
};

const sectionHeaderStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginBottom: "20px",
};

const sectionIconStyle = {
  width: "46px",
  height: "46px",
  borderRadius: "13px",
  backgroundColor: "#eff6ff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "22px",
};

const sectionTitleStyle = {
  margin: 0,
  color: "#1e293b",
  fontSize: "19px",
};

const sectionSubtitleStyle = {
  margin: "4px 0 0",
  color: "#94a3b8",
  fontSize: "12px",
};

const routeBoxStyle = {
  display: "grid",
  gridTemplateColumns: "1fr auto 1fr",
  alignItems: "center",
  gap: "16px",
  padding: "16px",
  backgroundColor: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "13px",
};

const routePointStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: "10px",
};

const routeDotPickupStyle = {
  width: "34px",
  height: "34px",
  minWidth: "34px",
  borderRadius: "10px",
  backgroundColor: "#dbeafe",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const routeDotDeliveryStyle = {
  width: "34px",
  height: "34px",
  minWidth: "34px",
  borderRadius: "10px",
  backgroundColor: "#dcfce7",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const routeLabelStyle = {
  display: "block",
  color: "#94a3b8",
  fontSize: "10px",
  fontWeight: "700",
  marginBottom: "5px",
};

const routeTextStyle = {
  display: "block",
  color: "#334155",
  fontSize: "13px",
  lineHeight: "1.5",
};

const routeArrowStyle = {
  width: "36px",
  height: "36px",
  borderRadius: "50%",
  backgroundColor: "#dbeafe",
  color: "#2563eb",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "20px",
  fontWeight: "700",
};

const liveLocationStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginTop: "15px",
  padding: "13px 15px",
  backgroundColor: "#ecfdf5",
  border: "1px solid #bbf7d0",
  borderRadius: "12px",
};

const truckCircleStyle = {
  width: "42px",
  height: "42px",
  minWidth: "42px",
  borderRadius: "12px",
  backgroundColor: "#dcfce7",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "21px",
};

const liveTitleStyle = {
  display: "block",
  color: "#15803d",
  fontSize: "13px",
  marginBottom: "3px",
};

const liveSubtitleStyle = {
  color: "#166534",
  fontSize: "11px",
};

const coordinatesStyle = {
  padding: "7px 10px",
  backgroundColor: "white",
  borderRadius: "8px",
  color: "#166534",
  fontSize: "10px",
  lineHeight: "1.7",
};

const waitingLocationStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  marginTop: "15px",
  padding: "12px",
  backgroundColor: "#fefce8",
  border: "1px solid #fde68a",
  borderRadius: "10px",
  color: "#a16207",
  fontSize: "12px",
};

const mapWrapperStyle = {
  marginTop: "18px",
  borderRadius: "14px",
  overflow: "hidden",
  border: "1px solid #e2e8f0",
};

const parcelSectionStyle = {
  marginTop: "30px",
};

const listHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  gap: "15px",
  marginBottom: "17px",
};

const listTitleStyle = {
  margin: 0,
  color: "#1e293b",
  fontSize: "21px",
};

const listSubtitleStyle = {
  margin: "5px 0 0",
  color: "#94a3b8",
  fontSize: "13px",
};

const liveBadgeStyle = {
  padding: "8px 12px",
  borderRadius: "20px",
  backgroundColor: "#ecfdf5",
  color: "#15803d",
  border: "1px solid #bbf7d0",
  fontSize: "11px",
  fontWeight: "700",
};

const parcelGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(340px,1fr))",
  gap: "20px",
};

const parcelCardStyle = {
  backgroundColor: "white",
  padding: "23px",
  borderRadius: "17px",
  boxSizing: "border-box",
  transition: "0.2s",
};

const parcelHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "10px",
  marginBottom: "19px",
};

const parcelIdLabelStyle = {
  color: "#94a3b8",
  fontSize: "10px",
  fontWeight: "700",
  letterSpacing: "0.7px",
  marginBottom: "4px",
};

const parcelIdStyle = {
  margin: 0,
  color: "#111827",
  fontSize: "18px",
};

const infoBlockStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "15px",
  padding: "10px 0",
  borderBottom: "1px solid #f1f5f9",
};

const infoLabelStyle = {
  color: "#94a3b8",
  fontSize: "12px",
  flexShrink: 0,
};

const infoValueStyle = {
  color: "#334155",
  fontSize: "12px",
  textAlign: "right",
};

const addressValueStyle = {
  color: "#334155",
  fontSize: "12px",
  textAlign: "right",
  maxWidth: "65%",
  lineHeight: "1.5",
};

const detailsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3,1fr)",
  gap: "8px",
  marginTop: "15px",
};

const miniDetailStyle = {
  padding: "10px 8px",
  backgroundColor: "#f8fafc",
  borderRadius: "8px",
  textAlign: "center",
  fontSize: "10px",
  color: "#94a3b8",
};

const captainLiveMiniStyle = {
  marginTop: "12px",
  padding: "9px",
  backgroundColor: "#ecfdf5",
  borderRadius: "8px",
  color: "#15803d",
  textAlign: "center",
  fontSize: "12px",
  fontWeight: "700",
};

const trackButtonStyle = {
  width: "100%",
  padding: "12px",
  marginTop: "14px",
  color: "white",
  border: "none",
  borderRadius: "9px",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: "700",
};

const timelineStyle = {
  marginTop: "24px",
  paddingTop: "20px",
  borderTop: "1px solid #f1f5f9",
};

const timelineTitleStyle = {
  margin: "0 0 18px",
  color: "#1e293b",
  fontSize: "15px",
};

const liveTrackingFooterStyle = {
  marginTop: "20px",
  padding: "10px",
  backgroundColor: "#ecfdf5",
  borderRadius: "8px",
  color: "#15803d",
  fontSize: "11px",
  fontWeight: "700",
  textAlign: "center",
};

const errorStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "14px",
  backgroundColor: "#fef2f2",
  color: "#991b1b",
  border: "1px solid #fecaca",
  borderRadius: "11px",
  marginBottom: "20px",
  fontSize: "13px",
};

const errorIconStyle = {
  fontSize: "22px",
};

const errorTitleStyle = {
  display: "block",
  marginBottom: "3px",
};

const emptyCardStyle = {
  backgroundColor: "white",
  padding: "50px 25px",
  borderRadius: "19px",
  textAlign: "center",
  boxShadow:
    "0 10px 35px rgba(15,23,42,0.07)",
  border: "1px solid #e2e8f0",
};

const emptyIconStyle = {
  width: "72px",
  height: "72px",
  margin: "0 auto 18px",
  borderRadius: "20px",
  backgroundColor: "#eff6ff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "32px",
};

const emptyTitleStyle = {
  margin: "0 0 8px",
  color: "#1e293b",
};

const emptyTextStyle = {
  margin: "0 0 20px",
  color: "#64748b",
};

const primaryButtonStyle = {
  padding: "12px 20px",
  background:
    "linear-gradient(135deg,#2563eb,#4f46e5)",
  color: "white",
  border: "none",
  borderRadius: "9px",
  cursor: "pointer",
  fontWeight: "700",
};

const loadingPageStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background:
    "linear-gradient(135deg,#f8fbff 0%,#eef4ff 100%)",
  fontFamily:
    "Arial, Helvetica, sans-serif",
};

const loadingCardStyle = {
  backgroundColor: "white",
  padding: "38px",
  borderRadius: "19px",
  textAlign: "center",
  boxShadow:
    "0 10px 35px rgba(15,23,42,0.10)",
  border: "1px solid #e2e8f0",
};

const loadingIconStyle = {
  width: "65px",
  height: "65px",
  margin: "0 auto 15px",
  borderRadius: "18px",
  backgroundColor: "#dbeafe",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "30px",
};

const loadingTitleStyle = {
  margin: "0 0 8px",
  color: "#111827",
};

const loadingTextStyle = {
  margin: 0,
  color: "#64748b",
  fontSize: "14px",
};

const loadingLineStyle = {
  width: "120px",
  height: "4px",
  margin: "20px auto 0",
  borderRadius: "10px",
  background:
    "linear-gradient(90deg,#2563eb,#4f46e5)",
};

export default MyParcels;