// src/components/CustomerViewModal.js
import React from "react";
import "../styles/CustomerViewModal.css";

const CustomerViewModal = ({ customer, onClose }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-btn" onClick={onClose}>X</button>
                <h2>Customer Details</h2>

                <div className="customer-info">
                    <p><strong>ID:</strong> {customer.customerId}</p>
                    <p><strong>Name:</strong> {customer.name}</p>
                    <p><strong>Phone:</strong> {customer.phone}</p>
                    <p><strong>Alternate Phone:</strong> {customer.alternatePhone}</p>
                    <p><strong>Address:</strong> {customer.address}</p>
                    <p><strong>PAN:</strong> {customer.panCard}</p>
                    <p><strong>Aadhaar:</strong> {customer.aadhaarCard}</p>
                    <p><strong>Plot Area:</strong> {customer.plotArea}</p>
                    <p><strong>Rate:</strong> {customer.rate}</p>
                    <p><strong>Total Amount:</strong> {customer.totalAmount}</p>
                    <p><strong>Booking Amount:</strong> {customer.bookingAmount}</p>
                    <p><strong>Received Amount:</strong> {customer.receivedAmount}</p>
                    <p><strong>Balance Amount:</strong> {customer.balanceAmount}</p>
                    <p><strong>Location:</strong> {customer.location}</p>
                    <p><strong>Village:</strong> {customer.village}</p>
                    <p><strong>Bank Name:</strong> {customer.bankName}</p>
                    <p><strong>Payment Mode:</strong> {customer.paymentMode}</p>
                    <p><strong>UTR/Cheque No:</strong> {customer.utrChequeNo}</p>
                    <p><strong>Due Date:</strong> {customer.dueDate}</p>
                    <p><strong>Clear Date:</strong> {customer.clearDate}</p>
                    <p><strong>Sale Deed:</strong> {customer.saleDeed ? "Yes" : "No"}</p>
                    <p><strong>Cancel Booking:</strong> {customer.cancelBooking ? "Yes" : "No"}</p>
                    <p><strong>Remark:</strong> {customer.remark}</p>
                </div>

                <h3>Installments</h3>
                <table className="installments-table">
                    <thead>
                    <tr>
                        <th>No</th>
                        <th>Amount</th>
                        <th>Received</th>
                        <th>Balance</th>
                        <th>Payment Date</th>
                        <th>Next Due Date</th>
                        <th>Remark</th>
                    </tr>
                    </thead>
                    <tbody>
                    {(customer.installments || []).map((inst, idx) => (
                        <tr key={idx}>
                            <td>{inst.installmentNo}</td>
                            <td>{inst.installmentAmount}</td>
                            <td>{inst.receivedAmount}</td>
                            <td>{inst.balanceAmount}</td>
                            <td>{inst.paymentDate}</td>
                            <td>{inst.nextDueDate}</td>
                            <td>{inst.remark}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CustomerViewModal;
