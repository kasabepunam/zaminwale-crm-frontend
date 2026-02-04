import React, { useContext, useState, useMemo } from "react";
import { CustomerContext } from "../context/CustomerContext.js";
import "../styles/Installments.css";

function CustomerInstallmentsPage() {
  const { customers } = useContext(CustomerContext);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    if (dateStr.includes("/")) {
      const [day, month, year] = dateStr.split("/");
      return new Date(`${year}-${month}-${day}`);
    }
    return new Date(dateStr);
  };

  const filteredInstallments = useMemo(() => {
    let allInstallments = [];
    customers.forEach(c => {
      c.installments?.forEach(i => {
        const paymentDate = parseDate(i.installmentDate);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        if ((!start || paymentDate >= start) && (!end || paymentDate <= end)) {
          allInstallments.push({
            customerId: c.customerId,
            name: c.name,
            installmentNo: i.installmentNo,
            receivedAmount: i.receivedAmount,
            balanceAmount: i.balanceAmount,
            paymentDate: i.installmentDate,
            status: i.paid ? "Paid" : "Pending",
          });
        }
      });
    });
    // Sort by payment date
    allInstallments.sort((a, b) => parseDate(a.paymentDate) - parseDate(b.paymentDate));
    return allInstallments;
  }, [customers, startDate, endDate]);

  return (
    <div className="installments-page">
      <h2>💰 Installment Collection</h2>

      {/* Date Filter */}
      <div className="date-filter">
        <label>Start Date: </label>
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        <label>End Date: </label>
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
      </div>

      {/* Installments Table */}
      <div className="installments-table">
        <table>
          <thead>
            <tr>
              <th>Customer ID</th>
              <th>Name</th>
              <th>Installment No</th>
              <th>Received Amount (₹)</th>
              <th>Balance Amount (₹)</th>
              <th>Payment Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredInstallments.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: "center" }}>No installments found</td>
              </tr>
            )}
            {filteredInstallments.map((i, idx) => (
              <tr key={idx}>
                <td>{i.customerId}</td>
                <td>{i.name}</td>
                <td>{i.installmentNo}</td>
                <td>{i.receivedAmount}</td>
                <td>{i.balanceAmount}</td>
                <td>{i.paymentDate}</td>
                <td>{i.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CustomerInstallmentsPage;
