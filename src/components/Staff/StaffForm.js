import React, { useState, useEffect } from "react";
import { addStaff, editStaff, getStaff } from "../../api/staffApi";

export default function StaffForm({ staffId, onSuccess }) {
  const [form, setForm] = useState({
    staffId: "",
    name: "",
    dob: "",
    mobile: "",
    email: "",
    aadhar: "",
    pan: "",
    role: "employee",
    department: "",
    designation: "",
    joiningDate: "",
    status: "Active",
    photo: null,
  });

  // Load staff data for Edit
  useEffect(() => {
    if (staffId) {
      getStaff(staffId).then((res) => {
        const s = res.data;
        setForm({
          staffId: s.staffId || "",
          name: s.name || "",
          dob: s.dob ? s.dob.slice(0, 10) : "",
          mobile: s.mobile || "",
          email: s.email || "",
          aadhar: s.aadhar || "",
          pan: s.pan || "",
          role: s.role || "employee",
          department: s.department || "",
          designation: s.designation || "",
          joiningDate: s.joiningDate ? s.joiningDate.slice(0, 10) : "",
          status: s.status || "Active",
          photo: null,
        });
      });
    }
  }, [staffId]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) setForm({ ...form, [name]: files[0] });
    else setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    for (let key in form) {
      if (form[key] !== null) formData.append(key, form[key]);
    }

    try {
      if (staffId) await editStaff(staffId, formData);
      else await addStaff(formData);

      alert("Saved successfully!");
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      alert("Error saving staff");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: "auto" }}>
      <h2>{staffId ? "Edit Staff" : "Add Staff"}</h2>

      <label>Staff ID:</label>
      <input name="staffId" value={form.staffId} onChange={handleChange} required />

      <label>Name:</label>
      <input name="name" value={form.name} onChange={handleChange} required />

      <label>DOB:</label>
      <input type="date" name="dob" value={form.dob} onChange={handleChange} />

      <label>Mobile:</label>
      <input name="mobile" value={form.mobile} onChange={handleChange} />

      <label>Email:</label>
      <input type="email" name="email" value={form.email} onChange={handleChange} />

      <label>Aadhar:</label>
      <input name="aadhar" value={form.aadhar} onChange={handleChange} />

      <label>PAN:</label>
      <input name="pan" value={form.pan} onChange={handleChange} />

      <label>Role:</label>
      <select name="role" value={form.role} onChange={handleChange}>
        <option value="admin">Admin</option>
        <option value="employee">Employee</option>
        <option value="manager">Manager</option>
      </select>

      <label>Department:</label>
      <input name="department" value={form.department} onChange={handleChange} />

      <label>Designation:</label>
      <input name="designation" value={form.designation} onChange={handleChange} />

      <label>Joining Date:</label>
      <input type="date" name="joiningDate" value={form.joiningDate} onChange={handleChange} />

      <label>Status:</label>
      <select name="status" value={form.status} onChange={handleChange}>
        <option value="Active">Active</option>
        <option value="Inactive">Inactive</option>
      </select>

      <label>Photo:</label>
      <input type="file" name="photo" onChange={handleChange} />

      <button type="submit">{staffId ? "Update" : "Add"}</button>
    </form>
  );
}