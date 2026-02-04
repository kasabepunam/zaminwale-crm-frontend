import React, { useContext, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CustomerContext } from "../context/CustomerContext.js";
import "../styles/ProjectCustomersPage.css";

function ProjectCustomersPage() {
  const { projectName } = useParams();
  const { customers } = useContext(CustomerContext);
  const navigate = useNavigate();

  // Filter customers for this project
  const projectCustomers = useMemo(
    () => customers.filter(
      (c) => c.project === projectName && (c.status === "Booking" || c.status === "Pending")
    ),
    [customers, projectName]
  );

  // Group by location and village
  const groupedData = useMemo(() => {
    const map = {};
    projectCustomers.forEach((c) => {
      const location = c.location || "Unknown";
      const village = c.village || "Unknown";
      if (!map[location]) map[location] = {};
      if (!map[location][village]) map[location][village] = [];
      map[location][village].push(c);
    });
    return map;
  }, [projectCustomers]);

  return (
    <div className="project-page">
      <div className="project-header">
        <h1>🏗️ Project: {projectName}</h1>
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          ← Back to Dashboard
        </button>
      </div>

      {Object.keys(groupedData).length === 0 ? (
        <p className="no-data">No customers found for this project.</p>
      ) : (
        Object.keys(groupedData).map((location) => (
          <div key={location} className="location-section">
            <h2>📍 {location}</h2>

            {Object.keys(groupedData[location]).map((village) => (
              <div key={village} className="village-section">
                <h3>🏘️ Village: {village}</h3>
                <table className="location-table">
                  <thead>
                    <tr>
                      <th>Customer ID</th>
                      <th>Name</th>
                      <th>Booking Date</th>
                      <th>Total Amount</th>
                      <th>Received</th>
                      <th>Balance</th>
                      <th>Status</th>
                      <th>Installments Pending</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedData[location][village].map((c) => {
                      const totalReceived = c.installments?.reduce(
                        (sum, i) => sum + parseFloat(i.receivedAmount || 0),
                        0
                      ) || 0;
                      const totalBalance = c.installments?.reduce(
                        (sum, i) => sum + parseFloat(i.balanceAmount || 0),
                        0
                      ) || 0;
                      const pendingCount = c.installments?.filter(i => !i.paid).length || 0;

                      return (
                        <tr key={c._id}>
                          <td>{c.id}</td>
                          <td>{c.name}</td>
                          <td>{c.bookingDate}</td>
                          <td>₹{c.totalAmount?.toLocaleString()}</td>
                          <td>₹{totalReceived.toLocaleString()}</td>
                          <td>₹{totalBalance.toLocaleString()}</td>
                          <td className={c.status === "Pending" ? "pending" : "active"}>
                            {c.status}
                          </td>
                          <td className={pendingCount > 0 ? "pending" : "active"}>
                            {pendingCount}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}

export default ProjectCustomersPage;
