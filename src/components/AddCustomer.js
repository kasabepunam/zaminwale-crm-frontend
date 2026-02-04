import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { CustomerContext } from "../context/CustomerContext.js";
import "../styles/AddCustomer.css";

// ---------- ALL INDIA BANK LIST ----------
const BANK_LIST = [
  // Public Sector Banks
  "State Bank of India",
  "Bank of Baroda",
  "Bank of India",
  "Punjab National Bank",
  "Union Bank of India",
  "Canara Bank",
  "Indian Bank",
  "Indian Overseas Bank",
  "Central Bank of India",
  "UCO Bank",
  "Bank of Maharashtra",
  "Punjab & Sind Bank",

  // Private Banks
  "HDFC Bank",
  "ICICI Bank",
  "Axis Bank",
  "Kotak Mahindra Bank",
  "IndusInd Bank",
  "Yes Bank",
  "IDFC First Bank",
  "Bandhan Bank",
  "Federal Bank",
  "South Indian Bank",
  "RBL Bank",
  "Karur Vysya Bank",
  "City Union Bank",
  "DCB Bank",
  "CSB Bank",
  "Dhanlaxmi Bank",
  "Jammu & Kashmir Bank",
  "Karnataka Bank",
  "Tamilnad Mercantile Bank",
  "Nainital Bank",
  "IDBI Bank",
  // Small Finance Banks
    "AU Small Finance Bank",
    "Equitas Small Finance Bank",
    "Ujjivan Small Finance Bank",
    "Jana Small Finance Bank",
    "ESAF Small Finance Bank",
    "Suryoday Small Finance Bank",
    "Utkarsh Small Finance Bank",
    "Capital Small Finance Bank",
    "Fincare Small Finance Bank",
    "North East Small Finance Bank",
    "Shivalik Small Finance Bank",

    // Payments Banks
    "Airtel Payments Bank",
    "India Post Payments Bank",
    "Paytm Payments Bank",
    "Fino Payments Bank",

    // Co-operative Banks (Major)
    "Abhyudaya Co-operative Bank Ltd.",
    "Saraswat Co-operative Bank",
    "Cosmos Co-operative Bank",
    "Janata Sahakari Bank",
    "Shamrao Vithal Co-operative Bank",
    "TJSB Sahakari Bank",

    // Fallback
    "Other Bank"
  ];
// ---------- BankDropdown Component ----------
const BankDropdown = ({ label, value, onChange }) => {
  const [customBank, setCustomBank] = useState("");

  const handleChange = (e) => {
    const val = e.target.value;
    if (val === "Other Bank") {
      onChange(customBank);
    } else {
      onChange(val);
      setCustomBank("");
    }
  };

  return (
    <div className="bank-dropdown">
      <label>{label}</label>
      <select value={BANK_LIST.includes(value) ? value : "Select Bank"} onChange={handleChange}>
        <option value="">Select Bank</option>
        {BANK_LIST.map((bank) => (
          <option key={bank} value={bank}>{bank}</option>
        ))}
      </select>
      {!BANK_LIST.includes(value) && (
        <input
          type="text"
          placeholder="Enter Bank Name"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        /> )}
               </div>
             );
           };
// ---------- Multi-Select Dropdown ----------
const StaffStatusMultiSelect = ({ label, options, selected, onChange }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = React.useRef(null);

  const toggleOption = (option) =>
    onChange(
      selected.includes(option)
        ? selected.filter((o) => o !== option)
        : [...selected, option]
    );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="multi-select-dropdown" ref={dropdownRef}>
      <label>{label}</label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="dropdown-toggle-btn"
      >
        {selected.length > 0 ? selected.join(", ") : `Select ${label}`}
      </button>
      {open && (
        <div className="dropdown-menu">
          {options.map((option) => (
            <label key={option} className="dropdown-item">
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => toggleOption(option)}
              />
              {option}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

// ---------- Main Component ----------
const AddCustomer = ({ editCustomer, onSaved }) => {
  const { fetchCustomers } = useContext(CustomerContext);
  const loggedInUser = JSON.parse(localStorage.getItem("user"))?.name || "Unknown";

  const locationVillageMap = {
    "MahaMumbai Phase 1": ["JUI","PUNADE","VINDHANE","PIRKON","SARADE","VASHENI","KHOPTA","KALAMBUSARE","CHIRNER","BANDHPADA"],
    "MahaMumbai Phase 2": ["PHASE ||","PEN","WAVEDI","SONKHAR"],
    "THANE": ["THANE","DIVE KEVANI"],
    "Alibaug": ["ALIBAUG"],
    "Palghar-Dahanu": ["VADHVAN BANDAR"],
    "Pali": ["PALI","KHOPOLI","SUDHAGAD"],
  };

  const initialForm = {
    date: new Date().toISOString().split("T")[0],
    customerId: "",
    name: "",
    address: "",
    phone: "",
    alternatePhone: "",
    email: "",
    panCard: "",
    aadharCard: "",

    aadharPhoto: null,
    panPhoto: null,
    bookingFormPhoto: null,

    bookingArea: 0,
    plotArea: 0,
    rate: 0,
    discount: 0,
    totalAmount: 0,
    bookingAmount: 0,
    receivedAmount: 0,
    balanceAmount: 0,
    mouCharge: 0,
    location: "",
    village: "",
    bankName: "",
    paymentMode: "",
    chequeNo: "",
    chequeDate: "",
    stampDutyAmount: 0,
    stampDutyPaymentMode: "",
    stampDutyChequeNo: "",
    stampDutyDate: "",
    remark: "",
    installments: [],
    callingBy: [],
    attendingBy: [],
    siteVisitBy: [],
    closingBy: [],
    status: "Active Customer",
    otherReason: "",
    zipcode: "",
    clearDate: "",
    dueDate: "",
    _id: null,
  };

  const [formData, setFormData] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    if (editCustomer) {
      setFormData({
        ...initialForm,
        ...editCustomer,
        callingBy: editCustomer.callingBy || [],
        attendingBy: editCustomer.attendingBy || [],
        siteVisitBy: editCustomer.siteVisitBy || [],
        closingBy: editCustomer.closingBy || [],
        installments: editCustomer.installments || [],
      });
    }
  }, [editCustomer]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const newValue = type === "number" ? Number(value) || 0 : value;

    setFormData((prev) => {
      const updated = { ...prev, [name]: newValue };
      if (name === "location") updated.village = "";
      if (name === "bookingArea") updated.plotArea = Number(newValue) * 1000;

      updated.totalAmount =
        Number(updated.bookingArea) * Number(updated.rate) -
        Number(updated.discount) +
        Number(updated.stampDutyAmount) +
        Number(updated.mouCharge);

      updated.balanceAmount =
        updated.totalAmount - Number(updated.bookingAmount);

      return updated;
    });
  };

  // ---------- Installments ----------
  const addInstallment = () => {
    const newInstallment = {
      installmentNo: formData.installments.length + 1,
      installmentDate: "",
      installmentAmount: 0,
      receivedAmount: 0,
      balanceAmount: 0,
      bankName: "",
      paymentMode: "",
      chequeNo: "",
      chequeDate: "",
      clearDate: "",
      remark: "",
      status: "Paid",
    };
    setFormData((prev) => ({
      ...prev,
      installments: [...prev.installments, newInstallment],
    }));
  };

  const handleInstallmentChange = (index, e) => {
    const { name, value } = e.target;
    const updated = formData.installments.map((inst, i) =>
      i === index ? { ...inst, [name]: value } : inst
    );
    setFormData((prev) => ({ ...prev, installments: updated }));
  };

  const removeInstallment = (index) => {
    const updated = formData.installments.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, installments: updated }));
  };

  // ---------- Submit ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customerId || !formData.name)
      return alert("Customer ID and Name are required.");

    setSaving(true);
    try {
      const payload = { ...formData, user: loggedInUser };
      const baseURL = "http://192.168.29.50:5001";

      if (formData._id) {
        await axios.put(`${baseURL}/api/customers/${formData._id}`, payload);
        alert("✅ Customer updated successfully!");
      } else {
        await axios.post(`${baseURL}/api/customers`, payload);
        alert("🎉 Customer added successfully!");
        setFormData(initialForm);
        setCurrentStep(1);
      }

      fetchCustomers();
      onSaved && onSaved();
    } catch (err) {
      console.error("Error:", err.response?.data || err.message);
      alert("Save failed. Check console.");
    } finally {
      setSaving(false);
    }
  };

  // ---------- Staff Options ----------
  const callingOptions = ["Snehal","Avdhut","Sandhya","Rakhi","Jyoti","Suvarna","Vrushali","Javed Pathan","Aadinath","Preeti Darekar","Shaila","Siddhesh","Pratham","Aasma Mam","Nilesh Sir","Harsh","Mayur","Sheshnath Sir","Ravi Dhangar","Santosh Pawaskar","Ayush"];
  const attendingOptions = ["Suvarna","Krishna","Sandhya","Vrushali","Rakhi","Jyoti","Javed Pathan","Preeti Darekar","Siddhesh","Avdhut","Snehal","Shaila","Aadinath","Pratham","Aasma Mam","Nilesh Sir","Harsh","Mayur","Sheshnath Sir","Ravi Dhangar","Santosh Pawaskar","Shalakha Pawar","Ayush","Shrinivas Sir"];
  const siteVisitOptions = ["Avdhut","Snehal","Sandhya","Suvarna","Vrushali","Ritesh","Siddhesh","Omi","Jyoti","Rakhi","Sushant","Chaitanya","Shaila","Aadinath","Jitesh","Javed Pathan","Preeti Darekar","Pratham","Aasma Mam","Nilesh Sir","Harsh","Mayur","Sheshnath Sir","Ravi Dhangar","Santosh Pawaskar","Ayush"];
  const closingOptions = ["Avdhut","Suvarna","Snehal","Sandhya","Vrushali","Shalaka Pawar","Preeti Darekar","Javed Pathan","Ravi","Jyoti","Rakhi","Siddhesh","Mahendra Ghosalkar","Chaitanya","Srinivas","Shaila","Aadinath","Wankhede","Pratham","Aasma Mam","Nilesh Sir","Harsh","Mayur","Sheshnath Sir","Ravi Dhangar","Santosh Pawaskar","Ayush"];

  // ---------- Steps JSX ----------
  return (
    <div className="add-customer">
      <h2>{formData._id ? "Edit Customer" : "Add New Customer"}</h2>
      <form onSubmit={handleSubmit} className="form-grid">

        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <>
            <label>Date</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} />
            <label>Customer ID</label>
            <input type="text" name="customerId" value={formData.customerId} onChange={handleChange} />
            <label>Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} />
            <label>Address</label>
            <textarea name="address" value={formData.address} onChange={handleChange}></textarea>
            <label>Phone</label>
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
            <label>Alternate Phone</label>
            <input type="text" name="alternatePhone" value={formData.alternatePhone} onChange={handleChange} />
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} />
            <label>PAN Card</label>
            <input type="text" name="panCard" value={formData.panCard} onChange={handleChange} />
            <label>Aadhar Card</label>
            <input type="text" name="aadharCard" value={formData.aadharCard} onChange={handleChange} />
            
            <button type="button" onClick={() => setCurrentStep(2)}>Next</button>
          </>
        )}

        {/* Step 2: Location & Booking */}
        {currentStep === 2 && (
          <>
            <label>Location</label>
            <select name="location" value={formData.location} onChange={handleChange}>
              <option value="">Select Location</option>
              {Object.keys(locationVillageMap).map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
            <label>Village</label>
            <select name="village" value={formData.village} onChange={handleChange}>
              <option value="">Select Village</option>
              {formData.location &&
                locationVillageMap[formData.location].map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
            </select>

            <label>Booking Area</label>
            <input type="number" name="bookingArea" value={formData.bookingArea} onChange={handleChange} />
            <label>Rate</label>
            <input type="number" name="rate" value={formData.rate} onChange={handleChange} />
            <label>Discount</label>
            <input type="number" name="discount" value={formData.discount} onChange={handleChange} />
            <label>MOU Charges</label>
            <input type="number" name="mouCharge" value={formData.mouCharge} onChange={handleChange} />
            <label>Total Amount</label>
            <input type="number" value={formData.totalAmount} readOnly />
            <label>Booking Amount</label>
            <input type="number" name="bookingAmount" value={formData.bookingAmount} onChange={handleChange} />
            <label>Received Amount</label>
            <input type="number" name="receivedAmount" value={formData.receivedAmount} onChange={handleChange} />
            <label>Balance Amount</label>
            <input type="number" value={formData.balanceAmount} readOnly />

            <button type="button" onClick={() => setCurrentStep(1)}>Previous</button>
            <button type="button" onClick={() => setCurrentStep(3)}>Next</button>
          </>
        )}

        {/* Step 3: Staff */}
        {currentStep === 3 && (
          <>
            <StaffStatusMultiSelect label="Calling By" options={callingOptions} selected={formData.callingBy} onChange={(v) => setFormData({ ...formData, callingBy: v })} />
            <StaffStatusMultiSelect label="Attending By" options={attendingOptions} selected={formData.attendingBy} onChange={(v) => setFormData({ ...formData, attendingBy: v })} />
            <StaffStatusMultiSelect label="Site Visit By" options={siteVisitOptions} selected={formData.siteVisitBy} onChange={(v) => setFormData({ ...formData, siteVisitBy: v })} />
            <StaffStatusMultiSelect label="Closing By" options={closingOptions} selected={formData.closingBy} onChange={(v) => setFormData({ ...formData, closingBy: v })} />

            <button type="button" onClick={() => setCurrentStep(2)}>Previous</button>
            <button type="button" onClick={() => setCurrentStep(4)}>Next</button>
          </>
        )}

        {/* Step 4: Stamp Duty, Bank & Installments */}
        {currentStep === 4 && (
          <>
          <label>Bank Name</label>
          <BankDropdown label="Bank Name" value={formData.bankName} onChange={(v) => setFormData({ ...formData, bankName: v })} />
                      <label>Payment Mode</label>
                      <select name="paymentMode" value={formData.paymentMode} onChange={handleChange}>
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
                      <label>Cheque / UTR Number< /label>
                      <input type="text" name="chequeNo" value={formData.chequeNo} onChange={handleChange} />
                      <label>Cheque Date</label>
                      <input type="date" name="chequeDate" value={formData.chequeDate} onChange={handleChange} />
                      <label>Next Due Date</label>
                      <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} />
            {/* Stamp Duty */}
            <label>Stamp Duty Amount</label>
            <input type="number" name="stampDutyAmount" value={formData.stampDutyAmount} onChange={handleChange} />
            <label>Stamp Duty Payment Mode</label>
            <select name="stampDutyPaymentMode" value={formData.stampDutyPaymentMode} onChange={handleChange}>
              <option value="">Select</option>
              <option value="Cheque">Cheque</option>
              <option value="RTGS">RTGS</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cash">Cash</option>
              <option value="GPay">GPay</option>
              <option value="UPI">UPI</option>
            </select>
            <label>Stamp Duty Cheque/UTR No</label>
            <input type="text" name="stampDutyChequeNo" value={formData.stampDutyChequeNo} onChange={handleChange} />
            <label>Stamp Duty Date</label>
            <input type="date" name="stampDutyDate" value={formData.stampDutyDate} onChange={handleChange} />
            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="Active Customer">Active Customer</option>
              <option value="Inactive customer">Inactive Customer</option>
              <option value="For Feit">For Feit</option>
              <option value="Cheque Bounce">Cheque Bounce</option>
              <option value="Transfer Installment">Transfer Installment</option>
              <option value="Sale Deed Done">SALEDEED DONE</option>
              <option value="Deactive Customer">Deactive</option>
              <option value="Other">Other</option>
            </select>

            {formData.status === "Other" && (
              <input type="text" name="otherReason" value={formData.otherReason} onChange={handleChange} placeholder="Enter Reason" />
            )}
<label>Remark</label>
                      <input type="text" name="remark" value={formData.remark} onChange={handleChange} />
            {/* Installments */}
            <div className="form-card full-width">
              <h3>Installments</h3>
              <button type="button" onClick={addInstallment} className="add-btn">+ Add Installment</button>
              {formData.installments.map((inst, index) => (
                <div key={index} className="installment-row">
                  <h4>Installment {index + 1}</h4>
                  <label>Date</label>
                  <input type="date" name="installmentDate" value={inst.installmentDate} onChange={(e) => handleInstallmentChange(index, e)} />
                  <label>Amount</label>
                  <input type="number" name="installmentAmount" value={inst.installmentAmount} onChange={(e) => handleInstallmentChange(index, e)} />
                  <label>Received</label>
                  <input type="number" name="receivedAmount" value={inst.receivedAmount} onChange={(e) => handleInstallmentChange(index, e)} />
                  <label>Bank Name</label>
                  <input type="text" name="bankName" value={inst.bankName} onChange={(e) => handleInstallmentChange(index, e)} />
                  <label>Payment Mode</label>
                  <select name="paymentMode" value={inst.paymentMode} onChange={(e) => handleInstallmentChange(index, e)}>
                    <option value="">Select</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cash">Cash</option>
                    <option value="GPay">GPay</option>
                    <option value="UPI">UPI</option>
                    <option value="Online">Online</option>
                  </select>
                  <label>Cheque / UTR</label>
                  <input type="text" name="chequeNo" value={inst.chequeNo} onChange={(e) => handleInstallmentChange(index, e)} />
                  <label>Cheque Date</label>
                  <input type="date" name="chequeDate" value={inst.chequeDate} onChange={(e) => handleInstallmentChange(index, e)} />
                  <label>Remark</label>
                  <input type="text" name="remark" value={inst.remark} onChange={(e) => handleInstallmentChange(index, e)} />
                  <button type="button" className="remove-btn" onClick={() => removeInstallment(index)}>Remove</button>
                </div>
              ))}
            </div>

            <button type="button" onClick={() => setCurrentStep(3)}>Previous</button>
            <button type="submit" className="save-btn" disabled={saving}>{saving ? "Saving..." : "Save Customer"}</button>
          </>
        )}

      </form>
    </div>
  );
};

export default AddCustomer;
