// src/pages/CustomerDetails.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/CustomerDetails.css";

function CustomerDetails() {
  const { customerId } = useParams();
  const [customer, setCustomer] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await axios.get(`http://localhost:5001/api/customers/${customerId}`);
        setCustomer(res.data);
      } catch (error) {
        console.error("Error fetching customer details:", error);
      }
    };
    fetchCustomer();
  }, [customerId]);

  if (!customer) {
    return <div className="loading">Loading customer details...</div>;
  }

  return (
    <div className="customer-details-container">
      <h2>📄 Customer Full Details</h2>
      <div className="customer-info-grid">
        <div className="info-group"><label>Date:</label><span>{customer.date || "-"}</span></div>
        <div className="info-group"><label>Customer ID:</label><span>{customer.customerId}</span></div>
        <div className="info-group"><label>Name:</label><span>{customer.name}</span></div>
        <div className="info-group"><label>Address:</label><span>{customer.address}</span></div>
        <div className="info-group"><label>Phone:</label><span>{customer.phone}</span></div>
        <div className="info-group"><label>Aadhaar:</label><span>{customer.aadhaarCard}</span></div>
        <div className="info-group"><label>PAN:</label><span>{customer.panCard}</span></div>
        <div className="info-group"><label>Booking Area:</label><span>{customer.bookingArea}</span></div>
        <div className="info-group"><label>Rate:</label><span>{customer.rate || "-"}</span></div>
        <div className="info-group"><label>Total Amount (₹):</label><span>{customer.totalAmount}</span></div>
        <div className="info-group"><label>Booking Amount (₹):</label><span>{customer.bookingAmount}</span></div>
        <div className="info-group"><label>Received Amount (₹):</label><span>{customer.receivedAmount}</span></div>
        <div className="info-group"><label>Balance Amount (₹):</label><span>{customer.balanceAmount}</span></div>
        <div className="info-group"><label>Stamp Duty:</label><span>{customer.stampDuty || "-"}</span></div>
        <div className="info-group"><label>Location:</label><span>{customer.location}</span></div>
        <div className="info-group"><label>Village:</label><span>{customer.village}</span></div>
        <div className="info-group"><label>Mou Charge:</label><span>{customer.mouCharge || "-"}</span></div>
        <div className="info-group"><label>Bank Name:</label><span>{customer.bankName}</span></div>
        <div className="info-group"><label>Payment Mode:</label><span>{customer.paymentMode}</span></div>
        <div className="info-group"><label>Cheque No:</label><span>{customer.chequeNo || "-"}</span></div>
        <div className="info-group"><label>Cheque Date:</label><span>{customer.chequeDate || "-"}</span></div>
        <div className="info-group"><label>Remark:</label><span>{customer.remark || "-"}</span></div>
        <div className="info-group"><label>Status:</label><span>{customer.status || "-"}</span></div>
        <div className="info-group"><label>Calling By:</label><span>{customer.callingBy || "-"}</span></div>
        <div className="info-group"><label>Attending By:</label><span>{customer.attendingBy || "-"}</span></div>
        <div className="info-group"><label>Site Visiting By:</label><span>{customer.siteVisitBy || "-"}</span></div>
        <div className="info-group"><label>Closing By:</label><span>{customer.closingBy || "-"}</span></div>
      </div>

      {/* Installments Section */}
      <div className="installment-section">
        <h3>💰 Installment Details</h3>
        {customer.installments && customer.installments.length > 0 ? (
          <table className="installment-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Date</th>
                <th>Received Amount (₹)</th>
                <th>Next Due Date</th>
              </tr>
            </thead>
            <tbody>
              {customer.installments.map((inst, index) => (
                <tr key={index}>
                  <td>{inst.installmentNo || index + 1}</td>
                  <td>{inst.installmentDate || "-"}</td>
                  <td>{inst.receivedAmount || "-"}</td>
                  <td>{inst.nextDueDate || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No installments found.</p>
        )}
      </div>

      {/* Buttons */}
      <div className="details-buttons">
        <button className="back-btn" onClick={() => navigate("/customers")}>← Back to Customers</button>
        <button className="inst-btn" onClick={() => navigate(`/customers/${customer._id}/installments`)}>📊 Manage Installments</button>
      </div>
    </div>
  );
}

export default CustomerDetails;
