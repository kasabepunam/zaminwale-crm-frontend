import React, { useState } from "react";
import axios from "axios";
import { BASE_URL } from "../config";

function RebookModal({ show, onClose, customer, onSuccess }) {
  const [newCustomerId, setNewCustomerId] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [bookingAmount, setBookingAmount] = useState("");

  if (!show || !customer) return null;

  const handleSubmit = async () => {
    try {
      await axios.post(`${BASE_URL}/api/customers/rebook`, {
        previousPlotId: customer.customerId,
        newCustomerId,
        totalAmount,
        bookingAmount,
      });

      alert("✅ Re-Booking Successful");
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert("❌ Re-Booking Failed");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>🔁 Re-Book Customer</h3>

        <p><b>Old Plot No:</b> {customer.customerId}</p>
        <p><b>Name:</b> {customer.name}</p>

        <input
          placeholder="New Plot / Customer ID"
          value={newCustomerId}
          onChange={(e) => setNewCustomerId(e.target.value)}
        />

        <input
          type="number"
          placeholder="Total Amount"
          value={totalAmount}
          onChange={(e) => setTotalAmount(e.target.value)}
        />

        <input
          type="number"
          placeholder="Booking Amount"
          value={bookingAmount}
          onChange={(e) => setBookingAmount(e.target.value)}
        />

        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleSubmit}>Confirm Re-Book</button>
        </div>
      </div>
    </div>
  );
}

export default RebookModal;
