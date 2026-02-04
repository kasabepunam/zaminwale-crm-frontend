import React, { useContext, useState, useRef, useEffect } from "react";
import { NotificationContext } from "../context/NotificationContext.js";
import { FaBell } from "react-icons/fa";
import { Link } from "react-router-dom";
import "../styles/NotificationBell.css";

const NotificationBell = () => {
  const { notifications, markAsRead, clearAll } = useContext(NotificationContext);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // ✅ Outside click handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="notification-bell" ref={dropdownRef}>
      <div className="bell-icon" onClick={() => setOpen(!open)}>
        <FaBell />
        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </div>

      {open && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
            <span>Notifications</span>
            <button onClick={clearAll}>Clear All</button>
          </div>
          <ul>
            {notifications.length === 0 && <li>No notifications</li>}
            {notifications.map((n) => (
              <li
                key={n.id}
                className={n.read ? "read" : "unread"}
                onClick={() => markAsRead(n.id)}
              >
                <Link to={n.link}>{n.message}</Link>
                <small>{new Date(n.date).toLocaleString()}</small>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
