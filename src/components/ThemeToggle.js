import React, { useState, useEffect } from "react";
import { FaMoon, FaSun } from "react-icons/fa";
import "../styles/ThemeToggle.css";

const ThemeToggle = () => {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark" || false
  );

  // Apply theme on load and when toggled
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark-theme");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark-theme");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <button
      className="theme-toggle-btn"
      onClick={() => setDarkMode(!darkMode)}
    >
      {darkMode ? <FaSun className="icon-light" /> : <FaMoon className="icon-dark" />}
    </button>
  );
};

export default ThemeToggle;
