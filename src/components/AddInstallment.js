import React, { useState } from "react";
import axios from "axios";
import "./AddInstallment.css";
import { CustomerProvider } from "../context/CustomerContext.js";

function AddInstallment({ customerId, onAdded }) {
    const [formData, setFormData] = useState({
        amount: "",
        paymentMode: "Cash",
        bankName: "",
        utrNo: "",
        paymentDate: "",
        status: "Active",
        remark: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(
                `http://localhost:5000/api/customers/${customerId}/installments`,
                formData
            );
            onAdded(res.data); // update parent customer
            setFormData({
                amount: "",
                paymentMode: "Cash",
                bankName: "",
                utrNo: "",
                paymentDate: "",
                status: "Active",
                remark: ""
            });
        } catch (err) {
            console.error("Add Installment Error:", err);
            alert("Failed to add installment");
        }
    };

    return (
        <form className="add-installment-form" onSubmit={handleSubmit}>
            <h3>➕ Add Installment</h3>
            <div className="form-grid">
                <input
                    type="number"
                    name="amount"
                    placeholder="Amount"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                />
                <select name="paymentMode" value={formData.paymentMode} onChange={handleChange}>
                    <option value="Cash">Cash</option>
                    <option value="Bank">Bank</option>
                </select>
                <input type="text" name="bankName" placeholder="Bank Name" value={formData.bankName} onChange={handleChange} />
                <input type="text" name="utrNo" placeholder="UTR No" value={formData.utrNo} onChange={handleChange} />
                <input type="date" name="paymentDate" value={formData.paymentDate} onChange={handleChange} />
                <select name="status" value={formData.status} onChange={handleChange}>
                    <option value="Active">Active</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
                <input type="text" name="remark" placeholder="Remark" value={formData.remark} onChange={handleChange} />
            </div>
            <button type="submit">💾 Add Installment</button>
        </form>
    );
}

export default AddInstallment;
