import React, { useState } from "react";
import axios from "axios";
import "./AddCustomerModal.css";


function AddCustomerModal({ show, onClose, onSave }) {
  const [formData, setFormData] = useState({
    date: "",
    customerId: "",
    name: "",
    address: "",
    phone: "",
    aadhaarCard: "",
    panCard: "",
    bookingArea: "",
    rate: "",
    totalAmount: "",
    bookingAmount: "",
    receivedAmount: "",
    balanceAmount: "",
    stampDutyCharges: "",
    location: "",
    village: "",
    mouCharge: "",
    bankName: "",
    paymentMode: "",
    chequeNo: "",
    chequeDate: "",
    remark: "",
    status: "Active",
    callingBy: "",
    attendingBy: "",
    siteVisitBy: "",
    closingBy: "",
    installments: []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Calculate balance if needed
      formData.balanceAmount = Number(formData.totalAmount || 0) - Number(formData.receivedAmount || 0);

      await axios.post("https://zaminwale-crm-backend-yztw.onrender.com/api/customers", formData);
      alert("Customer added successfully!");
      onSave(); // refresh parent list
      onClose();
    } catch (err) {
      console.error("Add Customer Error:", err);
      alert("Error adding customer. Check console.");
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Add New Customer</h3>
        <form onSubmit={handleSubmit} className="add-customer-form">
          <div className="form-row">
            <label>Date:</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <label>Customer ID:</label>
            <input type="text" name="customerId" value={formData.customerId} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <label>Name:</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <label>Address:</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} />
          </div>
          <div className="form-row">
            <label>Phone:</label>
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
          </div>
          <div className="form-row">
            <label>Aadhaar:</label>
            <input type="text" name="aadhaarCard" value={formData.aadhaarCard} onChange={handleChange} />
          </div>
          <div className="form-row">
            <label>PAN:</label>
            <input type="text" name="panCard" value={formData.panCard} onChange={handleChange} />
          </div>
          <div className="form-row">
            <label>Booking Area (Guntha):</label>
            <input type="number" name="bookingArea" value={formData.bookingArea} onChange={handleChange} />
          </div>
          <div className="form-row">
            <label>Rate:</label>
            <input type="number" name="rate" value={formData.rate} onChange={handleChange} />
          </div>
          <div className="form-row">
            <label>Total Amount:</label>
            <input type="number" name="totalAmount" value={formData.totalAmount} onChange={handleChange} />
          </div>
          <div className="form-row">
            <label>Booking Amount:</label>
            <input type="number" name="bookingAmount" value={formData.bookingAmount} onChange={handleChange} />
          </div>
          <div className="form-row">
            <label>Received Amount:</label>
            <input type="number" name="receivedAmount" value={formData.receivedAmount} onChange={handleChange} />
          </div>
          <div className="form-row">
            <label>Location:</label>
            <input type="text" name="location" value={formData.location} onChange={handleChange} />
          </div>
          <div className="form-row">
            <label>Village:</label>
            <input type="text" name="village" value={formData.village} onChange={handleChange} />
          </div>
          <div className="form-row">
            <label>Status:</label>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="Active">Active</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit">Save</button>
            <button type="button" onClick={onClose} className="close-btn">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddCustomerModal;
