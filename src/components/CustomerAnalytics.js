import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, ResponsiveContainer
} from "recharts";
import "../styles/CustomerAnalytics.css";

const COLORS = ["#4caf50", "#ff9800", "#f44336", "#2196f3"];
const ROWS_PER_PAGE = 10; // table rows per page

function CustomerAnalytics() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [filters, setFilters] = useState({
    office: "All",
    status: "All",
    startDate: "",
    endDate: ""
  });

  // Fetch Customers
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const res = await axios.get("https://zaminwale-crm-backend-yztw.onrender.com/api/customers");
        setCustomers(res.data);
      } catch (err) {
        console.error("Error fetching customers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  // Apply Filters
  const filteredCustomers = useMemo(() => {
    let data = [...customers];
    if (filters.office !== "All") data = data.filter(c => c.office === filters.office);
    if (filters.status !== "All") data = data.filter(c => (c.status || "").toLowerCase() === filters.status.toLowerCase());
    if (filters.startDate && filters.endDate) {
      data = data.filter(c => {
        const d = new Date(c.date);
        return d >= new Date(filters.startDate) && d <= new Date(filters.endDate);
      });
    }
    return data;
  }, [customers, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / ROWS_PER_PAGE);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  const handlePrev = () => setCurrentPage(p => Math.max(p - 1, 1));
  const handleNext = () => setCurrentPage(p => Math.min(p + 1, totalPages));

  // Summary Cards
  const summary = useMemo(() => {
    const total = filteredCustomers.length;
    const active = filteredCustomers.filter(c => (c.status || "").toLowerCase() === "Active Customers").length;
    const inactive = filteredCustomers.filter(c => (c.status || "").toLowerCase() === "for feit").length;
    const totalReceived = filteredCustomers.reduce((sum, c) => sum + (c.receivedAmount || 0), 0);
    const totalBalance = filteredCustomers.reduce((sum, c) => sum + (c.balanceAmount || 0), 0);
    return { total, active, inactive, totalReceived, totalBalance };
  }, [filteredCustomers]);

  // Pie Chart Data (Status Distribution)
  const statusData = useMemo(() => {
    const statusCount = {};
    filteredCustomers.forEach(c => {
      const s = c.status || "Unknown";
      statusCount[s] = (statusCount[s] || 0) + 1;
    });
    return Object.keys(statusCount).map((key, idx) => ({ name: key, value: statusCount[key], color: COLORS[idx % COLORS.length] }));
  }, [filteredCustomers]);

  // Bar Chart Data (Office-wise Collection)
  const officeData = useMemo(() => {
    const officeMap = {};
    filteredCustomers.forEach(c => {
      const office = c.office || "Other";
      if (!officeMap[office]) officeMap[office] = { office, receivedAmount: 0 };
      officeMap[office].receivedAmount += c.receivedAmount || 0;
    });
    return Object.values(officeMap);
  }, [filteredCustomers]);

  // Line Chart Data (Monthly Trend)
  const lineData = useMemo(() => {
    const monthMap = {};
    filteredCustomers.forEach(c => {
      if (!c.date) return;
      const d = new Date(c.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!monthMap[key]) monthMap[key] = { month: key, receivedAmount: 0 };
      monthMap[key].receivedAmount += c.receivedAmount || 0;
    });
    return Object.values(monthMap).sort((a, b) => new Date(a.month + "-01") - new Date(b.month + "-01"));
  }, [filteredCustomers]);

  return (
    <div className="analytics-container" style={{ marginLeft: "140px" }}>
      <h2>Customer Analytics</h2>

      {/* Filters */}
      <div className="analytics-filters">
        <select value={filters.office} onChange={e => setFilters(f => ({ ...f, office: e.target.value }))}>
          <option value="All">All Offices</option>
          <option value="Dadar Office">Dadar Office</option>
          <option value="Thane Office">Thane Office</option>
          <option value="Sanpada Office">Sanpada Office</option>
        </select>
        <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
          <option value="All">All Status</option>
          <option value="Active Customer">Active</option>
          <option value="For Feit">For Feit</option>
          <option value="SALEDEED DONE">SALEDEED DONE</option>
        </select>
        <input type="date" value={filters.startDate} onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))} />
        <input type="date" value={filters.endDate} onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))} />
      </div>

      {loading ? <p>Loading...</p> : (
        <>

          {/* Table */}
          <div className="analytics-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Sr. No</th>
                  <th>Date</th>
                  <th>Customer ID</th>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Total Amount</th>
                  <th>Received Amount</th>
                  <th>Balance Amount</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCustomers.map((c, i) => (
                  <tr key={c._id}>
                    <td>{(currentPage - 1) * ROWS_PER_PAGE + i + 1}</td>
                    <td>{c.date ? new Date(c.date).toLocaleDateString() : "-"}</td>
                    <td>{c.customerId}</td>
                    <td>{c.name}</td>
                    <td>{c.status}</td>
                    <td>₹{Number(c.totalAmount || 0).toLocaleString()}</td>
                    <td>₹{Number(c.receivedAmount || 0).toLocaleString()}</td>
                    <td>₹{Number(c.balanceAmount || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination-controls">
            <button onClick={handlePrev} disabled={currentPage === 1}>Prev</button>
            <span>Page {currentPage} of {totalPages}</span>
            <button onClick={handleNext} disabled={currentPage === totalPages}>Next</button>
          </div>
        </>
      )}
    </div>
  );
}

export default CustomerAnalytics;
