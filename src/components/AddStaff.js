import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddStaff = ({ currentUser }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "user", // backend expects: admin / user (lowercase)
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5001/api/staff", // ✅ correct route
        formData
      );

      alert("✅ Staff added successfully!");
      console.log("Added:", res.data);

      navigate("/staff-list");
    } catch (err) {
      console.error("Add Staff Error:", err);

      alert(
        err.response?.data?.message ||
          "❌ Failed to add staff. Check server."
      );
    }
  };

  // Safety: if user not loaded yet
  if (!currentUser) {
    return <h3>Loading...</h3>;
  }

  // Only Admin Allowed
  if (currentUser.role !== "admin") {
    return <h2>⛔ Access Denied: Admin Only</h2>;
  }

  return (
    <div className="add-staff-page">
      <h1>Add New Staff</h1>

      <form className="add-staff-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleChange}
        />

        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
        >
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button type="submit">Add Staff</button>
      </form>
    </div>
  );
};

export default AddStaff;