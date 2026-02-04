import React, { useState, useEffect } from "react";
import "../styles/StaffWorkReport.css";
import * as XLSX from "xlsx";

// Dummy data for demonstration
const dummyReports = [
  { id: 1, date: "2026-01-20", staffName: "John Doe", staffId: "S101", task: "Website Design", hours: 5, status: "Completed", remarks: "Done on time" },
  { id: 2, date: "2026-01-21", staffName: "Jane Smith", staffId: "S102", task: "Database Setup", hours: 3, status: "Pending", remarks: "Waiting for approval" },
  { id: 3, date: "2026-01-22", staffName: "John Doe", staffId: "S101", task: "React Components", hours: 4, status: "Completed", remarks: "" },
];

export default function StaffWorkReport() {
  const [reports, setReports] = useState([]);
  const [filterStaff, setFilterStaff] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [userRole, setUserRole] = useState("user"); // "admin" or "user"

  useEffect(() => {
    // Normally fetch from API
    setReports(dummyReports);

    // Example: get user role from localStorage
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser?.role) setUserRole(storedUser.role.toLowerCase());
  }, []);

  // Filtered data
  const filteredReports = reports.filter(r => {
    return (filterStaff === "All" || r.staffName === filterStaff) &&
           (filterStatus === "All" || r.status === filterStatus);
  });

  // Summary
  const totalLogs = filteredReports.length;
  const completedLogs = filteredReports.filter(r => r.status === "Completed").length;
  const pendingLogs = filteredReports.filter(r => r.status === "Pending").length;

  // Export to Excel
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredReports);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "WorkReports");
    XLSX.writeFile(wb, "StaffWorkReports.xlsx");
  };

  return (
    <div className="workreport-page">
      <h2>Staff Work Report</h2>

      {/* Filters */}
      <div className="filters">
        <select value={filterStaff} onChange={e => setFilterStaff(e.target.value)}>
          <option value="All">All Staff</option>
          {[...new Set(reports.map(r => r.staffName))].map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>

        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="All">All Status</option>
          <option value="Completed">Completed</option>
          <option value="Pending">Pending</option>
        </select>

        <button className="btn" onClick={exportToExcel}>Export Excel</button>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="card">Total Logs: {totalLogs}</div>
        <div className="card completed">Completed: {completedLogs}</div>
        <div className="card pending">Pending: {pendingLogs}</div>
      </div>

      {/* Worklogs Table */}
      <table className="workreport-table">
        <thead>
          <tr>
            <th>Sr No</th>
            <th>Date</th>
            <th>Staff Name</th>
            <th>Task</th>
            <th>Hours</th>
            <th>Status</th>
            <th>Remarks</th>
            {userRole === "admin" && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {filteredReports.length === 0 ? (
            <tr><td colSpan={userRole === "admin" ? 8 : 7}>No records found.</td></tr>
          ) : (
            filteredReports.map((r, index) => (
              <tr key={r.id}>
                <td>{index + 1}</td>
                <td>{r.date}</td>
                <td>{r.staffName}</td>
                <td>{r.task}</td>
                <td>{r.hours}</td>
                <td className={r.status.toLowerCase()}>{r.status}</td>
                <td>{r.remarks || "-"}</td>
                {userRole === "admin" && (
                  <td>
                    <button className="btn outline small">Edit</button>
                    <button className="btn danger small">Delete</button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}