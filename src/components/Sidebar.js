// src/components/Sidebar.js
import React, { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import LiquidBackground from "https://cdn.jsdelivr.net/npm/threejs-components@0.0.27/build/backgrounds/liquid1.min.js";
import {
  FaHome,
  FaUsers,
  FaMoneyCheckAlt,
  FaHistory,
  FaUserPlus,
  FaChartBar,
  FaProjectDiagram,
  FaChevronDown,
  FaChevronUp,
  FaSignOutAlt,
  FaUser,
  FaClipboardList,
} from "react-icons/fa";

export default function Sidebar({ user, handleLogout }) {
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState({});
  const canvasRef = useRef(null);

  if (!user) return null;

  useEffect(() => {
    if (!canvasRef.current) return;

    const app = LiquidBackground(canvasRef.current);
    app.loadImage(
      "https://images.unsplash.com/photo-1562016600-ece13e8ba570?auto=format&fit=crop&w=1200&q=80"
    );
    app.liquidPlane.material.metalness = 0.85;
    app.liquidPlane.material.roughness = 0.25;
    app.liquidPlane.uniforms.displacementScale.value = 3;
    app.setRain(false);

    const resize = () => {
      canvasRef.current.width = 250;
      canvasRef.current.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      app?.dispose?.();
    };
  }, []);

  const toggleMenu = (menuName) => {
    setOpenMenus((prev) => ({ ...prev, [menuName]: !prev[menuName] }));
  };

  const isSubmenuActive = (submenu, mainPath) =>
    submenu
      ? location.pathname === mainPath ||
        submenu.some((item) => item.path === location.pathname)
      : false;

  /* ================= LINKS ================= */

  const baseLinks = [
    { name: "Dashboard", path: "/dashboard", icon: <FaHome /> },
    {
      name: "Customers",
      path: "/customers",
      icon: <FaUsers />,
      submenu: [
        { name: "All Customers", path: "/customers" },
        { name: "Active Customers", path: "/customers/active" },
        { name: "Inactive Customers", path: "/customers/inactive" },
        { name: "Customer Analytics", path: "/customers/analytics" },
      ],
    },
    { name: "Installments", path: "/installments", icon: <FaMoneyCheckAlt /> },
    { name: "Activity Log", path: "/activity-log", icon: <FaHistory /> },
  ];

  const adminLinks = [
    { name: "Add Customer", path: "/add-customer", icon: <FaUserPlus /> },
    { name: "Reports", path: "/reports", icon: <FaChartBar /> },
    { name: "Projects", path: "/projects", icon: <FaProjectDiagram /> },
    { name: "Staff List", path: "/admin/staff-list", icon: <FaUser /> },
  ];

  const userLinks = [
    { name: "My Profile", path: "/profile", icon: <FaUser /> },
    { name: "My Work Logs", path: "/my-worklogs", icon: <FaClipboardList /> },
  ];

  return (
    <div
      className="elastic-sidebar"
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: "250px",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        zIndex: 1000,
        background: "#1f2a49",
        color: "#fff",
      }}
    >
      {/* Background */}
      <canvas
        ref={canvasRef}
        className="sidebar-liquid-canvas"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "250px",
          height: "100vh",
        }}
      />

      {/* Logo */}
      <div
        className="sidebar-logo"
        style={{ padding: "20px", zIndex: 2, position: "relative" }}
      >
        <img src="/favicon.png" alt="logo" />
        <h1>Zamin Pvt Ltd</h1>
      </div>

      {/* Navigation */}
      <nav
        className="sidebar-nav"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          zIndex: 2,
          position: "relative",
        }}
      >
        <ul style={{ flex: 1, display: "flex", flexDirection: "column", padding: 0, margin: 0 }}>
          {/* COMMON LINKS */}
          {baseLinks.map((link) => (
            <li key={link.name}>
              {link.submenu ? (
                <>
                  <div
                    className={`elastic-link submenu-toggle ${
                      isSubmenuActive(link.submenu, link.path) ? "active" : ""
                    }`}
                    onClick={() => toggleMenu(link.name)}
                  >
                    <span className="icon">{link.icon}</span>
                    {link.name}
                    <span className="submenu-icon">
                      {openMenus[link.name] || isSubmenuActive(link.submenu, link.path) ? (
                        <FaChevronUp />
                      ) : (
                        <FaChevronDown />
                      )}
                    </span>
                  </div>
                  {(openMenus[link.name] || isSubmenuActive(link.submenu, link.path)) && (
                    <ul className="submenu">
                      {link.submenu.map((sub) => (
                        <li key={sub.path}>
                          <NavLink
                            to={sub.path}
                            className={({ isActive }) => `elastic-link ${isActive ? "active" : ""}`}
                          >
                            {sub.name}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <NavLink
                  to={link.path}
                  className={({ isActive }) => `elastic-link ${isActive ? "active" : ""}`}
                >
                  <span className="icon">{link.icon}</span>
                  {link.name}
                </NavLink>
              )}
            </li>
          ))}

          {/* USER LINKS */}
          {user.role === "user" &&
            userLinks.map((link) => (
              <li key={link.path}>
                <NavLink
                  to={link.path}
                  className={({ isActive }) => `elastic-link ${isActive ? "active" : ""}`}
                >
                  <span className="icon">{link.icon}</span>
                  {link.name}
                </NavLink>
              </li>
            ))}

          {/* ADMIN LINKS */}
          {user.role === "admin" &&
            adminLinks.map((link) => (
              <li key={link.path}>
                <NavLink
                  to={link.path}
                  className={({ isActive }) => `elastic-link ${isActive ? "active" : ""}`}
                >
                  <span className="icon">{link.icon}</span>
                  {link.name}
                </NavLink>
              </li>
            ))}

          {/* LOGOUT */}
          <li style={{ marginTop: "auto" }}>
            <div
              className="elastic-link logout-link"
              onClick={(e) => {
                e.preventDefault();
                handleLogout();
              }}
              style={{
                color: "#ff4d4f",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 15px",
              }}
            >
              <FaSignOutAlt />
              Logout
            </div>
          </li>
        </ul>
      </nav>
    </div>
  );
}