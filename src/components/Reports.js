// src/pages/Reports.js
import React, { useContext, useState, useMemo, useEffect } from "react";
import { CustomerContext } from "../context/CustomerContext.js";
import { CSVLink } from "react-csv";
import EditReport from "../components/EditReport.js";
import "../styles/Reports.css";

const staffColumns = [
  "AASMA MAM", "NILESH SIR", "SHALAKA MAM", "JAVED PATHAN",
  "PRITEE . D", "AVADHUT", "SUVARNA", "CHAITANYA",
  "SIDDHESH", "MAHENDRA", "OMI GHARAT", "RAKHI",
  "SANDHYA", "SNEHAL", "VRUSHALI", "JYOTI",
  "YASH", "SRINIVAS", "PRATHAM", "SHAILA",
  "SHESHNATH SIR", "BHAGYASHREE", "RITESH", "RAVI D.",
  "PRERNA", "ASHOK BANSODE", "AADINATH", "NASREEN",
  "JITESH", "AKSHAY"
];

const Reports = () => {
  const { customers, loading, deleteCustomer } = useContext(CustomerContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const itemsPerPage = 20;

  const getStatus = (c) => {
    if (c.saleDeedDone) return "Sale Deed Done";
    if (c.extract712Done) return "7/12 Extract Done";
    if (c.refundBooking) return "Refund Booking";
    if (c.cancelBooking) return "Cancel Booking";
    return "Active";
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchSearch =
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.customerId?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus =
        filterStatus === "All" ||
        (filterStatus === "Active" && !c.cancelBooking && !c.refundBooking) ||
        (filterStatus === "SaleDeedDone" && c.saleDeedDone) ||
        (filterStatus === "712ExtractDone" && c.extract712Done) ||
        (filterStatus === "RefundBooking" && c.refundBooking) ||
        (filterStatus === "CancelBooking" && c.cancelBooking);

      return matchSearch && matchStatus;
    });
  }, [customers, searchTerm, filterStatus]);

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filteredCustomers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  // CSV Headers
  const csvHeaders = [
    { label: "SR NO", key: "srNo" },
    { label: "Date", key: "date" },
    { label: "Customer ID", key: "customerId" },
    { label: "Customer Name", key: "name" },
    { label: "BK/Installment", key: "bookingType" },
    { label: "Location", key: "location" },
    { label: "Booking Area", key: "bookingArea" },
    { label: "Rate", key: "rate" },
    { label: "Total Amount", key: "totalAmount" },
    { label: "BK/Install Amount", key: "bookingAmount" },
    { label: "Incentive Rate", key: "incentiveRate" },
    { label: "Amount", key: "incentiveAmount" },
    { label: "Calling", key: "calling" },
    { label: "Site Visit", key: "siteVisit" },
    { label: "Attending", key: "attending" },
    { label: "Closing", key: "closing" },
    ...staffColumns.map((s) => ({ label: s, key: s })),
    { label: "Total", key: "total" }
  ];

  // Edit & Delete
  const handleEdit = (customer) => setEditingCustomer(customer);

  const handleDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      deleteCustomer(id);
    }
  };

  const handleUpdate = async (updatedData) => {
    try {
      const res = await fetch(`/api/customers/${updatedData._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
      });
      if (res.ok) {
        const updatedCustomer = await res.json();
        // Update local state (or refetch customers)
        setEditingCustomer(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="reports-page">
      <h2>Customer Full Reports</h2>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="🔍 Search by Name or ID"
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          className="small-search"
        />

        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
          className="status-dropdown"
        >
          <option value="All">All</option>
          <option value="Active">Active Customers</option>
          <option value="SaleDeedDone">Sale Deed Done</option>
          <option value="712ExtractDone">7/12 Extract Done</option>
          <option value="RefundBooking">Refund Booking</option>
          <option value="CancelBooking">Cancel Booking</option>
        </select>

        <CSVLink
          data={filteredCustomers.map((c, idx) => ({
            srNo: idx + 1,
            date: c.date,
            customerId: c.customerId,
            name: c.name,
            bookingType: c.bookingType || "-",
            location: c.location,
            bookingArea: c.bookingArea,
            rate: c.rate,
            totalAmount: c.totalAmount,
            bookingAmount: c.bookingAmount,
            incentiveRate: c.incentiveRate || "-",
            incentiveAmount: c.incentiveAmount || "-",
            calling: c.calling || "-",
            siteVisit: c.siteVisit || "-",
            attending: c.attending || "-",
            closing: c.closing || "-",
            ...staffColumns.reduce((acc, s) => ({ ...acc, [s]: c.staff?.[s] || "-" }), {}),
            total: c.total || "-"
          }))}
          headers={csvHeaders}
          filename="full_customer_report.csv"
          className="export-btn"
        >
          ⬇ Export CSV
        </CSVLink>
      </div>

      {loading ? <p>Loading...</p> : (
        <div className="table-wrapper">
          <table className="reports-table">
            <thead>
              <tr>
                <th>SR NO</th>
                <th>Date</th>
                <th>Customer ID</th>
                <th>Customer Name</th>
                <th>BK/Installment</th>
                <th>Location</th>
                <th>Booking Area</th>
                <th>Rate</th>
                <th>Total Amount</th>
                <th>BK/Install Amount</th>
                <th>Incentive Rate</th>
                <th>Amount</th>
                <th>Calling</th>
                <th>Site Visit</th>
                <th>Attending</th>
                <th>Closing</th>
                {staffColumns.map((s) => (<th key={s}>{s}</th>))}
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? currentItems.map((c, idx) => (
                <tr key={c._id || `${c.customerId}-${idx}`}>
                  <td>{idx + 1}</td>
                  <td>{c.date}</td>
                  <td>{c.customerId}</td>
                  <td>{c.name}</td>
                  <td>{c.bookingType || "-"}</td>
                  <td>{c.location}</td>
                  <td>{c.bookingArea}</td>
                  <td>{c.rate}</td>
                  <td>{c.totalAmount}</td>
                  <td>{c.bookingAmount}</td>
                  <td>{c.incentiveRate || "-"}</td>
                  <td>{c.incentiveAmount || "-"}</td>
                  <td>{c.calling || "-"}</td>
                  <td>{c.siteVisit || "-"}</td>
                  <td>{c.attending || "-"}</td>
                  <td>{c.closing || "-"}</td>
                  {staffColumns.map((s) => <td key={s}>{c.staff?.[s] || "-"}</td>)}
                  <td>{c.total || "-"}</td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(c)}>✏️</button>
                    <button className="delete-btn" onClick={() => handleDelete(c._id, c.name)}>🗑️</button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={17 + staffColumns.length}>No matching customers found</td></tr>
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="pagination">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>⬅ Prev</button>
              <span>Page {currentPage} of {totalPages}</span>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next ➡</button>
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {editingCustomer && (
        <EditReport
          customer={editingCustomer}
          onClose={() => setEditingCustomer(null)}
          onUpdate={handleUpdate}


        />
      )}
    </div>
  );
};

export default Reports;
