import { useEffect, useState } from "react";
import axios from "axios";

function AdminDashboard() {

  // =====================================================
  // STATE
  // =====================================================

  const [admin, setAdmin] = useState(null);
  const [users, setUsers] = useState([]);
  const [parcels, setParcels] = useState([]);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");


  // =====================================================
  // GET TOKEN
  // =====================================================

  const token = localStorage.getItem("token");


  // =====================================================
  // AXIOS CONFIG
  // =====================================================

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };


  // =====================================================
  // LOAD ADMIN DATA
  // =====================================================

  useEffect(() => {

    const loadAdminData = async () => {

      if (!token) {
        setErrorMessage("Admin login required.");
        setLoading(false);
        return;
      }

      try {

        const [
          adminResponse,
          usersResponse,
          parcelsResponse
        ] = await Promise.all([

          axios.get(
            "http://127.0.0.1:8000/admin/me",
            config
          ),

          axios.get(
            "http://127.0.0.1:8000/admin/users",
            config
          ),

          axios.get(
            "http://127.0.0.1:8000/admin/parcels",
            config
          )

        ]);


        setAdmin(
          adminResponse.data
        );

        setUsers(
          usersResponse.data
        );

        setParcels(
          parcelsResponse.data
        );

      } catch (error) {

        console.error(
          "Admin Dashboard Error:",
          error
        );

        if (error.response) {

          setErrorMessage(
            error.response.data?.detail ||
            "Unable to load admin data."
          );

        } else {

          setErrorMessage(
            "Cannot connect to backend."
          );

        }

      } finally {

        setLoading(false);

      }

    };


    loadAdminData();

  }, []);


  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {

    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user_id");

    window.location.href = "/";

  };


  // =====================================================
  // LOADING
  // =====================================================

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
          Loading Admin Dashboard...
        </h2>

      </div>

    );

  }


  // =====================================================
  // ERROR
  // =====================================================

  if (errorMessage) {

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
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "12px",
            boxShadow: "0 5px 20px rgba(0,0,0,0.1)",
            textAlign: "center",
          }}
        >

          <h2>
            Admin Dashboard
          </h2>

          <p
            style={{
              color: "#dc2626",
            }}
          >
            {errorMessage}
          </p>

          <button
            onClick={() => {
              window.location.href = "/";
            }}
            style={{
              padding: "10px 20px",
              backgroundColor: "#2563eb",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Go to Login
          </button>

        </div>

      </div>

    );

  }


  // =====================================================
  // STATISTICS
  // =====================================================

  const totalUsers = users.length;

  const totalCaptains = users.filter(
    (user) => user.role === "captain"
  ).length;

  const totalParcels = parcels.length;

  const deliveredParcels = parcels.filter(
    (parcel) => parcel.status === "Delivered"
  ).length;

  const activeParcels = parcels.filter(
    (parcel) =>
      parcel.status !== "Delivered"
  ).length;


  // =====================================================
  // DASHBOARD
  // =====================================================

  return (

    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f7fb",
        padding: "25px",
        boxSizing: "border-box",
      }}
    >

      {/* =================================================
          HEADER
      ================================================= */}

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto 25px auto",
          backgroundColor: "white",
          padding: "22px 25px",
          borderRadius: "12px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >

        <div>

          <h1
            style={{
              margin: "0 0 5px 0",
              color: "#1e293b",
            }}
          >
            Admin Dashboard
          </h1>

          <p
            style={{
              margin: 0,
              color: "#64748b",
            }}
          >
            Welcome, {admin?.name}
          </p>

        </div>


        <button
          onClick={handleLogout}
          style={{
            padding: "10px 18px",
            backgroundColor: "#dc2626",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Logout
        </button>

      </div>


      {/* =================================================
          STAT CARDS
      ================================================= */}

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto 25px auto",
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
        }}
      >

        {/* USERS */}

        <div
          style={{
            backgroundColor: "white",
            padding: "25px",
            borderRadius: "12px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
          }}
        >

          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontWeight: "600",
            }}
          >
            Total Users
          </p>

          <h2
            style={{
              margin: "10px 0 0 0",
              color: "#2563eb",
              fontSize: "32px",
            }}
          >
            {totalUsers}
          </h2>

        </div>


        {/* CAPTAINS */}

        <div
          style={{
            backgroundColor: "white",
            padding: "25px",
            borderRadius: "12px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
          }}
        >

          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontWeight: "600",
            }}
          >
            Total Captains
          </p>

          <h2
            style={{
              margin: "10px 0 0 0",
              color: "#7c3aed",
              fontSize: "32px",
            }}
          >
            {totalCaptains}
          </h2>

        </div>


        {/* PARCELS */}

        <div
          style={{
            backgroundColor: "white",
            padding: "25px",
            borderRadius: "12px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
          }}
        >

          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontWeight: "600",
            }}
          >
            Total Parcels
          </p>

          <h2
            style={{
              margin: "10px 0 0 0",
              color: "#059669",
              fontSize: "32px",
            }}
          >
            {totalParcels}
          </h2>

        </div>


        {/* ACTIVE */}

        <div
          style={{
            backgroundColor: "white",
            padding: "25px",
            borderRadius: "12px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
          }}
        >

          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontWeight: "600",
            }}
          >
            Active Parcels
          </p>

          <h2
            style={{
              margin: "10px 0 0 0",
              color: "#ea580c",
              fontSize: "32px",
            }}
          >
            {activeParcels}
          </h2>

        </div>


        {/* DELIVERED */}

        <div
          style={{
            backgroundColor: "white",
            padding: "25px",
            borderRadius: "12px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
          }}
        >

          <p
            style={{
              margin: 0,
              color: "#64748b",
              fontWeight: "600",
            }}
          >
            Delivered
          </p>

          <h2
            style={{
              margin: "10px 0 0 0",
              color: "#16a34a",
              fontSize: "32px",
            }}
          >
            {deliveredParcels}
          </h2>

        </div>

      </div>


      {/* =================================================
          USERS TABLE
      ================================================= */}

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto 25px auto",
          backgroundColor: "white",
          padding: "25px",
          borderRadius: "12px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
          overflowX: "auto",
        }}
      >

        <h2
          style={{
            marginTop: 0,
            color: "#1e293b",
          }}
        >
          All Users
        </h2>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: "700px",
          }}
        >

          <thead>

            <tr
              style={{
                backgroundColor: "#f1f5f9",
              }}
            >

              <th style={tableHeaderStyle}>
                ID
              </th>

              <th style={tableHeaderStyle}>
                Name
              </th>

              <th style={tableHeaderStyle}>
                Email
              </th>

              <th style={tableHeaderStyle}>
                Phone
              </th>

              <th style={tableHeaderStyle}>
                Role
              </th>

            </tr>

          </thead>

          <tbody>

            {users.map((user) => (

              <tr key={user.id}>

                <td style={tableCellStyle}>
                  {user.id}
                </td>

                <td style={tableCellStyle}>
                  {user.name}
                </td>

                <td style={tableCellStyle}>
                  {user.email}
                </td>

                <td style={tableCellStyle}>
                  {user.phone}
                </td>

                <td style={tableCellStyle}>

                  <span
                    style={{
                      padding: "5px 10px",
                      borderRadius: "20px",
                      backgroundColor:
                        user.role === "admin"
                          ? "#fee2e2"
                          : user.role === "captain"
                          ? "#ede9fe"
                          : "#dbeafe",
                      color:
                        user.role === "admin"
                          ? "#b91c1c"
                          : user.role === "captain"
                          ? "#6d28d9"
                          : "#1d4ed8",
                      fontSize: "13px",
                      fontWeight: "600",
                    }}
                  >
                    {user.role}
                  </span>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>


      {/* =================================================
          PARCEL TABLE
      ================================================= */}

      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          backgroundColor: "white",
          padding: "25px",
          borderRadius: "12px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
          overflowX: "auto",
        }}
      >

        <h2
          style={{
            marginTop: 0,
            color: "#1e293b",
          }}
        >
          All Parcels
        </h2>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: "1150px",
          }}
        >

          <thead>

            <tr
              style={{
                backgroundColor: "#f1f5f9",
              }}
            >

              <th style={tableHeaderStyle}>
                ID
              </th>

              <th style={tableHeaderStyle}>
                Receiver
              </th>

              <th style={tableHeaderStyle}>
                Pickup
              </th>

              <th style={tableHeaderStyle}>
                Delivery
              </th>

              <th style={tableHeaderStyle}>
                Type
              </th>

              <th style={tableHeaderStyle}>
                Weight
              </th>

              <th style={tableHeaderStyle}>
                Price
              </th>

              <th style={tableHeaderStyle}>
                Captain
              </th>

              <th style={tableHeaderStyle}>
                Status
              </th>

            </tr>

          </thead>


          <tbody>

            {parcels.map((parcel) => (

              <tr key={parcel.id}>

                <td style={tableCellStyle}>
                  #{parcel.id}
                </td>

                <td style={tableCellStyle}>
                  {parcel.receiver_name}
                </td>

                <td style={tableCellStyle}>
                  {parcel.pickup_address}
                </td>

                <td style={tableCellStyle}>
                  {parcel.delivery_address}
                </td>

                <td style={tableCellStyle}>
                  {parcel.parcel_type}
                </td>

                <td style={tableCellStyle}>
                  {parcel.weight}
                </td>

                <td style={tableCellStyle}>
                  ₹{parcel.price}
                </td>


                {/* =================================================
                    CAPTAIN
                ================================================= */}

                <td style={tableCellStyle}>

                  <span
                    style={{
                      padding: "5px 10px",
                      borderRadius: "20px",

                      backgroundColor:
                        parcel.captain_name === "Not Assigned"
                          ? "#f1f5f9"
                          : "#ede9fe",

                      color:
                        parcel.captain_name === "Not Assigned"
                          ? "#64748b"
                          : "#6d28d9",

                      fontSize: "13px",
                      fontWeight: "600",
                    }}
                  >

                    {parcel.captain_name}

                  </span>

                </td>


                {/* =================================================
                    STATUS
                ================================================= */}

                <td style={tableCellStyle}>

                  <span
                    style={{
                      padding: "5px 10px",
                      borderRadius: "20px",

                      backgroundColor:
                        parcel.status === "Delivered"
                          ? "#dcfce7"
                          : "#ffedd5",

                      color:
                        parcel.status === "Delivered"
                          ? "#166534"
                          : "#c2410c",

                      fontSize: "13px",
                      fontWeight: "600",
                    }}
                  >

                    {parcel.status}

                  </span>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );
}


// =====================================================
// TABLE STYLES
// =====================================================

const tableHeaderStyle = {
  padding: "14px",
  textAlign: "left",
  borderBottom: "2px solid #e2e8f0",
  color: "#334155",
  fontSize: "14px",
};

const tableCellStyle = {
  padding: "14px",
  borderBottom: "1px solid #e2e8f0",
  color: "#475569",
  fontSize: "14px",
};


export default AdminDashboard;