// src/components/OverdueInstallmentsPage.js
import React, { useContext } from "react";
import { CustomerContext } from "../context/CustomerContext";
import { useNavigate } from "react-router-dom";

function OverdueInstallmentsPage() {
  const { customers } = useContext(CustomerContext);
  const navigate = useNavigate();

  const today = new Date();
  const overdueInstallments = [];

  customers.forEach(c => {
    c.installments?.forEach(inst => {
      if (!inst.paid && inst.nextDueDate && new Date(inst.nextDueDate) < today) {
        overdueInstallments.push({ ...inst, customerName: c.name, customerId: c._id });
      }
    });
  });

  return (
    <div>
      <h2>Overdue Installments</h2>
      <table>
        <thead>
          <tr>
            <th>Customer Name</th>
            <th>Installment Date</th>
            <th>Amount</th>
            <th>Balance</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {overdueInstallments.map((inst, idx) => (
            <tr key={idx}>
              <td>{inst.customerName}</td>
              <td>{inst.installmentDate}</td>
              <td>₹{inst.receivedAmount}</td>
              <td>₹{inst.balanceAmount}</td>
              <td>
                <button onClick={() => navigate(`/customers/${inst.customerId}`)}>View Customer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default OverdueInstallmentsPage;
