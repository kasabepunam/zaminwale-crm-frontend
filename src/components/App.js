// File: frontend/src/App.js
import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";

/* Components */
import Sidebar from "./Sidebar.js";
import Dashboard from "./Dashboard.js";
import CustomerList from "./CustomerList.js";
import ActiveCustomers from "./ActiveCustomers.js";
import InactiveCustomers from "./InactiveCustomers.js";
import CustomerAnalytics from "./CustomerAnalytics.js";
import AddCustomer from "./AddCustomer.js";
import Reports from "./Reports.js";
import Installments from "./Installments.js";
import Login from "./Login.js";
import Register from "./Register.js";
import Profile from "./Profile.js";
import Villa99Revenue from "./Villa99Revenue.js";
import CustomerPreview from "./CustomerPreview.js";
import TotalReceived from "./TotalReceived.js";
import TotalCollection from "./TotalCollection.js";
import ProjectLocation from "./ProjectLocation.js";
import ActivityLogPage from "./ActivityLogPage.js";

/* Staff / Admin */
import StaffWorkLogs from "./Staff/StaffWorkLogs.js";
import StaffList from "./Admin/StaffList.js";

/* Context */
import { CustomerProvider } from "../context/CustomerContext.js";
import { NotificationProvider } from "../context/NotificationContext.js";

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  /* ================= LOAD USER ================= */
  useEffect(() => {
    const stored = localStorage.getItem("user");

    if (stored && stored !== "undefined") {
      try {
        const parsedUser = JSON.parse(stored);
        if (parsedUser?.email && parsedUser?.role) {
          setUser(parsedUser);

          // Redirect logged-in users from public pages
          if (["/", "/login", "/register"].includes(location.pathname)) {
            navigate("/dashboard", { replace: true });
          }
        } else {
          throw new Error("Invalid user data");
        }
      } catch (err) {
        console.log("Invalid localStorage user, clearing...", err);
        localStorage.removeItem("user");
        setUser(null);
        navigate("/login", { replace: true });
      }
    } else {
      setUser(null);
      if (!["/login", "/register"].includes(location.pathname)) {
        navigate("/login", { replace: true });
      }
    }
  }, [navigate, location.pathname]);

  /* ================= SAVE LAST PAGE ================= */
  useEffect(() => {
    if (user && location.pathname !== "/login") {
      localStorage.setItem("lastPage", location.pathname);
    }
  }, [user, location.pathname]);

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    if (window.confirm("Do you want to logout?")) {
      localStorage.clear();
      setUser(null);
      navigate("/login", { replace: true });
    }
  };

  return (
    <CustomerProvider>
      <NotificationProvider>
        <div style={{ display: "flex", minHeight: "100vh" }}>
          {user && <Sidebar user={user} handleLogout={handleLogout} />}

          <div
            style={{
              flex: 1,
              padding: "20px",
              background: "#f5f5f5",
              marginLeft: user ? "140px" : "0px",
              height: "100vh",
              overflowY: "auto",
            }}
          >
            {user ? (
              /* ================= PRIVATE ROUTES ================= */
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard user={user} />} />
                <Route path="/dashboard/99villa" element={<Villa99Revenue />} />
                <Route path="/profile" element={<Profile user={user} />} />

                {/* Staff / User Routes */}
                {(user.role === "user" || user.role === "staff") && (
                  <Route
                    path="/my-worklogs"
                    element={<StaffWorkLogs currentUser={user} />}
                  />
                )}

                {/* Admin Routes */}
                {user.role === "admin" && (
                  <>
                    <Route
                      path="/admin/worklogs"
                      element={<StaffWorkLogs currentUser={user} />}
                    />
                    <Route
                      path="/admin/staff-list"
                      element={<StaffList currentUser={user} />}
                    />
                    <Route path="/add-customer" element={<AddCustomer />} />
                    <Route path="/reports" element={<Reports user={user} />} />
                    <Route path="/project-location" element={<ProjectLocation />} />
                  </>
                )}

                {/* Customer Routes */}
                <Route path="/customers" element={<CustomerList user={user} />} />
                <Route path="/customers/active" element={<ActiveCustomers />} />
                <Route path="/customers/inactive" element={<InactiveCustomers />} />
                <Route path="/customers/analytics" element={<CustomerAnalytics />} />
                <Route path="/customer-preview/:id" element={<CustomerPreview />} />

                {/* Collection / Installments */}
                <Route path="/total-received" element={<TotalReceived />} />
                <Route path="/total-collection" element={<TotalCollection />} />
                <Route path="/installments" element={<Installments />} />
                <Route path="/activity-log" element={<ActivityLogPage />} />

                {/* Fallback */}
                <Route
                  path="*"
                  element={
                    <Navigate
                      to={localStorage.getItem("lastPage") || "/dashboard"}
                      replace
                    />
                  }
                />
              </Routes>
            ) : (
              /* ================= PUBLIC ROUTES ================= */
              <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<Login setUser={setUser} />} />
                <Route path="/register" element={<Register />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            )}
          </div>
        </div>
      </NotificationProvider>
    </CustomerProvider>
  );
}

export default App;
