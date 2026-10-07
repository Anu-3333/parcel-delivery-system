import { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {
  const [user, setUser] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const getProfile = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/auth/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUser(response.data);
      } catch (error) {
        console.error("Profile error:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          localStorage.removeItem("user_id");

          window.location.href = "/login";
        }
      }
    };

    if (token) {
      getProfile();
    } else {
      window.location.href = "/login";
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user_id");
    localStorage.removeItem("reset_email");
    localStorage.removeItem("reset_verified");

    window.location.href = "/login";
  };

  const goTo = (path) => {
    window.location.href = path;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #f8fbff 0%, #eef4ff 100%)",
        fontFamily:
          "Arial, Helvetica, sans-serif",
      }}
    >
      {/* ================= NAVBAR ================= */}

      <nav
        style={{
          background:
            "linear-gradient(135deg, #2563eb, #1d4ed8)",
          color: "white",
          padding: "16px 6%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow:
            "0 4px 15px rgba(37, 99, 235, 0.25)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: "23px",
              fontWeight: "700",
            }}
          >
            📦 Parcel Delivery
          </h2>

          <span
            style={{
              fontSize: "12px",
              opacity: 0.85,
            }}
          >
            Fast • Safe • Reliable
          </span>
        </div>

        <button
          onClick={handleLogout}
          style={{
            backgroundColor: "white",
            color: "#2563eb",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "700",
            fontSize: "14px",
          }}
        >
          Logout
        </button>
      </nav>

      {/* ================= MAIN CONTENT ================= */}

      <main
        style={{
          maxWidth: "1150px",
          margin: "0 auto",
          padding: "45px 20px",
        }}
      >
        {/* ================= WELCOME ================= */}

        <section
          style={{
            background:
              "linear-gradient(135deg, #2563eb, #4f46e5)",
            color: "white",
            borderRadius: "20px",
            padding: "35px",
            marginBottom: "30px",
            boxShadow:
              "0 10px 30px rgba(37, 99, 235, 0.18)",
          }}
        >
          <p
            style={{
              margin: "0 0 8px",
              fontSize: "14px",
              opacity: 0.85,
            }}
          >
            USER DASHBOARD
          </p>

          <h1
            style={{
              margin: "0 0 10px",
              fontSize: "32px",
            }}
          >
            Welcome
            {user ? `, ${user.name}` : ""}! 👋
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: "16px",
              opacity: 0.9,
            }}
          >
            Manage your parcels, track deliveries,
            and send packages easily.
          </p>
        </section>

        {/* ================= QUICK ACTIONS ================= */}

        <h2
          style={{
            marginBottom: "18px",
            color: "#1e293b",
          }}
        >
          Quick Actions
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "22px",
            marginBottom: "30px",
          }}
        >
          {/* BOOK PARCEL */}

          <div
            style={{
              backgroundColor: "white",
              padding: "28px",
              borderRadius: "16px",
              boxShadow:
                "0 5px 20px rgba(15, 23, 42, 0.08)",
              border:
                "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                width: "55px",
                height: "55px",
                borderRadius: "14px",
                backgroundColor: "#dbeafe",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
                marginBottom: "18px",
              }}
            >
              📦
            </div>

            <h3
              style={{
                color: "#1e293b",
                marginBottom: "8px",
              }}
            >
              Book New Parcel
            </h3>

            <p
              style={{
                color: "#64748b",
                lineHeight: "1.6",
                minHeight: "48px",
              }}
            >
              Create a new parcel booking and
              send it to your destination.
            </p>

            <button
              onClick={() => goTo("/book-parcel")}
              style={{
                width: "100%",
                backgroundColor: "#2563eb",
                color: "white",
                border: "none",
                padding: "12px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "700",
                marginTop: "10px",
              }}
            >
              Book Parcel →
            </button>
          </div>

          {/* MY PARCELS */}

          <div
            style={{
              backgroundColor: "white",
              padding: "28px",
              borderRadius: "16px",
              boxShadow:
                "0 5px 20px rgba(15, 23, 42, 0.08)",
              border:
                "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                width: "55px",
                height: "55px",
                borderRadius: "14px",
                backgroundColor: "#dcfce7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
                marginBottom: "18px",
              }}
            >
              📋
            </div>

            <h3
              style={{
                color: "#1e293b",
                marginBottom: "8px",
              }}
            >
              My Parcels
            </h3>

            <p
              style={{
                color: "#64748b",
                lineHeight: "1.6",
                minHeight: "48px",
              }}
            >
              View your bookings and track your
              parcel delivery status.
            </p>

            <button
              onClick={() => goTo("/my-parcels")}
              style={{
                width: "100%",
                backgroundColor: "#16a34a",
                color: "white",
                border: "none",
                padding: "12px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "700",
                marginTop: "10px",
              }}
            >
              View Parcels →
            </button>
          </div>

          {/* TRACKING */}

          <div
            style={{
              backgroundColor: "white",
              padding: "28px",
              borderRadius: "16px",
              boxShadow:
                "0 5px 20px rgba(15, 23, 42, 0.08)",
              border:
                "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                width: "55px",
                height: "55px",
                borderRadius: "14px",
                backgroundColor: "#fef3c7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
                marginBottom: "18px",
              }}
            >
              🗺️
            </div>

            <h3
              style={{
                color: "#1e293b",
                marginBottom: "8px",
              }}
            >
              Live Tracking
            </h3>

            <p
              style={{
                color: "#64748b",
                lineHeight: "1.6",
                minHeight: "48px",
              }}
            >
              Track your active parcel and view
              live delivery updates.
            </p>

            <button
              onClick={() => goTo("/my-parcels")}
              style={{
                width: "100%",
                backgroundColor: "#f59e0b",
                color: "white",
                border: "none",
                padding: "12px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "700",
                marginTop: "10px",
              }}
            >
              Track Parcel →
            </button>
          </div>
        </div>

        {/* ================= PROFILE ================= */}

        <h2
          style={{
            marginBottom: "18px",
            color: "#1e293b",
          }}
        >
          My Profile
        </h2>

        <div
          style={{
            backgroundColor: "white",
            borderRadius: "16px",
            padding: "28px",
            boxShadow:
              "0 5px 20px rgba(15, 23, 42, 0.08)",
            border:
              "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <div
              style={{
                width: "70px",
                height: "70px",
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, #2563eb, #4f46e5)",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "30px",
                fontWeight: "bold",
              }}
            >
              {user?.name
                ? user.name
                    .charAt(0)
                    .toUpperCase()
                : "U"}
            </div>

            <div style={{ flex: 1 }}>
              <h3
                style={{
                  margin: "0 0 7px",
                  color: "#1e293b",
                }}
              >
                {user?.name || "Loading..."}
              </h3>

              <p
                style={{
                  margin: "4px 0",
                  color: "#64748b",
                }}
              >
                📧 {user?.email || "Loading..."}
              </p>

              <p
                style={{
                  margin: "4px 0",
                  color: "#64748b",
                }}
              >
                📱 {user?.phone || "Loading..."}
              </p>
            </div>

            <div
              style={{
                backgroundColor: "#eff6ff",
                color: "#2563eb",
                padding: "8px 15px",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: "700",
              }}
            >
              {user?.role || "user"}
            </div>
          </div>
        </div>

        {/* ================= FOOTER ================= */}

        <div
          style={{
            textAlign: "center",
            color: "#94a3b8",
            fontSize: "13px",
            marginTop: "35px",
          }}
        >
          © 2026 Parcel Delivery System •
          Fast & Reliable Delivery
        </div>
      </main>
    </div>
  );
}

export default Dashboard;