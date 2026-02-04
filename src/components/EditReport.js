import React, { useState } from "react";
import "../styles/EditReport.css"; // make sure this CSS file exists

const staffColumns = [
  "AASMA MAM","NILESH SIR","SHALAKA MAM","JAVED PATHAN",
  "PRITEE . D","AVADHUT","SUVARNA","CHAITANYA",
  "SIDDHESH","MAHENDRA","OMI GHARAT","RAKHI",
  "SANDHYA","SNEHAL","VRUSHALI","JYOTI",
  "YASH","SRINIVAS","PRATHAM","SHAILA",
  "SHESHNATH SIR","BHAGYASHREE","RITESH","RAVI D.",
  "PRERNA","ASHOK BANSODE","AADINATH","NASREEN",
  "JITESH","AKSHAY"
];

const EditReport = ({ customer, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({ ...customer });

  const handleChange = (e) => {
    const { name, value } = e.target;

    // For staff fields (nested object)
    if (name.startsWith("staff.")) {
      const key = name.split(".")[1];
      setFormData({
        ...formData,
        staff: { ...formData.staff, [key]: value }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(formData); // send updated data back to parent
  };

  return (
    <div className="edit-modal">
      <div className="edit-modal-content">
        <h2>Edit Customer Report</h2>
        <form onSubmit={handleSubmit} className="edit-form">

          {/* Main fields */}
          <input name="srNo" value={formData.srNo || ""} onChange={handleChange} placeholder="SR NO" />
          <input name="date" value={formData.date || ""} onChange={handleChange} placeholder="Date" />
          <input name="customerId" value={formData.customerId || ""} onChange={handleChange} placeholder="Customer ID" />
          <input name="name" value={formData.name || ""} onChange={handleChange} placeholder="Customer Name" />
          <input name="bookingType" value={formData.bookingType || ""} onChange={handleChange} placeholder="BK/Installment" />
          <input name="location" value={formData.location || ""} onChange={handleChange} placeholder="Location" />
          <input name="bookingArea" value={formData.bookingArea || ""} onChange={handleChange} placeholder="Booking Area" />
          <input name="rate" value={formData.rate || ""} onChange={handleChange} placeholder="Rate" />
          <input name="totalAmount" value={formData.totalAmount || ""} onChange={handleChange} placeholder="Total Amount" />
          <input name="bookingAmount" value={formData.bookingAmount || ""} onChange={handleChange} placeholder="BK/Install Amount" />
          <input name="incentiveRate" value={formData.incentiveRate || ""} onChange={handleChange} placeholder="Incentive Rate" />
          <input name="incentiveAmount" value={formData.incentiveAmount || ""} onChange={handleChange} placeholder="Amount" />
          <input name="calling" value={formData.calling || ""} onChange={handleChange} placeholder="Calling" />
          <input name="siteVisit" value={formData.siteVisit || ""} onChange={handleChange} placeholder="Site Visit" />
          <input name="attending" value={formData.attending || ""} onChange={handleChange} placeholder="Attending" />
          <input name="closing" value={formData.closing || ""} onChange={handleChange} placeholder="Closing" />

          {/* Staff fields */}
          {staffColumns.map((s) => (
            <input
              key={s}
              name={`staff.${s}`}
              value={formData.staff?.[s] || ""}
              onChange={handleChange}
              placeholder={s}
            />
          ))}

          {/* Total */}
          <input name="total" value={formData.total || ""} onChange={handleChange} placeholder="Total" />

          {/* Buttons */}
          <div className="edit-buttons">
            <button type="submit">Update</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditReport;
