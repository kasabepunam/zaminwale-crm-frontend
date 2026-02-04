import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import "../styles/Villa99Revenue.css";

const matchStatus = (status, filter) => {
  if (filter === "all") return true;
  if (!status) return false;

  const s = status.trim().toLowerCase();
  const f = filter.trim().toLowerCase();

  if (s === "saledeed done" || s === "sale deed done" || s === "sale-deed done")
    return f === "saledeed done";

  if (s === "active customer") return f === "active customer";

  if (s === "cancelled" || s === "booking cancelled") return f === "cancelled";

  return s === f;
};

const Villa99Revenue = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [monthStatusFilter, setMonthStatusFilter] = useState("all");
  const [monthTypeFilter, setMonthTypeFilter] = useState("all");
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 10;

  useEffect(() => {
    axios
      .get("http://192.168.29.50:5001/api/customers")
      .then((res) => setCustomers(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [startDate, endDate, monthStatusFilter, monthTypeFilter, propertyFilter]);

  // Filter customers by project, property, date range, status
  const filteredCustomers = useMemo(() => {
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    return customers.filter((c) => {
      if (!c.date) return false;
      if (c.project !== "99Villa") return false;
      if (propertyFilter !== "all" && c.propertyType !== propertyFilter) return false;

      const d = new Date(c.date);
      if (start && d < start) return false;
      if (end && d > end) return false;

      return matchStatus(c.status, monthStatusFilter);
    });
  }, [customers, startDate, endDate, monthStatusFilter, propertyFilter]);

  const calculateStats = (list) => {
    let revenue = 0,
      received = 0,
      saledeed = 0,
      bookingCount = 0,
      installmentCount = 0;

    list.forEach((c) => {
      const booking = Number(c.bookingAmount || 0);
      const installmentsSum =
        c.installments?.reduce((sum, i) => sum + Number(i.receivedAmount || 0), 0) || 0;

      revenue += Number(c.totalAmount || 0);
      received += booking + installmentsSum;
      if (matchStatus(c.status, "saledeed done")) saledeed++;
      if (booking > 0) bookingCount++;
      if (installmentsSum > 0) installmentCount++;
    });

    return { revenue, received, saledeed, bookingCount, installmentCount };
  };

  const stats = useMemo(() => calculateStats(filteredCustomers), [filteredCustomers]);

  const tableRows = useMemo(() => {
    const rows = [];
    filteredCustomers.forEach((c) => {
      // Booking rows
      if ((monthTypeFilter === "all" || monthTypeFilter === "booking") && c.bookingAmount > 0) {
        const d = new Date(c.date);
        if ((!startDate || d >= new Date(startDate)) && (!endDate || d <= new Date(endDate))) {
          rows.push({
            date: c.date,
            customerId: c.customerId,
            name: c.name,
            propertyType: c.propertyType,
            type: "Booking",
            received: c.bookingAmount,
            balance: c.balanceAmount,
            status: c.status,
          });
        }
      }

      // Installment rows
      if ((monthTypeFilter === "all" || monthTypeFilter === "installment") && c.installments?.length > 0) {
        c.installments.forEach((i) => {
          const instDate = new Date(i.installmentDate);
          if (
            i.receivedAmount > 0 &&
            (!startDate || instDate >= new Date(startDate)) &&
            (!endDate || instDate <= new Date(endDate))
          ) {
            rows.push({
              date: i.installmentDate,
              customerId: c.customerId,
              name: c.name,
              propertyType: c.propertyType,
              type: "Installment",
              received: i.receivedAmount,
              balance: c.balanceAmount,
              status: c.status,
            });
          }
        });
      }
    });

    return rows.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [filteredCustomers, monthTypeFilter, startDate, endDate]);

  const totalPages = Math.ceil(tableRows.length / rowsPerPage);
  const paginatedRows = tableRows.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const exportExcel = () => {
    if (!tableRows.length) return alert("No data to export");

    const excelData = tableRows.map((r, idx) => ({
      "Sr No": idx + 1,
      Date: new Date(r.date).toLocaleDateString("en-GB"),
      "Customer ID": r.customerId,
      Name: r.name,
      "Property Type": r.propertyType,
      Type: r.type,
      Received: r.received,
      Balance: r.balance,
      Status: r.status,
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "99Villa Revenue");
    XLSX.writeFile(
      wb,
      `99Villa_${propertyFilter}_${startDate || "start"}-${endDate || "end"}.xlsx`
    );
  };

  return (
    <div className="fy-revenue-container">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {/* Filters */}
          <div className="summary-header">
            <h3>99Villa Revenue Summary</h3>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <label>
                Start Date:{" "}
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </label>
              <label>
                End Date:{" "}
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </label>

              <select value={propertyFilter} onChange={(e) => setPropertyFilter(e.target.value)}>
                <option value="all">All (Plot + Bungalow)</option>
                <option value="Plot">Plot</option>
                <option value="Bungalow">Bungalow</option>
              </select>

              <select value={monthStatusFilter} onChange={(e) => setMonthStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="active customer">Active Customer</option>
                <option value="saledeed done">SaleDeed Done</option>
                <option value="cancelled">Booking Cancelled</option>
              </select>

              <select value={monthTypeFilter} onChange={(e) => setMonthTypeFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="booking">Booking</option>
                <option value="installment">Installment</option>
              </select>

              <button className="export-btn" onClick={exportExcel}>
                Export Excel
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="cards">
            <div className="card blue">
              <h4>Monthly Sale Booked </h4>
              <p>₹{stats.revenue.toLocaleString()}</p>
            </div>
            <div className="card green">
              <h4>Received</h4>
              <p>₹{stats.received.toLocaleString()}</p>
            </div>
            <div className="card orange">
              <h4>SaleDeed Done</h4>
              <p>{stats.saledeed}</p>
            </div>
            <div className="card teal">
              <h4>Booking Count</h4>
              <p>{stats.bookingCount}</p>
            </div>
            <div className="card pink">
              <h4>Installment Count</h4>
              <p>{stats.installmentCount}</p>
            </div>
          </div>

          {/* Table */}
          <table className="revenue-table">
            <thead>
              <tr>
                <th>Sr</th>
                <th>Date</th>
                <th>ID</th>
                <th>Name</th>
                <th>Property</th>
                <th>Type</th>
                <th>Received</th>
                <th>Balance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((r, idx) => (
                <tr key={r.customerId + r.date}>
                  <td>{(currentPage - 1) * rowsPerPage + idx + 1}</td>
                  <td>{new Date(r.date).toLocaleDateString("en-GB")}</td>
                  <td>{r.customerId}</td>
                  <td>{r.name}</td>
                  <td>{r.propertyType}</td>
                  <td>{r.type}</td>
                  <td>₹{r.received.toLocaleString()}</td>
                  <td>₹{r.balance?.toLocaleString() || 0}</td>
                  <td>{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default Villa99Revenue;
