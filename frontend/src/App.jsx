import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// =====================================================
// PUBLIC PAGES
// =====================================================

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOTP from "./pages/VerifyOTP";
import ResetPassword from "./pages/ResetPassword";

// =====================================================
// USER PAGES
// =====================================================

import Dashboard from "./pages/Dashboard";
import BookParcel from "./pages/BookParcel";
import MyParcels from "./pages/MyParcels";
import Payment from "./pages/Payment";

// =====================================================
// CAPTAIN
// =====================================================

import CaptainDashboard from "./pages/CaptainDashboard";

// =====================================================
// ADMIN
// =====================================================

import AdminDashboard from "./AdminDashboard";

// =====================================================
// WEBSOCKET TEST
// =====================================================

import WebSocketTest from "./WebSocketTest";


// =====================================================
// PROTECTED ROUTE
// =====================================================

function ProtectedRoute({
  children,
  allowedRoles = [],
}) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // User login cheyyakapothe Login page ki
  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  // Role restriction
  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(role)
  ) {
    // Admin
    if (role === "admin") {
      return (
        <Navigate
          to="/admin"
          replace
        />
      );
    }

    // Captain
    if (role === "captain") {
      return (
        <Navigate
          to="/captain"
          replace
        />
      );
    }

    // Normal User
    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }

  return children;
}


// =====================================================
// APP
// =====================================================

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* =================================================
            DEFAULT ROUTE
        ================================================= */}

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />


        {/* =================================================
            LOGIN
        ================================================= */}

        <Route
          path="/login"
          element={
            <Login />
          }
        />


        {/* =================================================
            REGISTER
        ================================================= */}

        <Route
          path="/register"
          element={
            <Register />
          }
        />


        {/* =================================================
            FORGOT PASSWORD
        ================================================= */}

        <Route
          path="/forgot-password"
          element={
            <ForgotPassword />
          }
        />


        {/* =================================================
            VERIFY OTP
        ================================================= */}

        <Route
          path="/verify-otp"
          element={
            <VerifyOTP />
          }
        />


        {/* =================================================
            RESET PASSWORD
        ================================================= */}

        <Route
          path="/reset-password"
          element={
            <ResetPassword />
          }
        />


        {/* =================================================
            USER DASHBOARD
        ================================================= */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute
              allowedRoles={["user"]}
            >
              <Dashboard />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            BOOK PARCEL
        ================================================= */}

        <Route
          path="/book-parcel"
          element={
            <ProtectedRoute
              allowedRoles={["user"]}
            >
              <BookParcel />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            MY PARCELS
        ================================================= */}

        <Route
          path="/my-parcels"
          element={
            <ProtectedRoute
              allowedRoles={["user"]}
            >
              <MyParcels />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            PAYMENT
        ================================================= */}

        <Route
          path="/payment"
          element={
            <ProtectedRoute
              allowedRoles={["user"]}
            >
              <Payment />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            CAPTAIN DASHBOARD
        ================================================= */}

        <Route
          path="/captain"
          element={
            <ProtectedRoute
              allowedRoles={["captain"]}
            >
              <CaptainDashboard />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            ADMIN DASHBOARD
        ================================================= */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute
              allowedRoles={["admin"]}
            >
              <AdminDashboard />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            WEBSOCKET TEST
        ================================================= */}

        <Route
          path="/websocket-test"
          element={
            <ProtectedRoute
              allowedRoles={[
                "user",
                "captain",
                "admin",
              ]}
            >
              <WebSocketTest />
            </ProtectedRoute>
          }
        />


        {/* =================================================
            UNKNOWN URL
        ================================================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}


// =====================================================
// EXPORT
// =====================================================

export default App;