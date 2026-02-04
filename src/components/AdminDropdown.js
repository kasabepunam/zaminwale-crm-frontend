// src/components/AdminDropdown.js
import React, { useState, useRef, useEffect } from "react";
import { FaUserCircle } from "react-icons/fa";
import "../styles/AdminDropdown.css";

const AdminDropdown = ({ adminName, handleLogout }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  const toggleDropdown = () => setOpen(!open);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Logout with confirmation
  const confirmLogout = () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (confirmed) {
      handleLogout();
    }
  };

  return (
    <div className="admin-dropdown" ref={dropdownRef}>
      {/* Toggle */}
      <div className="admin-toggle" onClick={toggleDropdown}>
        <FaUserCircle className="admin-icon" />
        <span className="admin-name">{adminName}</span>
      </div>

      {/* Dropdown Menu */}
      {open && (
        <div className="admin-menu">
          <div className="admin-menu-item">Profile</div>
          <div className="admin-menu-item" onClick={confirmLogout}>
            Logout
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDropdown;
