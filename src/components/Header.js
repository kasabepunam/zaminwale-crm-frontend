// src/components/Header.js
import React from "react";
import AdminDropdown from "./AdminDropdown";

function Header({ user, handleLogout }) {
  return (
    <div className="header" style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "10px 20px",
      background: "#fff",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      borderRadius: "8px",
      marginBottom: "20px"
    }}>
      <h2>Dashboard</h2>
      <AdminDropdown adminName={user.name} handleLogout={handleLogout} />
    </div>
  );
}

export default Header;
