import React, { useState } from "react";
import axios from "axios";

function InstallmentForm({ customerId, fetchInstallments }) {
    const [form, setForm] = useState({
        installmentNo: "",
        installmentAmount: "",
        receivedAmount: "",
        utr: "",
        bankName: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:5000/api/installments", {
                ...form,
                customerId
            });
            alert("Installment Added!");
            fetchInstallments(); // refresh list
            setForm({
                installmentNo: "",
                installmentAmount: "",
                receivedAmount: "",
                utr: "",
                bankName: ""
            });
        } catch (err) {
            console.error(err);
            alert("Error adding installment");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="installment-form">
            <input type="number" name="installmentNo" placeholder="Installment No" value={form.installmentNo} onChange={handleChange} required />
            <input type="number" name="installmentAmount" placeholder="Installment Amount" value={form.installmentAmount} onChange={handleChange} required />
            <input type="number" name="receivedAmount" placeholder="Received Amount" value={form.receivedAmount} onChange={handleChange} />
            <input type="text" name="utr" placeholder="UTR No" value={form.utr} onChange={handleChange} />
            <input type="text" name="bankName" placeholder="Bank Name" value={form.bankName} onChange={handleChange} />
            <button type="submit">💾 Save</button>
        </form>
    );
}

export default InstallmentForm;
