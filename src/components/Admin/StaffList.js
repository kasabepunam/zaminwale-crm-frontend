// File: StaffList.js

import React, { useEffect, useState } from "react";
import axios from "axios";
import "./StaffList.css";

export default function StaffList({ currentUser }) {
  const [staff, setStaff] = useState([]);

  /* ================= FORM STATES ================= */

  const [staffId, setStaffId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [dob, setDob] = useState("");
  const [aadhar, setAadhar] = useState("");
  const [pan, setPan] = useState("");

  const [department, setDepartment] = useState("");
  const [designation, setDesignation] = useState("");

  const [joiningDate, setJoiningDate] = useState("");
  const [status, setStatus] = useState("Active");

  const [role, setRole] = useState("user");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  /* ================= FETCH STAFF ================= */

  const fetchStaff = async () => {
    try {
      setPageLoading(true);

      const res = await axios.get(
        "http://localhost:5001/api/staff"
      );

      if (Array.isArray(res.data)) {
        setStaff(res.data);
      } else {
        setStaff([]);
      }

    } catch (err) {
      console.error("Fetch Staff Error:", err);

      alert("❌ Failed to fetch staff");

      setStaff([]);

    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  /* ================= ADD STAFF ================= */

  const handleAddStaff = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      return alert("Name, Email & Password required");
    }

    setLoading(true);

    try {
      await axios.post(
        "http://localhost:5001/api/staff",
        {
          staffId,
          name,
          email,
          phone,

          dob,
          aadhar,
          pan,

          department,
          designation,

          joiningDate,
          status,

          role,
          password,
        }
      );

      alert("✅ Staff Added Successfully");

      fetchStaff();

      /* Clear Form */

      setStaffId("");
      setName("");
      setEmail("");
      setPhone("");

      setDob("");
      setAadhar("");
      setPan("");

      setDepartment("");
      setDesignation("");

      setJoiningDate("");
      setStatus("Active");

      setRole("user");
      setPassword("");

    } catch (err) {
      console.error("Add Staff Error:", err);

      alert(
        err.response?.data?.message ||
        "❌ Error adding staff"
      );

    } finally {
      setLoading(false);
    }
  };

  /* ================= SECURITY ================= */

  if (!currentUser) {
    return <h3>Loading...</h3>;
  }

  if (currentUser.role !== "admin") {
    return <h2>⛔ Admin Access Only</h2>;
  }

  /* ================= RENDER ================= */

  return (
    <div className="staff-list-container">

      {/* Header */}
      <div className="staff-list-header">
        <h2>Staff Management (Admin)</h2>
      </div>

      {/* ================= ADD FORM ================= */}

      <form
        className="staff-list-filters"
        onSubmit={handleAddStaff}
      >

        <input
          type="text"
          placeholder="Staff ID"
          value={staffId}
          onChange={(e) => setStaffId(e.target.value)}
        />

        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
        />

        <input
          type="text"
          placeholder="Aadhaar"
          value={aadhar}
          onChange={(e) => setAadhar(e.target.value)}
        />

        <input
          type="text"
          placeholder="PAN"
          value={pan}
          onChange={(e) => setPan(e.target.value)}
        />

        <input
          type="text"
          placeholder="Department"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        />

        <input
          type="text"
          placeholder="Designation"
          value={designation}
          onChange={(e) => setDesignation(e.target.value)}
        />

        <input
          type="date"
          value={joiningDate}
          onChange={(e) => setJoiningDate(e.target.value)}
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Staff"}
        </button>

      </form>

      {/* ================= TABLE ================= */}

      {pageLoading ? (

        <p>Loading staff...</p>

      ) : staff.length === 0 ? (

        <p>No staff found.</p>

      ) : (

        <table className="staff-list-table">

          <thead>
            <tr>
              <th>Staff ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>DOB</th>
              <th>Aadhaar</th>
              <th>PAN</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Joining Date</th>
              <th>Status</th>
              <th>Role</th>
              <th>Created At</th>
            </tr>
          </thead>

          <tbody>

            {staff.map((s) => (

              <tr key={s._id}>

                <td>{s.staffId || "-"}</td>

                <td>{s.name}</td>

                <td>{s.email}</td>

                <td>{s.phone || "-"}</td>

                <td>
                  {s.dob
                    ? new Date(s.dob).toLocaleDateString()
                    : "-"
                  }
                </td>

                <td>{s.aadhar || "-"}</td>

                <td>{s.pan || "-"}</td>

                <td>{s.department || "-"}</td>

                <td>{s.designation || "-"}</td>

                <td>
                  {s.joiningDate
                    ? new Date(s.joiningDate).toLocaleDateString()
                    : "-"
                  }
                </td>

                <td>{s.status || "-"}</td>

                <td>{s.role}</td>

                <td>
                  {new Date(s.createdAt).toLocaleString()}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      )}

    </div>
  );
}