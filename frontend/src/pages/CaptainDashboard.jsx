import { useEffect, useState } from "react";
import axios from "axios";

function CaptainDashboard() {

  // =========================
  // STATES
  // =========================

  const [captain, setCaptain] = useState(null);

  const [parcels, setParcels] = useState([]);

  const [assignedParcels, setAssignedParcels] = useState([]);

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(true);

  const [locationStatus, setLocationStatus] = useState(
    "Demo location is stopped."
  );

  const [demoRunning, setDemoRunning] = useState(false);

  const token = localStorage.getItem("token");


  // =========================
  // LOAD DASHBOARD DATA
  // =========================

  const loadData = async () => {

    try {

      setError("");

      // Captain profile
      const profileResponse = await axios.get(
        "http://127.0.0.1:8000/captain/me",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCaptain(profileResponse.data);


      // Available parcels
      const parcelsResponse = await axios.get(
        "http://127.0.0.1:8000/captain/available-parcels",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setParcels(parcelsResponse.data);


      // Assigned parcels
      const assignedResponse = await axios.get(
        "http://127.0.0.1:8000/captain/my-parcels",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAssignedParcels(
        assignedResponse.data
      );

    } catch (error) {

      console.error(
        "Captain dashboard error:",
        error
      );

      setError(
        error.response?.data?.detail ||
        "Failed to load captain dashboard."
      );

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    if (token) {

      loadData();

    } else {

      setError(
        "Please login again."
      );

      setLoading(false);

    }

  }, [token]);


  // ============================================================
  // GEOCODING
  // ============================================================

  const getCoordinates = async (address) => {

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

      return {
        latitude,
        longitude,
      };

    } catch (error) {

      console.error(
        "Geocoding error:",
        error
      );

      return null;

    }

  };


  // ============================================================
  // GET ACTUAL ROAD ROUTE USING OSRM
  // ============================================================

  const getRoadRoute = async (
    pickup,
    delivery
  ) => {

    if (
      !pickup ||
      !delivery
    ) {

      return [];

    }

    try {

      const url =
        `https://router.project-osrm.org/route/v1/driving/` +
        `${pickup.longitude},${pickup.latitude};` +
        `${delivery.longitude},${delivery.latitude}` +
        `?overview=full&geometries=geojson`;

      console.log(
        "🛣️ Requesting actual road route..."
      );

      const response =
        await fetch(url);

      if (!response.ok) {

        throw new Error(
          "OSRM route request failed"
        );

      }

      const data =
        await response.json();

      if (
        !data ||
        data.code !== "Ok" ||
        !data.routes ||
        data.routes.length === 0
      ) {

        console.error(
          "OSRM route not found:",
          data
        );

        return [];

      }

      const coordinates =
        data.routes[0]
          .geometry
          .coordinates;

      if (
        !coordinates ||
        coordinates.length === 0
      ) {

        return [];

      }

      // OSRM gives:
      // [longitude, latitude]

      // Convert to:
      // { latitude, longitude }

      const routePoints =
        coordinates.map(
          (coordinate) => {

            return {
              latitude:
                coordinate[1],

              longitude:
                coordinate[0],
            };

          }
        );

      console.log(
        "✅ Actual road route received:",
        routePoints.length,
        "points"
      );

      return routePoints;

    } catch (error) {

      console.error(
        "Road route error:",
        error
      );

      return [];

    }

  };


  // ============================================================
  // DEMO LIVE LOCATION
  // ============================================================

  useEffect(() => {

    if (!demoRunning) {

      return;

    }

    if (!token) {

      return;

    }


    let cancelled = false;

    let intervalId = null;

    let routePoints = [];

    let step = 0;


    // ========================================================
    // FIND ACTIVE PARCEL
    // ========================================================

    const activeParcel =
      assignedParcels.find(
        (parcel) =>
          parcel.status !== "Delivered"
      );


    if (!activeParcel) {

      setLocationStatus(
        "⚠️ No active parcel available."
      );

      setDemoRunning(false);

      return;

    }


    // ========================================================
    // LOAD ACTUAL ROAD ROUTE
    // ========================================================

    const prepareRoute =
      async () => {

        try {

          setLocationStatus(
            "📍 Finding pickup and delivery locations..."
          );


          console.log(
            "📦 Active Parcel:",
            activeParcel.id
          );

          console.log(
            "📍 Pickup:",
            activeParcel.pickup_address
          );

          console.log(
            "🏠 Delivery:",
            activeParcel.delivery_address
          );


          // --------------------------------------------------
          // PICKUP LOCATION
          // --------------------------------------------------

          const pickup =
            await getCoordinates(
              activeParcel.pickup_address
            );


          if (cancelled) {
            return;
          }


          if (!pickup) {

            setLocationStatus(
              "⚠️ Pickup location not found."
            );

            setDemoRunning(false);

            return;

          }


          // --------------------------------------------------
          // DELIVERY LOCATION
          // --------------------------------------------------

          setLocationStatus(
            "📍 Finding delivery location..."
          );


          const delivery =
            await getCoordinates(
              activeParcel.delivery_address
            );


          if (cancelled) {
            return;
          }


          if (!delivery) {

            setLocationStatus(
              "⚠️ Delivery location not found."
            );

            setDemoRunning(false);

            return;

          }


          // --------------------------------------------------
          // OSRM ACTUAL ROAD ROUTE
          // --------------------------------------------------

          setLocationStatus(
            "🛣️ Finding actual road route..."
          );


          routePoints =
            await getRoadRoute(
              pickup,
              delivery
            );


          if (cancelled) {
            return;
          }


          // --------------------------------------------------
          // ROUTE CHECK
          // --------------------------------------------------

          if (
            !routePoints ||
            routePoints.length < 2
          ) {

            setLocationStatus(
              "⚠️ Unable to find road route."
            );

            setDemoRunning(false);

            return;

          }


          console.log(
            "🛣️ Total road points:",
            routePoints.length
          );


          setLocationStatus(
            `🛣️ Road route ready • ${routePoints.length} points`
          );


          step = 0;


          // ==================================================
          // SEND LOCATION
          // ==================================================

          const sendRoadLocation =
            async () => {

              if (cancelled) {
                return;
              }


              if (
                !routePoints ||
                routePoints.length === 0
              ) {

                return;

              }


              // ------------------------------------------------
              // GET CURRENT ROAD POINT
              // ------------------------------------------------

              const currentPoint =
                routePoints[step];


              if (!currentPoint) {
                return;
              }


              const latitude =
                currentPoint.latitude;

              const longitude =
                currentPoint.longitude;


              console.log(
                "🚚 CAPTAIN ROAD LOCATION:",
                {
                  parcelId:
                    activeParcel.id,

                  step:
                    step + 1,

                  total:
                    routePoints.length,

                  latitude,

                  longitude,
                }
              );


              try {

                await axios.post(
                  "http://127.0.0.1:8000/captain/location",
                  null,
                  {
                    params: {
                      latitude,
                      longitude,
                    },

                    headers: {
                      Authorization:
                        `Bearer ${token}`,
                    },
                  }
                );


                if (cancelled) {
                  return;
                }


                setLocationStatus(
                  `🟢 Captain moving on road • ${step + 1}/${routePoints.length}`
                );


              } catch (error) {

                console.error(
                  "Road location update error:",
                  error
                );


                if (
                  !cancelled
                ) {

                  setLocationStatus(
                    "⚠️ Unable to send captain location"
                  );

                }

              }


              // ------------------------------------------------
              // MOVE TO NEXT ROAD POINT
              // ------------------------------------------------

              step++;


              // ------------------------------------------------
              // RESTART AFTER DELIVERY
              // ------------------------------------------------

              if (
                step >=
                routePoints.length
              ) {

                console.log(
                  "🏁 Captain reached delivery location."
                );


                setLocationStatus(
                  "🏁 Delivery location reached • Restarting route..."
                );


                step = 0;

              }

            };


          // ==================================================
          // FIRST LOCATION IMMEDIATELY
          // ==================================================

          await sendRoadLocation();


          if (cancelled) {
            return;
          }


          // ==================================================
          // EVERY 2 SECONDS
          // ==================================================

          intervalId =
            setInterval(
              sendRoadLocation,
              2000
            );

        } catch (error) {

          console.error(
            "Road tracking setup error:",
            error
          );


          if (!cancelled) {

            setLocationStatus(
              "⚠️ Unable to start road tracking"
            );

            setDemoRunning(false);

          }

        }

      };


    prepareRoute();


    // ========================================================
    // CLEANUP
    // ========================================================

    return () => {

      cancelled = true;

      if (intervalId) {

        clearInterval(
          intervalId
        );

      }

    };

  }, [
    demoRunning,
    token,
    assignedParcels,
  ]);


  // =========================
  // START DEMO
  // =========================

  const startDemoLocation = () => {

    if (
      assignedParcels.length === 0
    ) {

      alert(
        "Please accept a parcel before starting demo live location."
      );

      return;

    }


    const activeParcel =
      assignedParcels.find(
        (parcel) =>
          parcel.status !== "Delivered"
      );


    if (!activeParcel) {

      alert(
        "Please have an active parcel to start demo location."
      );

      return;

    }


    setDemoRunning(true);

    setLocationStatus(
      "🟢 Starting road-based live location..."
    );

  };


  // =========================
  // STOP DEMO
  // =========================

  const stopDemoLocation = () => {

    setDemoRunning(false);

    setLocationStatus(
      "⏹️ Demo road location stopped"
    );

  };


  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {

    setDemoRunning(false);

    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "role"
    );

    localStorage.removeItem(
      "user_id"
    );

    window.location.href =
      "/login";

  };


  // =========================
  // ACCEPT PARCEL
  // =========================

  const handleAccept = async (
    parcelId
  ) => {

    try {

      const response =
        await axios.put(
          `http://127.0.0.1:8000/captain/accept/${parcelId}`,
          {},
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


      alert(
        response.data.message
      );


      loadData();

    } catch (error) {

      console.error(
        "Accept parcel error:",
        error
      );


      alert(
        error.response?.data?.detail ||
        "Failed to accept parcel."
      );

    }

  };


  // =========================
  // UPDATE STATUS
  // =========================

  const handleStatusUpdate = async (
    parcelId,
    newStatus
  ) => {

    try {

      const response =
        await axios.put(
          `http://127.0.0.1:8000/captain/update-status/${parcelId}`,
          {
            status: newStatus,
          },
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );


      alert(
        response.data.message
      );


      loadData();

    } catch (error) {

      console.error(
        "Status update error:",
        error
      );


      alert(
        error.response?.data?.detail ||
        "Failed to update parcel status."
      );

    }

  };


  // =========================
  // LOADING
  // =========================

  if (loading) {

    return (

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f5f7fb",
        }}
      >

        <h2>
          Loading Captain Dashboard...
        </h2>

      </div>

    );

  }


  // =========================
  // DASHBOARD
  // =========================

  return (

    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f7fb",
      }}
    >

      {/* =========================
          NAVBAR
      ========================= */}

      <nav
        style={{
          background:
            "linear-gradient(135deg, #111827, #1e3a8a)",
          color: "white",
          padding: "18px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow:
            "0 4px 12px rgba(0,0,0,0.15)",
        }}
      >

        <div>

          <h2
            style={{
              margin: 0,
              fontSize: "24px",
            }}
          >
            🚚 Captain Dashboard
          </h2>

          <small
            style={{
              opacity: 0.8,
            }}
          >
            Parcel Delivery Management
          </small>

        </div>


        <button
          onClick={
            handleLogout
          }
          style={{
            backgroundColor: "white",
            color: "#111827",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Logout
        </button>

      </nav>


      {/* =========================
          MAIN CONTENT
      ========================= */}

      <div
        style={{
          maxWidth: "1150px",
          margin: "auto",
          padding: "40px 20px",
        }}
      >

        {/* WELCOME */}

        <div
          style={{
            marginBottom: "30px",
          }}
        >

          <h1
            style={{
              marginBottom: "8px",
            }}
          >
            Welcome
            {captain
              ? `, ${captain.name}`
              : ""}! 👋
          </h1>

          <p
            style={{
              color: "#6b7280",
              margin: 0,
            }}
          >
            Manage your parcels and deliver them
            safely to customers.
          </p>

        </div>


        {/* ERROR */}

        {error && (

          <div
            style={{
              backgroundColor: "#fee2e2",
              color: "#991b1b",
              padding: "15px",
              borderRadius: "10px",
              marginBottom: "25px",
            }}
          >
            ⚠️ {error}
          </div>

        )}


        {/* =========================
            DEMO LIVE LOCATION
        ========================= */}

        <div
          style={{
            backgroundColor: "white",
            padding: "22px",
            borderRadius: "14px",
            boxShadow:
              "0 4px 15px rgba(0,0,0,0.06)",
            marginBottom: "25px",
          }}
        >

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >

            <span
              style={{
                fontSize: "28px",
              }}
            >
              📍
            </span>


            <div>

              <strong
                style={{
                  fontSize: "16px",
                }}
              >
                Captain Live Location
              </strong>


              <div
                style={{
                  color: demoRunning
                    ? "#16a34a"
                    : "#6b7280",
                  fontSize: "14px",
                  marginTop: "5px",
                  fontWeight: "600",
                }}
              >
                {locationStatus}
              </div>

            </div>

          </div>


          {/* DEMO BUTTONS */}

          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "18px",
              flexWrap: "wrap",
            }}
          >

            {!demoRunning ? (

              <button
                onClick={
                  startDemoLocation
                }
                style={{
                  backgroundColor:
                    "#2563eb",
                  color: "white",
                  border: "none",
                  padding:
                    "12px 18px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "14px",
                }}
              >
                🚚 Start Road Live Location
              </button>

            ) : (

              <button
                onClick={
                  stopDemoLocation
                }
                style={{
                  backgroundColor:
                    "#dc2626",
                  color: "white",
                  border: "none",
                  padding:
                    "12px 18px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "14px",
                }}
              >
                ⏹️ Stop Demo Location
              </button>

            )}

          </div>


          {/* DEMO INFORMATION */}

          <div
            style={{
              marginTop: "15px",
              padding: "12px",
              backgroundColor:
                "#eff6ff",
              color: "#1e40af",
              borderRadius: "8px",
              fontSize: "13px",
            }}
          >

            🚚 Demo route:
            <strong>
              {" "}
              Active Parcel Pickup → Delivery
            </strong>

            <br />

            🛣️ Captain moves on the actual road route.

            <br />

            📍 Location updates every 2 seconds.

          </div>

        </div>


        {/* =========================
            STAT CARDS
        ========================= */}

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px",
            marginBottom: "35px",
          }}
        >

          <div style={statCardStyle}>

            <div style={statIconStyle}>
              📦
            </div>

            <div>

              <p style={statTitleStyle}>
                Available Parcels
              </p>

              <h2 style={statNumberStyle}>
                {parcels.length}
              </h2>

            </div>

          </div>


          <div style={statCardStyle}>

            <div style={statIconStyle}>
              🚚
            </div>

            <div>

              <p style={statTitleStyle}>
                My Parcels
              </p>

              <h2 style={statNumberStyle}>
                {assignedParcels.length}
              </h2>

            </div>

          </div>


          <div style={statCardStyle}>

            <div style={statIconStyle}>
              🟢
            </div>

            <div>

              <p style={statTitleStyle}>
                Captain Status
              </p>

              <h2
                style={{
                  ...statNumberStyle,
                  fontSize: "18px",
                  color: "#16a34a",
                }}
              >
                Active
              </h2>

            </div>

          </div>

        </div>


        {/* =========================
            CAPTAIN PROFILE
        ========================= */}

        {captain && (

          <div style={sectionCardStyle}>

            <h2 style={sectionTitleStyle}>
              👤 Captain Profile
            </h2>


            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "20px",
              }}
            >

              <div>

                <p style={labelStyle}>
                  Name
                </p>

                <strong>
                  {captain.name}
                </strong>

              </div>


              <div>

                <p style={labelStyle}>
                  Email
                </p>

                <strong>
                  {captain.email}
                </strong>

              </div>


              <div>

                <p style={labelStyle}>
                  Phone
                </p>

                <strong>
                  {captain.phone}
                </strong>

              </div>


              <div>

                <p style={labelStyle}>
                  Role
                </p>

                <span
                  style={{
                    backgroundColor:
                      "#dbeafe",
                    color: "#1d4ed8",
                    padding:
                      "5px 12px",
                    borderRadius:
                      "20px",
                    fontSize: "13px",
                    fontWeight: "bold",
                  }}
                >
                  {captain.role}
                </span>

              </div>

            </div>

          </div>

        )}


        {/* =========================
            AVAILABLE PARCELS
        ========================= */}

        <h2
          style={sectionHeadingStyle}
        >
          📦 Available Parcels
        </h2>


        {parcels.length === 0 ? (

          <div style={emptyCardStyle}>

            <div
              style={{
                fontSize: "45px",
              }}
            >
              📭
            </div>

            <h3>
              No Available Parcels
            </h3>

            <p
              style={{
                color: "#6b7280",
              }}
            >
              There are currently no parcels waiting
              for a captain.
            </p>

          </div>

        ) : (

          <div style={gridStyle}>

            {parcels.map(
              (parcel) => (

                <div
                  key={parcel.id}
                  style={
                    parcelCardStyle
                  }
                >

                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",
                      marginBottom:
                        "20px",
                    }}
                  >

                    <h3
                      style={{
                        margin: 0,
                      }}
                    >
                      📦 Parcel #{parcel.id}
                    </h3>


                    <span
                      style={
                        bookedBadgeStyle
                      }
                    >
                      {parcel.status}
                    </span>

                  </div>


                  <div
                    style={
                      detailBoxStyle
                    }
                  >

                    <p>
                      <strong>
                        Receiver:
                      </strong>{" "}
                      {parcel.receiver_name}
                    </p>


                    <p>
                      <strong>
                        Phone:
                      </strong>{" "}
                      {parcel.receiver_phone}
                    </p>


                    <p>
                      <strong>
                        Pickup:
                      </strong>{" "}
                      {parcel.pickup_address}
                    </p>


                    <p>
                      <strong>
                        Delivery:
                      </strong>{" "}
                      {parcel.delivery_address}
                    </p>


                    <p>
                      <strong>
                        Type:
                      </strong>{" "}
                      {parcel.parcel_type}
                    </p>


                    <p>
                      <strong>
                        Weight:
                      </strong>{" "}
                      {parcel.weight}
                    </p>


                    <p
                      style={{
                        marginBottom: 0,
                      }}
                    >
                      <strong>
                        Price:
                      </strong>{" "}
                      ₹{parcel.price}
                    </p>

                  </div>


                  <button
                    onClick={() =>
                      handleAccept(
                        parcel.id
                      )
                    }
                    style={
                      acceptButtonStyle
                    }
                  >
                    🚚 Accept Parcel
                  </button>

                </div>

              )
            )}

          </div>

        )}


        {/* =========================
            ASSIGNED PARCELS
        ========================= */}

        <h2
          style={{
            ...sectionHeadingStyle,
            marginTop: "50px",
          }}
        >
          🚚 My Assigned Parcels
        </h2>


        {assignedParcels.length === 0 ? (

          <div style={emptyCardStyle}>

            <div
              style={{
                fontSize: "45px",
              }}
            >
              📦
            </div>

            <h3>
              No Assigned Parcels
            </h3>

            <p
              style={{
                color: "#6b7280",
              }}
            >
              Accept a parcel from the available
              parcels section.
            </p>

          </div>

        ) : (

          <div style={gridStyle}>

            {assignedParcels.map(
              (parcel) => (

                <div
                  key={parcel.id}
                  style={
                    parcelCardStyle
                  }
                >

                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",
                      marginBottom:
                        "20px",
                    }}
                  >

                    <h3
                      style={{
                        margin: 0,
                      }}
                    >
                      📦 Parcel #{parcel.id}
                    </h3>


                    <span
                      style={{
                        backgroundColor:
                          parcel.status ===
                          "Delivered"
                            ? "#dcfce7"
                            : "#dbeafe",

                        color:
                          parcel.status ===
                          "Delivered"
                            ? "#166534"
                            : "#1d4ed8",

                        padding:
                          "6px 10px",

                        borderRadius:
                          "20px",

                        fontSize:
                          "12px",

                        fontWeight:
                          "bold",
                      }}
                    >
                      {parcel.status}
                    </span>

                  </div>


                  <div
                    style={
                      detailBoxStyle
                    }
                  >

                    <p>
                      <strong>
                        Receiver:
                      </strong>{" "}
                      {parcel.receiver_name}
                    </p>


                    <p>
                      <strong>
                        Pickup:
                      </strong>{" "}
                      {parcel.pickup_address}
                    </p>


                    <p
                      style={{
                        marginBottom: 0,
                      }}
                    >
                      <strong>
                        Delivery:
                      </strong>{" "}
                      {parcel.delivery_address}
                    </p>

                  </div>


                  {/* STATUS BUTTONS */}

                  {parcel.status ===
                    "Captain Assigned" && (

                    <button
                      onClick={() =>
                        handleStatusUpdate(
                          parcel.id,
                          "Picked Up"
                        )
                      }
                      style={
                        statusButtonStyle
                      }
                    >
                      📦 Mark as Picked Up
                    </button>

                  )}


                  {parcel.status ===
                    "Picked Up" && (

                    <button
                      onClick={() =>
                        handleStatusUpdate(
                          parcel.id,
                          "In Transit"
                        )
                      }
                      style={
                        statusButtonStyle
                      }
                    >
                      🚚 Start Delivery
                    </button>

                  )}


                  {parcel.status ===
                    "In Transit" && (

                    <button
                      onClick={() =>
                        handleStatusUpdate(
                          parcel.id,
                          "Out for Delivery"
                        )
                      }
                      style={
                        statusButtonStyle
                      }
                    >
                      🛵 Out for Delivery
                    </button>

                  )}


                  {parcel.status ===
                    "Out for Delivery" && (

                    <button
                      onClick={() =>
                        handleStatusUpdate(
                          parcel.id,
                          "Delivered"
                        )
                      }
                      style={
                        deliveredButtonStyle
                      }
                    >
                      ✅ Mark as Delivered
                    </button>

                  )}


                  {parcel.status ===
                    "Delivered" && (

                    <div
                      style={{
                        marginTop:
                          "18px",
                        padding:
                          "14px",
                        backgroundColor:
                          "#dcfce7",
                        color:
                          "#166534",
                        borderRadius:
                          "8px",
                        textAlign:
                          "center",
                        fontWeight:
                          "bold",
                      }}
                    >
                      🎉 Parcel Delivered Successfully
                    </div>

                  )}

                </div>

              )
            )}

          </div>

        )}

      </div>

    </div>

  );

}


// =========================
// STYLES
// =========================

const statCardStyle = {

  backgroundColor: "white",

  padding: "22px",

  borderRadius: "14px",

  boxShadow:
    "0 4px 15px rgba(0,0,0,0.06)",

  display: "flex",

  alignItems: "center",

  gap: "15px",

};


const statIconStyle = {

  width: "50px",

  height: "50px",

  borderRadius: "12px",

  backgroundColor: "#eff6ff",

  display: "flex",

  alignItems: "center",

  justifyContent: "center",

  fontSize: "24px",

};


const statTitleStyle = {

  margin: 0,

  color: "#6b7280",

  fontSize: "14px",

};


const statNumberStyle = {

  margin: "5px 0 0",

  fontSize: "25px",

  color: "#111827",

};


const sectionCardStyle = {

  backgroundColor: "white",

  padding: "25px",

  borderRadius: "14px",

  boxShadow:
    "0 4px 15px rgba(0,0,0,0.06)",

};


const sectionTitleStyle = {

  marginTop: 0,

  marginBottom: "25px",

};


const labelStyle = {

  color: "#6b7280",

  fontSize: "13px",

  marginBottom: "5px",

};


const sectionHeadingStyle = {

  marginBottom: "20px",

};


const gridStyle = {

  display: "grid",

  gridTemplateColumns:
    "repeat(auto-fit, minmax(320px, 1fr))",

  gap: "20px",

};


const parcelCardStyle = {

  backgroundColor: "white",

  padding: "25px",

  borderRadius: "14px",

  boxShadow:
    "0 4px 15px rgba(0,0,0,0.07)",

};


const detailBoxStyle = {

  backgroundColor: "#f9fafb",

  padding: "15px",

  borderRadius: "10px",

};


const bookedBadgeStyle = {

  backgroundColor: "#fef3c7",

  color: "#92400e",

  padding: "6px 10px",

  borderRadius: "20px",

  fontSize: "12px",

  fontWeight: "bold",

};


const acceptButtonStyle = {

  width: "100%",

  padding: "13px",

  marginTop: "18px",

  backgroundColor: "#16a34a",

  color: "white",

  border: "none",

  borderRadius: "8px",

  cursor: "pointer",

  fontSize: "15px",

  fontWeight: "bold",

};


const statusButtonStyle = {

  width: "100%",

  padding: "13px",

  marginTop: "18px",

  backgroundColor: "#2563eb",

  color: "white",

  border: "none",

  borderRadius: "8px",

  cursor: "pointer",

  fontSize: "15px",

  fontWeight: "bold",

};


const deliveredButtonStyle = {

  ...statusButtonStyle,

  backgroundColor: "#16a34a",

};


const emptyCardStyle = {

  backgroundColor: "white",

  padding: "40px 25px",

  borderRadius: "14px",

  textAlign: "center",

  boxShadow:
    "0 4px 15px rgba(0,0,0,0.05)",

};


export default CaptainDashboard;