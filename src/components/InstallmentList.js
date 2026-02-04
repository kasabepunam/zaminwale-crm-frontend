// src/pages/InstallmentCollection.js
import React, { useContext, useMemo, useEffect, useState } from "react";
import { CustomerContext } from "../context/CustomerContext.js";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "../styles/InstallmentCollection.css";

ChartJS.register(CategoryScale, LinearScale, ArcElement, BarElement, Title, Tooltip, Legend);

function InstallmentCollection() {
  const { customers } = useContext(CustomerContext);
  const [refreshKey, setRefreshKey] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [expandedCustomers, setExpandedCustomers] = useState({});

  useEffect(() => {
    const interval = setInterval(() => setRefreshKey((prev) => prev + 1), 120000);
    return () => clearInterval(interval);
  }, []);

  const toggleCustomer = (customerId) => {
    setExpandedCustomers((prev) => ({ ...prev, [customerId]: !prev[customerId] }));
  };

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    if (dateStr.includes("/")) {
      const [day, month, year] = dateStr.split("/");
      return new Date(`${year}-${month}-${day}`);
    }
    return new Date(dateStr);
  };

  const allInstallments = useMemo(() => {
    let list = [];
    customers.forEach((c) => {
      c.installments?.forEach((i, idx) => {
        list.push({
          customerId: c.customerId,
          name: c.name,
          amount: parseFloat(i.receivedAmount || 0),
          date: parseDate(i.installmentDate),
          installmentNo: i.installmentNo || idx + 1,
          nextDueDate: parseDate(i.nextDueDate || i.dueDate || null),
        });
      });
    });
    return list;
  }, [customers, refreshKey]);

  const filteredInstallments = useMemo(() => {
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    return allInstallments.filter((i) => {
      if (!i.date) return false;
      if (start && i.date < start) return false;
      if (end && i.date > end) return false;
      if (
        searchTerm &&
        !i.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !i.customerId.toLowerCase().includes(searchTerm.toLowerCase())
      )
        return false;
      return true;
    });
  }, [allInstallments, startDate, endDate, searchTerm]);

  const installmentsByCustomer = useMemo(() => {
    const grouped = {};
    filteredInstallments.forEach((i) => {
      if (!grouped[i.customerId]) grouped[i.customerId] = [];
      grouped[i.customerId].push(i);
    });
    return grouped;
  }, [filteredInstallments]);

  const today = new Date();
  const todayStr = today.toLocaleDateString();

  const todaysCollection = filteredInstallments
    .filter((i) => i.date?.toLocaleDateString() === todayStr)
    .reduce((sum, i) => sum + i.amount, 0);

  const rangeCollection = filteredInstallments.reduce((sum, i) => sum + i.amount, 0);

  const nextDueInstallments = useMemo(() => {
    const upcoming = allInstallments.filter((i) => i.nextDueDate && i.nextDueDate > today);
    return upcoming.sort((a, b) => a.nextDueDate - b.nextDueDate).slice(0, 5);
  }, [allInstallments]);

  const monthlyCollection = useMemo(() => {
    const months = Array(12).fill(0);
    filteredInstallments.forEach((i) => {
      if (i.date) months[i.date.getMonth()] += i.amount;
    });
    return months;
  }, [filteredInstallments]);

  const pieData = {
    labels: ["Today's Collection", "Date Range Collection"],
    datasets: [
      {
        data: [todaysCollection, rangeCollection],
        backgroundColor: ["#36A2EB", "#FF6384"],
        hoverBackgroundColor: ["#4FC3F7", "#FF7F9E"],
      },
    ],
  };

  const barData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      { label: "Monthly Collection (₹)", data: monthlyCollection, backgroundColor: "#36A2EB" },
    ],
  };

  const exportToCSV = () => {
    if (filteredInstallments.length === 0) {
      alert("No data to export!");
      return;
    }
    const headers = ["Customer ID", "Name", "Installment No", "Date", "Amount (₹)", "Next Due Date"];
    const rows = filteredInstallments.map((i) => [
      i.customerId,
      i.name,
      i.installmentNo,
      i.date ? i.date.toLocaleDateString() : "-",
      i.amount,
      i.nextDueDate ? i.nextDueDate.toLocaleDateString() : "-",
    ]);
    let csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Installment_Collections.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const customerIds = Object.keys(installmentsByCustomer);
  const totalPages = Math.ceil(customerIds.length / itemsPerPage);
  const paginatedCustomerIds = customerIds.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="installment-collection-body">
      <h1>💰 Installment Collection</h1>

      {/* Filters */}
      <div className="filter-panel compact">
        <input
          type="text"
          placeholder="🔍 Search Customer"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <button className="export-btn" onClick={exportToCSV}>
          ⬇ Export CSV
        </button>
      </div>

      {/* Summary Section */}
      <div className="collection-summary">
        <div className="summary-card blue">
          <h3>Today's Collection</h3>
          <p>₹{todaysCollection.toLocaleString()}</p>
        </div>
        <div className="summary-card green">
          <h3>Selected Date Range</h3>
          <p>₹{rangeCollection.toLocaleString()}</p>
        </div>
        <div className="summary-card orange">
          <h3>Upcoming Next Dues</h3>
          <ul>
            {nextDueInstallments.map((i, index) => (
              <li key={index}>
                <strong>{i.name}</strong> — {i.nextDueDate?.toLocaleDateString()} (₹{i.amount})
              </li>
            ))}
            {nextDueInstallments.length === 0 && <li>No upcoming dues</li>}
          </ul>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-section">
        <div className="chart-card medium">
          <h3>Today's vs Selected Range</h3>
          <Pie data={pieData} />
        </div>
        <div className="chart-card medium">
          <h3>Monthly Collection Trends</h3>
          <Bar data={barData} />
        </div>
      </div>

      {/* Table */}
      <div className="recent-collections">
        <h3>Filtered Installments</h3>
        <table className="installment-table">
          <thead>
            <tr>
              <th>Customer ID</th>
              <th>Name</th>
              <th>Installments</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCustomerIds.map((custId) => {
              const installments = installmentsByCustomer[custId];
              const isExpanded = expandedCustomers[custId];
              return (
                <React.Fragment key={custId}>
                  <tr className="main-row">
                    <td>{custId}</td>
                    <td>{installments[0].name}</td>
                    <td>{installments.length}</td>
                    <td>
                      <button className="show-btn" onClick={() => toggleCustomer(custId)}>
                        {isExpanded ? "▲ Hide" : "▼ Show"}
                      </button>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="expand-row">
                      <td colSpan="4">
                        <table className="nested-table">
                          <thead>
                            <tr>
                              <th>No</th>
                              <th>Date</th>
                              <th>Amount (₹)</th>
                              <th>Next Due Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {installments.map((inst, index) => (
                              <tr key={index}>
                                <td>{inst.installmentNo}</td>
                                <td>{inst.date?.toLocaleDateString() || "-"}</td>
                                <td>{inst.amount}</td>
                                <td>{inst.nextDueDate?.toLocaleDateString() || "-"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="prev-btn"
            >
              Prev
            </button>
            <span className="page-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="next-btn"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default InstallmentCollection;
