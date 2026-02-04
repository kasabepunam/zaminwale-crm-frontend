// src/components/PendingSaleDeedsPage.js
import React, { useContext } from "react";
import { CustomerContext } from "../context/CustomerContext";
import { useNavigate } from "react-router-dom";

function PendingSaleDeedsPage() {
  const { customers } = useContext(CustomerContext);
  const navigate = useNavigate();

  const pendingDeeds = customers.filter(c => c.status === "Booking" || c.status === "Pending");

  return (
    <div>
      <h2>Pending Sale Deeds</h2>
      <table>
        <thead>
          <tr>
            <th>Customer Name</th>
            <th>Location</th>
            <th>Booking Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {pendingDeeds.map(c => (
            <tr key={c._id}>
              <td>{c.name}</td>
              <td>{c.location}</td>
              <td>{c.bookingDate}</td>
              <td>
                <button onClick={() => navigate(`/customers/${c._id}`)}>View Details</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PendingSaleDeedsPage;
