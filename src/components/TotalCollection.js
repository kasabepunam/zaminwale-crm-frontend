import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import "../styles/TotalCollection.css";

/* ================= DATE FORMATTER ================= */
const formatDateDMY = (dateValue) => {
  if (!dateValue) return "-";
  const d = new Date(dateValue);
  if (isNaN(d)) return "-";
  return `${String(d.getDate()).padStart(2, "0")}.${String(
    d.getMonth() + 1
  ).padStart(2, "0")}.${d.getFullYear()}`;
};

/* ================= DATE RANGE CHECK ================= */
const isWithinRange = (dateValue, start, end) => {
  if (!dateValue) return false;
  const d = new Date(dateValue);
  if (isNaN(d)) return false;
  if (start && d < new Date(start)) return false;
  if (end && d > new Date(end)) return false;
  return true;
};

/* ================= STATUS MATCH ================= */
const matchStatus = (status, filter) => {
  if (filter === "all") return true;
  if (!status) return false;

  const s = status.trim().toLowerCase();
  const f = filter.trim().toLowerCase();

  if (
    s === "saledeed done" ||
    s === "sale deed done" ||
    s === "sale-deed done"
  ) {
    return f === "saledeed done";
  }

  if (s === "active customer") {
    return f === "active customer";
  }

  return s === f;
};

const MonthlyRevenue = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  /* DATE RANGE */
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  /* FILTERS */
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [villageFilter, setVillageFilter] = useState("all");

  /* SORT */
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc",
  });

  /* PAGINATION */
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 15;

  /* ================= FETCH ================= */
  useEffect(() => {
    axios
      .get("https://zaminwale-crm-backend-yztw.onrender.com/api/customers")
      .then((res) => setCustomers(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [startDate, endDate, statusFilter, typeFilter, villageFilter]);

  /* ================= VILLAGES ================= */
  const villages = useMemo(() => {
    const v = new Set(customers.map((c) => c.village).filter(Boolean));
    return ["all", ...Array.from(v)];
  }, [customers]);

  /* ================= TABLE ROWS ================= */
  const tableRows = useMemo(() => {
    const rows = [];

    customers.forEach((c) => {
      if (villageFilter !== "all" && c.village !== villageFilter) return;

      /* BOOKING */
      if (
        (typeFilter === "all" || typeFilter === "booking") &&
        Number(c.bookingAmount) > 0 &&
        isWithinRange(c.date, startDate, endDate) &&
        matchStatus(c.status, statusFilter)
      ) {
        rows.push({
          date: c.date,
          customerId: c.customerId,
          name: c.name,
          type: "Booking",
          totalAmount: Number(c.totalAmount || 0),
          received: Number(c.receivedAmount || 0),
          balance: Number(c.balanceAmount || 0),
          status: c.status,
          location: c.location || "-",
          village: c.village || "-",
        });
      }

      /* INSTALLMENT */
      if (
        (typeFilter === "all" || typeFilter === "installment") &&
        c.installments?.length
      ) {
        c.installments.forEach((i) => {
          if (
            Number(i.receivedAmount) > 0 &&
            isWithinRange(i.installmentDate, startDate, endDate) &&
            matchStatus(c.status, statusFilter)
          ) {
            rows.push({
              date: i.installmentDate,
              customerId: c.customerId,
              name: c.name,
              type: "Installment",
              totalAmount: Number(c.totalAmount || 0),
              received: Number(i.receivedAmount || 0),
              balance: Number(c.balanceAmount || 0),
              status: c.status,
              location: c.location || "-",
              village: c.village || "-",
            });
          }
        });
      }
    });

    return rows;
  }, [customers, startDate, endDate, statusFilter, typeFilter, villageFilter]);

  /* ================= SORT ================= */
  const sortedRows = useMemo(() => {
    const data = [...tableRows];
    data.sort((a, b) => {
      let av = a[sortConfig.key];
      let bv = b[sortConfig.key];
      if (sortConfig.key === "date") {
        av = new Date(av);
        bv = new Date(bv);
      }
      if (av < bv) return sortConfig.direction === "asc" ? -1 : 1;
      if (av > bv) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
    return data;
  }, [tableRows, sortConfig]);

  /* ================= STATS (COMMON LOGIC FIXED) ================= */
  const stats = useMemo(() => {
    let revenue = 0;
    let received = 0;
    let saledeed = 0;
    let bookingCount = 0;
    let installmentCount = 0;

    tableRows.forEach((r) => {
      if (r.type === "Booking") {
        revenue += r.totalAmount; // ✅ Sales Booked = ONLY Booking
        bookingCount++;
      } else {
        installmentCount++;
      }

      received += r.received; // ✅ Received = Booking + Installment

      if (matchStatus(r.status, "saledeed done")) saledeed++;
    });

    return { revenue, received, saledeed, bookingCount, installmentCount };
  }, [tableRows]);

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(sortedRows.length / rowsPerPage);
  const paginatedRows = sortedRows.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  /* ================= EXCEL ================= */
  const exportExcel = () => {
    if (!tableRows.length) return alert("No data");

    const data = tableRows.map((r, i) => ({
      "Sr No": i + 1,
      Date: formatDateDMY(r.date),
      "Customer ID": r.customerId,
      Name: r.name,
      Type: r.type,
      "Total Amount": r.totalAmount,
      Received: r.received,
      Balance: r.balance,
      Status: r.status,
      Location: r.location,
      Village: r.village,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Revenue");
    XLSX.writeFile(wb, "Monthly_Revenue.xlsx");
  };

  /* ================= JSX ================= */
  return (
    <div className="fy-revenue-container">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {/* FILTERS */}
          <div className="summary-header">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="active customer">Sales Booked</option>
              <option value="saledeed done">SaleDeed Done</option>
            </select>

            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="all">All</option>
              <option value="booking">Booking</option>
              <option value="installment">Installment</option>
            </select>

            <select value={villageFilter} onChange={(e) => setVillageFilter(e.target.value)}>
              {villages.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>

            <button className="export-btn" onClick={exportExcel}>Export Excel</button>
          </div>

          {/* CARDS */}
          <div className="cards">
            <div className="card blue"><h4>Sales Booked</h4><p>₹{stats.revenue.toLocaleString()}</p></div>
            <div className="card green"><h4>Received</h4><p>₹{stats.received.toLocaleString()}</p></div>
            <div className="card orange"><h4>SaleDeed Done</h4><p>{stats.saledeed}</p></div>
            <div className="card teal"><h4>Booking Count</h4><p>{stats.bookingCount}</p></div>
            <div className="card pink"><h4>Installment Count</h4><p>{stats.installmentCount}</p></div>
          </div>

          {/* TABLE */}
          <table className="revenue-table">
            <thead>
              <tr>
                <th>Sr No</th>
                <th>Date</th>
                <th>ID</th>
                <th>Name</th>
                <th>Type</th>
                <th>Total</th>
                <th>Received</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Location</th>
                <th>Village</th>
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((r, i) => (
                <tr key={i}>
                  <td>{(currentPage - 1) * rowsPerPage + i + 1}</td>
                  <td>{formatDateDMY(r.date)}</td>
                  <td>{r.customerId}</td>
                  <td>{r.name}</td>
                  <td>{r.type}</td>
                  <td>₹{r.totalAmount.toLocaleString()}</td>
                  <td>₹{r.received.toLocaleString()}</td>
                  <td>₹{r.balance.toLocaleString()}</td>
                  <td>{r.status}</td>
                  <td>{r.location}</td>
                  <td>{r.village}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="pagination">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</button>
              <span>{currentPage} / {totalPages}</span>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MonthlyRevenue;
