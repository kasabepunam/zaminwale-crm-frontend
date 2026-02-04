// src/pages/Customers.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Customers.css";

function Customers() {
    const [customers, setCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    // ✅ Fetch all customers
    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
const res = await axios.get("http://192.168.29.50:5001/api/customers");
            setCustomers(res.data);
        } catch (err) {
            console.error("Error fetching customers:", err);
        }
    };

    // ✅ Filter customers by search
    const filteredCustomers = customers.filter((customer) =>
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="customers-page">
            <h2>Customer List</h2>

            <div className="search-container">
                <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="customers-table-container">
                <table className="customers-table">
                    <thead>
                    <tr>
                        <th>Date</th>
                        <th>Customer ID</th>
                        <th>Name</th>
                        <th>Phone</th>
                        <th>Booking Area</th>
                        <th>Rate</th>
                        <th>Total Amount</th>
                        <th>Booking Amount</th>
                        <th>Received Amount</th>
                        <th>Balance</th>
                        <th>Location</th>
                        <th>Village</th>
                        <th>Bank Name</th>
                        <th>Payment Mode</th>
                        <th>Remark</th>
                        <th>Action</th>
                    </tr>
                    </thead>

                    <tbody>
                    {filteredCustomers.length > 0 ? (
                        filteredCustomers.map((customer) => (
                            <tr key={customer._id}>
                                <td>{customer.date}</td>
                                <td>{customer.customerId}</td>
                                <td>{customer.name}</td>
                                <td>{customer.phone}</td>
                                <td>{customer.bookingArea}</td>
                                <td>{customer.rate}</td>
                                <td>{customer.totalAmount}</td>
                                <td>{customer.bookingAmount}</td>
                                <td>{customer.receivedAmount}</td>
                                <td>{customer.balanceAmount}</td>
                                <td>{customer.location}</td>
                                <td>{customer.village}</td>
                                <td>{customer.bankName}</td>
                                <td>{customer.paymentMode}</td>
                                <td>{customer.remark}</td>
                                <td>
                                    <button
                                        className="edit-btn"
                                        onClick={() => navigate(`/customers/${customer._id}/edit`)}
                                    >
                                        ✏️ Edit
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="16" style={{ textAlign: "center", padding: "20px" }}>
                                No customers found
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Customers;
