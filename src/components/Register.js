import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css"; // same style reuse

const API = process.env.REACT_APP_API_URL || "http://localhost:5001";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axios.post(`${API}/api/auth/register`, form);

      alert("✅ Account Created Successfully!");
      navigate("/login");

    } catch (err) {
      setError(err.response?.data?.msg || "User already exists");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">

      <div className="login-right" style={{ width: "100%" }}>
        <div className="login-box">

          <h2>Create Account</h2>

          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={submit} className="login-form">

            <input
              name="name"
              placeholder="Full Name"
              onChange={handleChange}
              required
            />

            <input
              name="email"
              type="email"
              placeholder="Email"
              onChange={handleChange}
              required
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              onChange={handleChange}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Register"}
            </button>

          </form>

          <div className="register-link">
            Already have account?{" "}
            <span onClick={() => navigate("/login")}>
              Login
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
