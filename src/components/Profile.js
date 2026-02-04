import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Profile.css";

const API = process.env.REACT_APP_API_URL;

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));

    // ❌ User not found → clear storage + redirect
    if (!storedUser) {
      localStorage.clear();
      alert("Please login again");
      navigate("/login");
      return;
    }

    // ✅ Admin / Superadmin → no fetch needed
    if (storedUser.role === "admin" || storedUser.role === "superadmin") {
      setUser(storedUser);
      setLoading(false);
      return;
    }

    // ✅ Staff → fetch full profile from backend
    if (storedUser._id) {
      fetchProfile(storedUser._id);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = async (id) => {
    try {
      const res = await axios.get(`${API}/api/staff/${id}`);

      if (res.data) {
        setUser(res.data);
      } else {
        alert("Profile not found");
        localStorage.clear();
        navigate("/login");
      }

    } catch (err) {
      console.error("Profile Error:", err);
      localStorage.clear();
      alert("Session Expired. Please login again");
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>No Profile Found</p>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2>{user.name}</h2>
        <p>{user.role?.toUpperCase()}</p>

        <p><b>Email:</b> {user.email || "-"}</p>
        <p><b>Mobile:</b> {user.phone || "-"}</p>
        <p><b>Staff ID:</b> {user.staffId || "-"}</p>

        <p><b>DOB:</b> {user.dob?.slice(0, 10) || "-"}</p>
        <p><b>Aadhaar:</b> {user.aadhar || "-"}</p>
        <p><b>PAN:</b> {user.pan || "-"}</p>

        <p><b>Department:</b> {user.department || "-"}</p>
        <p><b>Designation:</b> {user.designation || "-"}</p>

        <p><b>Joining:</b> {user.joiningDate?.slice(0, 10) || "-"}</p>
        <p><b>Status:</b> {user.status || "-"}</p>
      </div>
    </div>
  );
}