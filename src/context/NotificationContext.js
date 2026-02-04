// src/context/NotificationContext.js
import React, { createContext, useState, useEffect } from "react";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Add new notification
  const addNotification = (type, message, link = "#") => {
    const newNotification = {
      id: Date.now(),
      type,       // e.g., 'add-customer', 'installment', 'due-date'
      message,
      link,
      read: false,
      date: new Date(),
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  // Mark as read
  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // Clear all
  const clearAll = () => setNotifications([]);

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, markAsRead, clearAll }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
