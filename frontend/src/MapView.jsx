import { useEffect, useState } from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

// =====================================================
// FIX DEFAULT LEAFLET ICON
// =====================================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// =====================================================
// CAPTAIN LIVE ICON
// =====================================================

const captainIcon = L.divIcon({
  className: "captain-live-icon",

  html: `
    <div
      style="
        width:42px;
        height:42px;
        background:#2563eb;
        border:4px solid white;
        border-radius:50%;
        display:flex;
        align-items:center;
        justify-content:center;
        box-shadow:0 3px 12px rgba(0,0,0,0.35);
        font-size:22px;
      "
    >
      🚚
    </div>
  `,

  iconSize: [42, 42],
  iconAnchor: [21, 21],
  popupAnchor: [0, -21],
});

// =====================================================
// MAP UPDATER
// IMPORTANT:
// DO NOT MOVE MAP WITH CAPTAIN
// ONLY MARKER SHOULD MOVE
// =====================================================

function MapUpdater({
  pickupPosition,
  deliveryPosition,
}) {
  const map = useMap();

  // ===================================================
  // INITIAL MAP FIT
  // ===================================================

  useEffect(() => {
    if (
      !pickupPosition ||
      !deliveryPosition
    ) {
      return;
    }

    try {
      map.fitBounds(
        [
          pickupPosition,
          deliveryPosition,
        ],
        {
          padding: [50, 50],
          animate: true,
        }
      );
    } catch (error) {
      console.error(
        "Map fit error:",
        error
      );
    }
  }, [
    pickupPosition,
    deliveryPosition,
    map,
  ]);

  return null;
}

// =====================================================
// GET COORDINATES
// =====================================================

async function getCoordinates(address) {
  if (!address) {
    return null;
  }

  try {
    const url =
      "https://nominatim.openstreetmap.org/search" +
      "?format=jsonv2" +
      "&limit=1" +
      "&countrycodes=in" +
      "&q=" +
      encodeURIComponent(address);

    const response = await fetch(
      url,
      {
        headers: {
          "Accept-Language": "en",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        "Location search failed"
      );
    }

    const data =
      await response.json();

    if (
      !data ||
      data.length === 0
    ) {
      return null;
    }

    const latitude =
      parseFloat(data[0].lat);

    const longitude =
      parseFloat(data[0].lon);

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return null;
    }

    return [
      latitude,
      longitude,
    ];
  } catch (error) {
    console.error(
      "Geocoding Error:",
      error
    );

    return null;
  }
}

// =====================================================
// MAP VIEW
// =====================================================

function MapView({
  pickupAddress,
  deliveryAddress,
  captainLocation,
}) {
  const [
    pickupPosition,
    setPickupPosition,
  ] = useState(null);

  const [
    deliveryPosition,
    setDeliveryPosition,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  // ===================================================
  // LOAD PICKUP & DELIVERY LOCATIONS
  // ===================================================

  useEffect(() => {
    let cancelled = false;

    const loadLocations = async () => {
      setLoading(true);
      setError("");

      try {
        const pickup =
          await getCoordinates(
            pickupAddress
          );

        const delivery =
          await getCoordinates(
            deliveryAddress
          );

        if (cancelled) {
          return;
        }

        // =============================================
        // PICKUP NOT FOUND
        // =============================================

        if (!pickup) {
          setError(
            `Pickup location not found: ${pickupAddress}`
          );

          setLoading(false);
          return;
        }

        // =============================================
        // DELIVERY NOT FOUND
        // =============================================

        if (!delivery) {
          setError(
            `Delivery location not found: ${deliveryAddress}`
          );

          setLoading(false);
          return;
        }

        setPickupPosition(pickup);
        setDeliveryPosition(delivery);
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Location loading error:",
            error
          );

          setError(
            "Unable to find locations."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadLocations();

    return () => {
      cancelled = true;
    };
  }, [
    pickupAddress,
    deliveryAddress,
  ]);

  // ===================================================
  // CAPTAIN LOCATION
  // ===================================================

  const captainPosition =
    captainLocation
      ? [
          Number(
            captainLocation.latitude
          ),
          Number(
            captainLocation.longitude
          ),
        ]
      : null;

  // ===================================================
  // VALIDATE CAPTAIN LOCATION
  // ===================================================

  const validCaptainPosition =
    captainPosition &&
    Number.isFinite(
      captainPosition[0]
    ) &&
    Number.isFinite(
      captainPosition[1]
    )
      ? captainPosition
      : null;

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <div
        style={{
          width: "100%",
          height: "450px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f5f7fb",
          borderRadius: "12px",
          marginTop: "20px",
        }}
      >
        <div
          style={{
            textAlign: "center",
          }}
        >
          <h3>
            📍 Finding locations...
          </h3>

          <p
            style={{
              color: "#666",
            }}
          >
            Finding pickup and delivery
            locations
          </p>
        </div>
      </div>
    );
  }

  // ===================================================
  // LOCATION ERROR
  // ===================================================

  if (error) {
    return (
      <div
        style={{
          width: "100%",
          height: "250px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fff7ed",
          borderRadius: "12px",
          marginTop: "20px",
          padding: "20px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            textAlign: "center",
          }}
        >
          <h3
            style={{
              color: "#c2410c",
            }}
          >
            📍 Location Not Found
          </h3>

          <p
            style={{
              color: "#666",
            }}
          >
            {error}
          </p>

          <p
            style={{
              fontSize: "13px",
              color: "#888",
            }}
          >
            Please enter a more specific
            address.
          </p>
        </div>
      </div>
    );
  }

  // ===================================================
  // MAP CENTER
  // IMPORTANT:
  // CENTER IS FIXED
  // CAPTAIN WILL NOT CONTROL MAP CENTER
  // ===================================================

  const mapCenter = [
    (
      pickupPosition[0] +
      deliveryPosition[0]
    ) / 2,

    (
      pickupPosition[1] +
      deliveryPosition[1]
    ) / 2,
  ];

  // ===================================================
  // ROUTE
  // ===================================================

  const routePositions = [
    pickupPosition,
    deliveryPosition,
  ];

  // ===================================================
  // MAIN MAP
  // ===================================================

  return (
    <div
      style={{
        width: "100%",
        height: "450px",
        borderRadius: "12px",
        overflow: "hidden",
        marginTop: "20px",
        position: "relative",
      }}
    >
      <MapContainer
        center={mapCenter}
        zoom={9}
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        {/* ============================================
            OPEN STREET MAP
        ============================================= */}

        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* ============================================
            MAP UPDATER
        ============================================= */}

        <MapUpdater
          pickupPosition={
            pickupPosition
          }
          deliveryPosition={
            deliveryPosition
          }
        />

        {/* ============================================
            PICKUP MARKER
        ============================================= */}

        <Marker
          position={pickupPosition}
        >
          <Popup>
            📦{" "}
            <strong>
              Pickup Location
            </strong>

            <br />

            {pickupAddress}
          </Popup>
        </Marker>

        {/* ============================================
            DELIVERY MARKER
        ============================================= */}

        <Marker
          position={deliveryPosition}
        >
          <Popup>
            🏠{" "}
            <strong>
              Delivery Location
            </strong>

            <br />

            {deliveryAddress}
          </Popup>
        </Marker>

        {/* ============================================
            ROUTE LINE
        ============================================= */}

        <Polyline
          positions={
            routePositions
          }
          pathOptions={{
            color: "#2563eb",
            weight: 5,
            opacity: 0.8,
          }}
        />

        {/* ============================================
            CAPTAIN LIVE MARKER
        ============================================= */}

        {validCaptainPosition && (
          <Marker
            key={`${validCaptainPosition[0]}-${validCaptainPosition[1]}`}
            position={
              validCaptainPosition
            }
            icon={captainIcon}
          >
            <Popup>
              <div
                style={{
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "25px",
                  }}
                >
                  🚚
                </div>

                <strong>
                  Captain Live Location
                </strong>

                <br />

                <span
                  style={{
                    color: "#15803d",
                    fontSize: "13px",
                  }}
                >
                  🟢 Live GPS Active
                </span>

                <br />

                <span
                  style={{
                    fontSize: "11px",
                    color: "#666",
                  }}
                >
                  Latitude:{" "}
                  {validCaptainPosition[0].toFixed(
                    6
                  )}
                </span>

                <br />

                <span
                  style={{
                    fontSize: "11px",
                    color: "#666",
                  }}
                >
                  Longitude:{" "}
                  {validCaptainPosition[1].toFixed(
                    6
                  )}
                </span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* ============================================
            LIVE LOCATION LABEL
        ============================================= */}

        {validCaptainPosition && (
          <div
            style={{
              position: "absolute",
              top: "15px",
              right: "15px",
              zIndex: 1000,
              backgroundColor: "white",
              padding: "10px 14px",
              borderRadius: "8px",
              boxShadow:
                "0 2px 10px rgba(0,0,0,0.2)",
              fontSize: "13px",
              fontWeight: "bold",
              color: "#15803d",
            }}
          >
            🟢 Captain Live
          </div>
        )}

        {/* ============================================
            LIVE LOCATION COORDINATES
        ============================================= */}

        {validCaptainPosition && (
          <div
            style={{
              position: "absolute",
              bottom: "15px",
              left: "15px",
              zIndex: 1000,
              backgroundColor: "white",
              padding: "10px 14px",
              borderRadius: "8px",
              boxShadow:
                "0 2px 10px rgba(0,0,0,0.2)",
              fontSize: "11px",
              color: "#374151",
            }}
          >
            <strong>
              🚚 Captain Position
            </strong>

            <br />

            LAT:{" "}
            {validCaptainPosition[0].toFixed(
              6
            )}

            <br />

            LNG:{" "}
            {validCaptainPosition[1].toFixed(
              6
            )}
          </div>
        )}
      </MapContainer>
    </div>
  );
}

export default MapView;