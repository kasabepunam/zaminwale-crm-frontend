import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import "../styles/InactiveCustomers.css";

// Excel export imports
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function InactiveCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 15;

  const [searchTerm, setSearchTerm] = useState("");
  const [filterVillage, setFilterVillage] = useState("All");

  // ---------------- Fetch Inactive customers ----------------
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("https://zaminwale-crm-backend-yztw.onrender.com/api/customers");

      // Filter inactive customers
      const inactiveCustomers = res.data.filter(
        (c) => (c.status || "").toLowerCase().includes("inactive")
      );

      setCustomers(inactiveCustomers);
    } catch (err) {
      console.error("Error fetching customers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // ---------------- Format date ----------------
  const formatDMY = (rawDate) => {
    if (!rawDate) return "-";
    const date = new Date(rawDate);
    if (isNaN(date)) return rawDate;

    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();

    return `${dd}-${mm}-${yyyy}`;
  };

  // ---------------- Filtered customers ----------------
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch =
        c.customerId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.address?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesVillage =
        filterVillage === "All" || c.village === filterVillage;

      return matchesSearch && matchesVillage;
    });
  }, [customers, searchTerm, filterVillage]);

  // ---------------- Count (For Card) ----------------
  const totalInactiveCount = filteredCustomers.length;

  // ---------------- Pagination ----------------
  const totalPages = Math.ceil(filteredCustomers.length / rowsPerPage);

  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePrev = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const handleNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  // ---------------- Unique villages ----------------
  const villageOptions = useMemo(() => {
    const villages = customers.map((c) => c.village).filter(Boolean);
    return ["All", ...Array.from(new Set(villages))];
  }, [customers]);

  // ---------------- Export Excel ----------------
  const exportToExcel = () => {
    if (!filteredCustomers.length) return;

    const data = filteredCustomers.map((c, i) => ({
      "Sr. No": i + 1,
      Date: formatDMY(c.date),
      "Customer ID": c.customerId,
      Name: c.name,
      Address: c.address,
      Status: c.status,
      "Total Amount": c.totalAmount || 0,
      "Received Amount": c.receivedAmount || 0,
      "Balance Amount": c.balanceAmount || 0,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Inactive Customers"
    );

    const wbout = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([wbout], {
      type: "application/octet-stream",
    });

    saveAs(blob, "Inactive_Customers.xlsx");
  };

  return (
    <div className="inactive-container">

      <h2 className="inactive-title">Inactive Customers</h2>

      {/* ===== Count Card ===== */}
      <div className="inactive-card">
        <h3>Total Inactive Customers</h3>
        <p>{totalInactiveCount}</p>
      </div>

      {/* ===== Search & Filter ===== */}
      <div className="filter-bar">

        <input
          type="text"
          placeholder="Search by Customer ID, Name, Address..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="search-box"
        />

        <select
          value={filterVillage}
          onChange={(e) => {
            setFilterVillage(e.target.value);
            setCurrentPage(1);
          }}
          className="village-filter"
        >
          {villageOptions.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>

        <button className="export-btn" onClick={exportToExcel}>
          Export to Excel
        </button>

      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {/* ===== Table ===== */}
          <div className="inactive-table-wrapper">

            <table>

              <thead>
                <tr>
                  <th>Sr. No</th>
                  <th>Date</th>
                  <th>Customer ID</th>
                  <th>Name</th>
                  <th>Address</th>
                  <th>Status</th>
                  <th>Total Amount</th>
                  <th>Received Amount</th>
                  <th>Balance Amount</th>
                </tr>
              </thead>

              <tbody>
                {paginatedCustomers.map((c, i) => (
                  <tr key={c._id}>

                    <td>
                      {(currentPage - 1) * rowsPerPage + i + 1}
                    </td>

                    <td>{formatDMY(c.date)}</td>
                    <td>{c.customerId}</td>
                    <td>{c.name}</td>
                    <td>{c.address}</td>
                    <td>{c.status}</td>

                    <td>
                      ₹{Number(c.totalAmount || 0).toLocaleString()}
                    </td>

                    <td>
                      ₹{Number(c.receivedAmount || 0).toLocaleString()}
                    </td>

                    <td>
                      ₹{Number(c.balanceAmount || 0).toLocaleString()}
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>

          </div>

          {/* ===== Pagination ===== */}
          <div className="pagination-controls">

            <button
              onClick={handlePrev}
              disabled={currentPage === 1}
            >
              Prev
            </button>

            <span>
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={handleNext}
              disabled={currentPage === totalPages}
            >
              Next
            </button>

          </div>
        </>
      )}
    </div>
  );
}

export default InactiveCustomers;
