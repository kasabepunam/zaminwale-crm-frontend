// src/Staff/StaffWorkLogs.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

const StaffWorkLogs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [logs, search, filter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let res;
      if (isAdmin) {
        res = await axios.get("http://localhost:5000/api/work/all");
      } else {
        res = await axios.get(`http://localhost:5000/api/work/my/${user._id}`);
      }
      setLogs(res.data);
    } catch (err) {
      console.error("Fetch Error:", err);
      alert("Failed to fetch work logs");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let temp = [...logs];

    // Filter by search
    if (search) {
      temp = temp.filter((log) =>
        isAdmin
          ? log.userName.toLowerCase().includes(search.toLowerCase())
          : log.work.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filter by date
    const today = new Date();
    if (filter === "Today") {
      temp = temp.filter(
        (log) => new Date(log.date).toDateString() === today.toDateString()
      );
    } else if (filter === "This Month") {
      temp = temp.filter(
        (log) =>
          new Date(log.date).getMonth() === today.getMonth() &&
          new Date(log.date).getFullYear() === today.getFullYear()
      );
    }

    setFilteredLogs(temp);
  };

  const handleExport = () => {
    if (filteredLogs.length === 0) {
      alert("No data to export");
      return;
    }

    const dataToExport = filteredLogs.map((log, index) => ({
      "Sr No": index + 1,
      Date: new Date(log.date).toLocaleDateString(),
      "Staff Name": log.userName || "—",
      Work: log.work,
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "WorkLogs");
    XLSX.writeFile(wb, "StaffWorkLogs.xlsx");
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "auto", padding: "20px" }}>
      <h2 style={{ marginBottom: "20px" }}>
        {isAdmin ? "All Staff Work Logs" : "My Work Logs"}
      </h2>

      {/* Search + Filter + Export */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <input
          type="text"
          placeholder={isAdmin ? "Search by Staff Name..." : "Search work..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "8px",
            flex: "1",
            minWidth: "200px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: "8px",
            borderRadius: "5px",
            border: "1px solid #ccc",
          }}
        >
          <option value="All">All</option>
          <option value="Today">Today</option>
          <option value="This Month">This Month</option>
        </select>

        <button
          onClick={handleExport}
          style={{
            padding: "8px 15px",
            background: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Export CSV
        </button>
      </div>

      {/* Logs Table */}
      {loading ? (
        <p>Loading logs...</p>
      ) : (
        <table
          width="100%"
          style={{
            borderCollapse: "collapse",
            background: "#fff",
            boxShadow: "0 0 5px rgba(0,0,0,0.1)",
          }}
        >
          <thead>
            <tr style={{ background: "linear-gradient(90deg,#4a6cf7,#3a57d1)", color: "#fff" }}>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Sr No</th>
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Date</th>
              {isAdmin && <th style={{ padding: "10px", border: "1px solid #ddd" }}>Staff Name</th>}
              <th style={{ padding: "10px", border: "1px solid #ddd" }}>Work</th>
            </tr>
          </thead>

          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td
                  colSpan={isAdmin ? 4 : 3}
                  align="center"
                  style={{ padding: "15px" }}
                >
                  No work found
                </td>
              </tr>
            ) : (
              filteredLogs.map((log, index) => (
                <tr key={log._id}>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{index + 1}</td>
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                    {new Date(log.date).toLocaleDateString()}
                  </td>
                  {isAdmin && (
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                      {log.userName || "—"}
                    </td>
                  )}
                  <td style={{ padding: "10px", border: "1px solid #ddd" }}>{log.work}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default StaffWorkLogs;