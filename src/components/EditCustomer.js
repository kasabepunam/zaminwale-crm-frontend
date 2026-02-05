// src/components/EditCustomerModal.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./EditCustomerModal.css";

function EditCustomerModal({ show, onClose, customer, onSave }) {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer) {
      setFormData({ ...customer });
    }
  }, [customer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleInstallmentChange = (index, field, value) => {
    const updatedInstallments = [...(formData.installments || [])];

    updatedInstallments[index] = {
      ...updatedInstallments[index],
      [field]: value,
    };

    setFormData((prev) => ({
      ...prev,
      installments: updatedInstallments,
    }));
  };

  const addInstallment = () => {
    const newInst = {
      installmentNo: (formData.installments?.length || 0) + 1,
      installmentDate: "",
      installmentAmount: "",
      receivedAmount: "",
      balanceAmount: "",
      bankName: "",
      paymentMode: "",
      chequeNo: "",
      chequeDate: "",
      remark: "",
      status: "",
    };

    setFormData((prev) => ({
      ...prev,
      installments: [...(prev.installments || []), newInst],
    }));
  };

  const removeInstallment = (index) => {
    const updatedInstallments = [...(formData.installments || [])];
    updatedInstallments.splice(index, 1);

    setFormData((prev) => ({
      ...prev,
      installments: updatedInstallments,
    }));
  };

  // ✅ MAIN SUBMIT FUNCTION
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put(
        `https://zaminwale-crm-backend-yztw.onrender.com/api/customers/${customer._id}`,
        formData
      );

      alert("✅ Customer updated successfully!");

      onSave(formData);
      onClose();
    } catch (err) {
      console.error("Update Error:", err);
      alert("❌ Update failed! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  const fields = [
    "name",
    "phone",
    "address",
    "location",
    "status",
    "customerId",
    "aadharCard",
    "panCard",
    "bookingArea",
    "rate",
    "totalAmount",
    "bookingAmount",
    "receivedAmount",
    "balanceAmount",
    "stampDutyCharges",
    "village",
    "mouCharge",
    "bankName",
    "paymentMode",
    "chequeNo",
    "chequeDate",
    "remark",
    "callingBy",
    "attendingBy",
    "siteVisitBy",
    "closingBy",
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit Customer</h2>

        {/* ✅ FORM */}
        <form className="edit-customer-form" onSubmit={handleSubmit}>
          {/* Basic Fields */}
          {fields.map((field) => (
            <div className="form-group" key={field}>
              <label>{field.replace(/([A-Z])/g, " $1")}</label>

              <input
                type={
                  field.toLowerCase().includes("date")
                    ? "date"
                    : field.toLowerCase().includes("amount") ||
                      field.toLowerCase().includes("rate")
                    ? "number"
                    : "text"
                }
                name={field}
                value={formData[field] || ""}
                onChange={handleChange}
              />
            </div>
          ))}

          {/* Installments */}
          <h3>Installments</h3>

          {(formData.installments || []).map((inst, index) => (
            <div key={index} className="installment-row">
              <input
                type="date"
                value={inst.installmentDate || ""}
                onChange={(e) =>
                  handleInstallmentChange(
                    index,
                    "installmentDate",
                    e.target.value
                  )
                }
              />

              <input
                type="number"
                placeholder="Installment Amount"
                value={inst.installmentAmount || ""}
                onChange={(e) =>
                  handleInstallmentChange(
                    index,
                    "installmentAmount",
                    e.target.value
                  )
                }
              />

              <input
                type="number"
                placeholder="Received Amount"
                value={inst.receivedAmount || ""}
                onChange={(e) =>
                  handleInstallmentChange(
                    index,
                    "receivedAmount",
                    e.target.value
                  )
                }
              />

              <input
                type="number"
                placeholder="Balance Amount"
                value={inst.balanceAmount || ""}
                onChange={(e) =>
                  handleInstallmentChange(
                    index,
                    "balanceAmount",
                    e.target.value
                  )
                }
              />

              <input
                type="text"
                placeholder="Bank Name"
                value={inst.bankName || ""}
                onChange={(e) =>
                  handleInstallmentChange(index, "bankName", e.target.value)
                }
              />

              <input
                type="text"
                placeholder="Payment Mode"
                value={inst.paymentMode || ""}
                onChange={(e) =>
                  handleInstallmentChange(index, "paymentMode", e.target.value)
                }
              />

              <input
                type="text"
                placeholder="Cheque No"
                value={inst.chequeNo || ""}
                onChange={(e) =>
                  handleInstallmentChange(index, "chequeNo", e.target.value)
                }
              />

              <input
                type="date"
                value={inst.chequeDate || ""}
                onChange={(e) =>
                  handleInstallmentChange(index, "chequeDate", e.target.value)
                }
              />

              <input
                type="text"
                placeholder="Remark"
                value={inst.remark || ""}
                onChange={(e) =>
                  handleInstallmentChange(index, "remark", e.target.value)
                }
              />

              <input
                type="text"
                placeholder="Status"
                value={inst.status || ""}
                onChange={(e) =>
                  handleInstallmentChange(index, "status", e.target.value)
                }
              />

              <button
                type="button"
                className="remove-btn"
                onClick={() => removeInstallment(index)}
              >
                ❌ Remove
              </button>
            </div>
          ))}

          <button type="button" onClick={addInstallment} className="add-btn">
            + Add Installment
          </button>

          {/* Bottom Buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "20px",
              marginTop: "30px",
            }}
          >
            <button type="button" className="close-btn" onClick={onClose}>
              Cancel
            </button>

            {/* ✅ NO onClick HERE */}
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditCustomerModal;
