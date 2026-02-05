import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/ActivityLogPage.css";

const ActivityLogPage = () => {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 20;

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get("https://zaminwale-crm-backend-yztw.onrender.com/api/activity-log");
        setLogs(res.data);
      } catch (err) {
        console.error("Error fetching logs:", err);
      }
    };
    fetchLogs();
  }, []);

  const now = new Date();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const startOfWeek = new Date();
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  // Filter logs by date and search
  const filteredLogs = logs
    .filter((log) => {
      const logTime = new Date(log.timestamp);
      if (filter === "today") return logTime >= startOfToday;
      if (filter === "week") return logTime >= startOfWeek;
      return true;
    })
    .filter(
      (log) =>
        log.user?.toLowerCase().includes(search.toLowerCase()) ||
        log.action?.toLowerCase().includes(search.toLowerCase()) ||
        (log.module && log.module.toLowerCase().includes(search.toLowerCase())) ||
        (log.details &&
          JSON.stringify(log.details).toLowerCase().includes(search.toLowerCase())) ||
        (log.customerId && log.customerId.toLowerCase().includes(search.toLowerCase()))
    );

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredLogs.length / recordsPerPage);

  // Render details in proper format
  const renderDetails = (details) => {
    if (!details) return "-";

    if (
      typeof details === "object" &&
      !Array.isArray(details) &&
      Object.values(details).some(
        (val) => val && val.oldValue !== undefined && val.newValue !== undefined
      )
    ) {
      return Object.keys(details).map((key, idx) => {
        const field = details[key];
        if (field.oldValue !== undefined && field.newValue !== undefined) {
          return (
            <div key={idx}>
              <strong>{key}</strong>:{" "}
              <span style={{ textDecoration: "line-through", color: "red" }}>
                {field.oldValue || "-"}
              </span>{" "}
              ➔ <span style={{ color: "green" }}>{field.newValue || "-"}</span>
            </div>
          );
        }
        return null;
      });
    }

    return JSON.stringify(details);
  };

  return (
    <div className="activity-log-container">
      <h2>Activity Log</h2>

      <div className="controls">
        <div className="filter-buttons">
          <button className={filter === "today" ? "active" : ""} onClick={() => setFilter("today")}>
            Today
          </button>
          <button className={filter === "week" ? "active" : ""} onClick={() => setFilter("week")}>
            This Week
          </button>
          <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>
            All
          </button>
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by user, customer ID, action, module or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filteredLogs.length === 0 ? (
        <p className="no-logs">No activity logs found.</p>
      ) : (
        <>
          <table className="activity-table">
            <thead>
              <tr>
                <th>Sr No.</th>
                <th>User</th>
                <th>Customer ID</th>
                <th>Action</th>
                <th>Module / Details</th>
                <th>Date & Time</th>
              </tr>
            </thead>
            <tbody>
              {currentLogs.map((log, idx) => (
                <tr key={log._id || idx}>
                  <td>{indexOfFirstRecord + idx + 1}</td>
                  <td>{log.user}</td>
                  <td>{log.customerId || "-"}</td>
                  <td
                    style={{
                      color:
                        log.action === "DELETE"
                          ? "red"
                          : log.action === "ADD"
                          ? "green"
                          : "blue",
                    }}
                  >
                    {log.action}
                  </td>
                  <td style={{ minWidth: "200px", wordBreak: "break-word", textAlign: "left" }}>
                    <strong>{log.module || "-"}</strong>
                    <div>{renderDetails(log.details)}</div>
                  </td>
                  <td>{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            <button
              onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>

            <span>
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ActivityLogPage;
