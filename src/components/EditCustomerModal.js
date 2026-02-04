import React, { useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../config.js";
import "./EditCustomerModal.css";

// ---------- Multi-Select Dropdown Component ----------
const MultiSelectDropdown = ({ label, options, selectedValues, onChange }) => {
  const toggleOption = (value) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter((v) => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };
  return (
    <div className="multi-select-dropdown">
      <label>{label}</label>
      <div className="dropdown-options">
        {options.map((opt) => (
          <label key={opt} className="checkbox-label">
            <input
              type="checkbox"
              value={opt}
              checked={selectedValues.includes(opt)}
              onChange={() => toggleOption(opt)}
            />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
};

function EditCustomerModal({ show, onClose, customer, onSave }) {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  // ---------- Staff Options ----------
  const callingBy = ["Snehal","Avdhut","Sandhya","Rakhi","Jyoti","Suvarna","Vrushali","Javed Pathan","Aadinath","Preeti Darekar","Shaila","Siddhesh","Pratham","Aasma Mam","Nilesh Sir","Harsh","Mayur","Sheshnath Sir","Ravi Dhangar","Santosh Pawaskar","Ayush"];
  const attendingBy = ["Suvarna","Krishna","Sandhya","Vrushali","Rakhi","Jyoti","Javed Pathan","Preeti Darekar","Siddhesh","Avdhut","Snehal","Shaila","Aadinath","Pratham","Aasma Mam","Nilesh Sir","Harsh","Mayur","Sheshnath Sir","Ravi Dhangar","Santosh Pawaskar","Shalakha Pawar","Shrinivas Sir"];
  const siteVisitBy = ["Avdhut","Snehal","Sandhya","Suvarna","Vrushali","Ritesh","Siddhesh","Omi","Jyoti","Rakhi","Sushant","Chaitanya","Shaila","Aadinath","Jitesh","Javed Pathan","Preeti Darekar","Pratham","Aasma Mam","Nilesh Sir","Harsh","Mayur","Sheshnath Sir","Ravi Dhangar","Santosh Pawaskar"];
  const closingBy = ["Avdhut","Suvarna","Snehal","Sandhya","Vrushali","Shalaka Pawar","Preeti Darekar","Javed Pathan","Ravi","Jyoti","Rakhi","Siddhesh","Mahendra Ghosalkar","Chaitanya","Srinivas","Shaila","Aadinath","Wankhede","Pratham","Aasma Mam","Nilesh Sir","Harsh","Mayur","Sheshnath Sir","Ravi Dhangar","Santosh Pawaskar"];

  // ---------- Location → Village Map ----------
  const locationVillageMap = {
    "MahaMumbai Phase 1": ["JUI","PUNADE","VINDHANE","PIRKON","SARADE","VASHENI","KHOPTA","KALAMBUSARE","CHIRNER","BANDHPADA"],
    "MahaMumbai Phase 2": ["PHASE II","PEN","WAVEDI","SONKHAR"],
    "THANE": ["THANE","DIVE KEVANI","RAHNAL"],
    "Alibaug": ["ALIBAUG"],
    "Palghar-Dahanu": ["VADHVAN BANDAR"],
    "Pali": ["PALI","KHOPOLI","SUDHAGAD"],
  };

  // ---------- Bank List ----------
  const BANK_LIST = [
    "State Bank of India","Bank of Baroda","Bank of India","Punjab National Bank",
    "Union Bank of India","Canara Bank","Indian Bank","Indian Overseas Bank",
    "Central Bank of India","UCO Bank","Bank of Maharashtra","Punjab & Sind Bank",
    "HDFC Bank","ICICI Bank","Axis Bank","Kotak Mahindra Bank","IndusInd Bank","Yes Bank","IDFC First Bank",
    "Bandhan Bank","Federal Bank","South Indian Bank","RBL Bank","IDBI Bank",
    "AU Small Finance Bank","Equitas Small Finance Bank","Ujjivan Small Finance Bank","Jana Small Finance Bank","ESAF Small Finance Bank",
    "Airtel Payments Bank","India Post Payments Bank","Paytm Payments Bank",
    "Saraswat Co-operative Bank","Cosmos Co-operative Bank","Janata Sahakari Bank","TJSB Sahakari Bank","Other Bank"
  ];

  // ---------- Date Formatter ----------
  const formatDate = (date) => {
    if (!date) return "";
    try { return date.toString().substring(0, 10); }
    catch { return ""; }
  };

  // ================= INIT =================
  useEffect(() => {
    if (!customer) return;
    const updated = { ...customer };

    updated.date = formatDate(customer.date);
    updated.chequeDate = formatDate(customer.chequeDate);
    updated.clearDate = formatDate(customer.clearDate);
    updated.dueDate = formatDate(customer.dueDate);
    updated.nextDueDate = formatDate(customer.nextDueDate);

    if (customer.installments) {
      updated.installments = customer.installments.map(inst => ({
        ...inst,
        installmentDate: formatDate(inst.installmentDate),
        chequeDate: formatDate(inst.chequeDate),
        nextDueDate: formatDate(inst.nextDueDate),
        clearDate: formatDate(inst.clearDate)
      }));
    }

    // Multi-select fields as arrays
    ["callingBy","attendingBy","siteVisitBy","closingBy"].forEach(field => {
      updated[field] = Array.isArray(customer[field]) ? customer[field] : (customer[field] ? [customer[field]] : []);
    });

    setFormData(updated);
  }, [customer]);

  // ================= INPUT =================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ================= INSTALLMENTS =================
  const updateInstallmentField = (index, field, value) => {
    const updatedInstallments = [...(formData.installments || [])];
    updatedInstallments[index][field] = value;
    setFormData({ ...formData, installments: updatedInstallments });
  };

  const addInstallment = () => {
    setFormData({
      ...formData,
      installments: [
        ...(formData.installments || []),
        { installmentNo: (formData.installments?.length || 0) + 1, installmentDate:"", installmentAmount:"", receivedAmount:"", balanceAmount:"", bankName:"", paymentMode:"", chequeNo:"", chequeDate:"", nextDueDate:"", clearDate:"", remark:"", status:"Paid" }
      ],
    });
  };

  const removeInstallment = (index) => {
    const updatedInstallments = [...(formData.installments || [])];
    updatedInstallments.splice(index, 1);
    setFormData({ ...formData, installments: updatedInstallments });
  };

  // ================= AUTO CALCULATION =================
  useEffect(() => {
    if (!formData.totalAmount) return;

    const total = Number(formData.totalAmount) || 0;
    const booking = Number(formData.bookingAmount) || 0;

    let runningBalance = total - booking;
    let totalReceived = booking;

    const updatedInstallments = (formData.installments || []).map(inst => {

      const isBounce =
        inst.status === "Cheque Bounce" ||
        inst.status === "Bounced";

      // ❗ If amount is Bounce then not received count
      const rec = isBounce ? 0 : (Number(inst.receivedAmount) || 0);

      totalReceived += rec;
      runningBalance -= rec;

      return {
        ...inst,
        balanceAmount: runningBalance > 0 ? runningBalance : 0
      };
    });


    setFormData(prev => ({
      ...prev,
      installments: updatedInstallments,
      receivedAmount: totalReceived,
      balanceAmount: total - totalReceived > 0 ? total - totalReceived : 0
    }));
  }, [
    formData.totalAmount,
    formData.bookingAmount,
    JSON.stringify(formData.installments?.map(i => i.receivedAmount))
  ]);

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`${BASE_URL}/api/customers/${customer._id}`, formData);
      onSave(formData);
      alert("✅ Customer updated successfully!");
      onClose();
    } catch (err) {
      console.error(err);
      alert("❌ Update failed!");
    } finally { setLoading(false); }
  };

  if (!show) return null;

  const fields = [
    "date","customerId","name","phone","address","location","village",
    "aadharCard","panCard","bookingArea","rate","totalAmount","bookingAmount",
    "receivedAmount","balanceAmount","bankName","stampDutyCharges","mouCharge",
    "paymentMode","chequeNo","chequeDate","nextDueDate","clearDate",
    "callingBy","attendingBy","siteVisitBy","closingBy","remark","status",
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit Customer</h2>
        <form className="edit-customer-form" onSubmit={handleSubmit}>
          {fields.map(field => (
            <div className="form-group" key={field}>
              {["callingBy","attendingBy","siteVisitBy","closingBy"].includes(field) ? (
                <MultiSelectDropdown
                  label={field.replace(/([A-Z])/g, " $1")}
                  options={field==="callingBy" ? callingBy : field==="attendingBy" ? attendingBy : field==="siteVisitBy" ? siteVisitBy : closingBy}
                  selectedValues={formData[field] || []}
                  onChange={(values)=>setFormData({...formData, [field]: values})}
                />
              ) : (
                <>
                  <label>{field.replace(/([A-Z])/g, " $1")}</label>
                  {field==="status" ? (
                    <select name="status" value={formData.status || ""} onChange={handleChange}>
                      <option value="">Select Status</option>
                      <option value="Active Customer">ACTIVE CUSTOMER</option>
                      <option value="Inactive Customer">INACTIVE CUSTOMER</option>
                      <option value="For Feit">FOR FEIT</option>
                      <option value="Cancelled">CANCELLED</option>
                      <option value="Refunded">REFUND DONE</option>
                      <option value="SALEDEED DONE">SALEDEED DONE</option>
                      <option value="BOOKING CANCELLED">BOOKING CANCELLED</option>
                      <option value="Bounced">BOUNCE</option>
                      <option value="Pending">PENDING</option>
                      <option value="Paid">PAID</option>
                      <option value="Cheque not clear">CHEQUE NOT CLEAR</option>
                    </select>
                  ) : field==="location" ? (
                    <select name="location" value={formData.location || ""} onChange={handleChange}>
                      <option value="">Select Location</option>
                      {Object.keys(locationVillageMap).map(loc=><option key={loc} value={loc}>{loc}</option>)}
                    </select>
                  ) : field==="village" ? (
                    <select name="village" value={formData.village || ""} onChange={handleChange} disabled={!formData.location}>
                      <option value="">Select Village</option>
                      {(locationVillageMap[formData.location] ?? []).map(village => (
                        <option key={village} value={village}>{village}</option>
                      ))}
                    </select>
                  ) : (
                    <input type={field.toLowerCase().includes("date")?"date":field.toLowerCase().includes("amount")||field.toLowerCase().includes("rate")?"number":"text"} name={field} value={formData[field] || ""} onChange={handleChange} />
                  )}
                </>
              )}
            </div>
          ))}

          <h3>Installments</h3>
          {(formData.installments || []).map((inst, index) => (
            <div className="installment-row" key={index}>
              <h4>Installment {index+1}</h4>
              <input type="date" value={inst.installmentDate} onChange={e=>updateInstallmentField(index,"installmentDate",e.target.value)} />
              <input type="number" placeholder="Installment Amount" value={inst.installmentAmount} onChange={e=>updateInstallmentField(index,"installmentAmount",e.target.value)} />
              <input type="number" placeholder="Received Amount" value={inst.receivedAmount} onChange={e=>updateInstallmentField(index,"receivedAmount",e.target.value)} />
              <input type="number" placeholder="Balance Amount" value={inst.balanceAmount} readOnly />
              <select value={inst.bankName || ""} onChange={e=>updateInstallmentField(index,"bankName",e.target.value)}>
                <option value="">Select Bank</option>
                {BANK_LIST.map(bank=><option key={bank} value={bank}>{bank}</option>)}
              </select>
              <select value={inst.paymentMode} onChange={e=>updateInstallmentField(index,"paymentMode",e.target.value)}>
                <option value="">Select</option>
                <option value="Cheque">Cheque</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
                <option value="NEFT">NEFT</option>
                <option value="RTGS">RTGS</option>
                <option value="IMPS">IMPS</option>
                <option value="GPay">GPay</option>
                <option value="Net Banking">Net Banking</option>
                <option value="Paytm">Paytm</option>
                <option value="BHIM">BHIM</option>
                <option value="Card Payment">Card Payment</option>
              </select>
              <input type="text" placeholder="Cheque No / UPI Ref" value={inst.chequeNo} onChange={e=>updateInstallmentField(index,"chequeNo",e.target.value)} />
              <input type="date" value={inst.chequeDate} onChange={e=>updateInstallmentField(index,"chequeDate",e.target.value)} />
              <input type="date" value={inst.nextDueDate} onChange={e=>updateInstallmentField(index,"nextDueDate",e.target.value)} />
              <input type="date" value={inst.clearDate} onChange={e=>updateInstallmentField(index,"clearDate",e.target.value)} />
              <textarea placeholder="Remark" value={inst.remark} onChange={e=>updateInstallmentField(index,"remark",e.target.value)} />
              <select value={inst.status} onChange={e=>updateInstallmentField(index,"status",e.target.value)}>
                <option value="">Select Status</option>
                <option value="Active Customer">Active Customer</option>
                <option value="Inactive Customer">Inactive Customer</option>
                <option value="For Feit">For Feit</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Refunded">Refunded</option>
                <option value="SALEDEED DONE">SALEDEED DONE</option>
                <option value="BOOKING CANCELLED">BOOKING CANCELLED</option>
                <option value="Cheque Bounce">CHEQUE BOUNCE</option>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Cheque not clear">Cheque not clear</option>
              </select>
              <button type="button" className="remove-btn" onClick={()=>removeInstallment(index)}>❌ Remove</button>
            </div>
          ))}

          <button type="button" onClick={addInstallment} className="add-btn">+ Add Installment</button>

          <div className="footer-buttons">
            <button type="button" className="close-btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="save-btn" disabled={loading}>{loading ? "Updating..." : "Update"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditCustomerModal;
