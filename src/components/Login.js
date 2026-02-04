import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css"; // CSS for layout & styling


export default function Login({ setUser }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const users = [
    { name: "Admin", email: "zaminwale@zaminwale.com", password: "Zaminwale@123", role: "admin" },
    { name: "Puja", email: "puja@zaminwale.com", password: "PujaZamin@123", role: "admin" },
    { name: "Rani", email: "rani@zaminwale.com", password: "RaniZamin@123", role: "admin" },
    { name: "Netra", email: "netra@zaminwale.com", password: "netra@zaminwale.com", role: "admin" },

    { name: "Suvarna", email: "suvarna@zaminwale.com", password: "Suvarna@123", role: "user" },
    { name: "Preeti", email: "preeti@zaminwale.com", password: "Preeti@123", role: "user" },
    { name: "Shrinivas", email: "shrinivas@zaminwale.com", password: "Shrinivas@123", role: "user" },
    { name: "Shalaka", email: "shalaka@zaminwale.com", password: "Shalaka@123", role: "user" },
    { name: "Javed", email: "javed4@zaminwale.com", password: "Javed@123", role: "user" },
    {
        name: "Thane User",
        email: "thanebranch@zaminwale.com",
        password: "Thane@123",
        role: "user",
        branch: "Thane",
      },
  ];

  const handleLogin = (e) => {
    e.preventDefault();

    const matchedUser = users.find(
      (user) => user.email === email && user.password === password
    );

    if (matchedUser) {
      const userData = {
        name: matchedUser.name,
        email: matchedUser.email,
        role: matchedUser.role,
        branch: matchedUser.branch,

      };

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);

      // Role-based redirect
      if (matchedUser.role === "admin") {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/dashboard-view", { replace: true });
      }
    } else {
      setError("Invalid Email or Password ❌");
    }
  };

  return (
    <div className="login-container">
      {/* Left Illustration */}
      <div className="login-left">
        <img
          src="/illustration.png"
          alt="illustration"
          className="login-illustration"
        />
      </div>

      {/* Right Login Box */}
      <div className="login-right">
        <div className="login-box">
          {/* Logo */}
          <div className="login-logo">
            <img
             src="/logo.png" alt="Zaminwale Logo" />
          </div>

          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && <p className="error">{error}</p>}
            <button type="submit">Login</button>
          </form>

          {/* Footer */}
          <div className="login-footer">
            &copy; {new Date().getFullYear()} Zaminwale Pvt. Ltd. All Rights Reserved.
          </div>
        </div>
      </div>
    </div>
  );
}
