import React, { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { Navigate } from "react-router-dom";
import "../styles/ActiveCustomers.css";

const BASE_URL = "https://zaminwale-crm-backend-yztw.onrender.com";

const STATUS_VALUES = [

  "Active Customer",
  "SALEDEED DONE",
  "Cheque Bounce",
  "REFUND DONE",
  "BOOKING CANCELLED",
  "For Feit",
  "Booking",
  "Installment",
];
const BRANCH_MAP = {
  Sanpada: ["PLT/25-27/001"],
  Thane: ["ZWL/TH", "ZWL/25-26/001"],
  Dadar: ["ZWL/DLP","ZWL/DLP/055"],
};

const normalizeStatus = (status = "") =>
  (status || "").toLowerCase().trim().replace(/\s+/g, "");

const isActiveCustomer = (status = "") => normalizeStatus(status) === "activecustomer";
const isSaledeedCustomer = (status = "") => normalizeStatus(status) === "saledeeddone";
const isForFeitCustomer = (status = "") => normalizeStatus(status) === "forfeit";
const isInactiveCustomer = (status = "") => normalizeStatus(status) === "inactivecustomer";
const isRefundDoneCustomer = (status = "") => normalizeStatus(status) === "refunddone";
const isBookingCancelledCustomer = (status = "") => normalizeStatus(status) === "bookingcancelled";



// ✅ Get Branch from Customer ID (FIXED)
const getBranchFromCustomerId = (id = "") => {
  const cid = id.toUpperCase().trim();

  // First check specific patterns
  if (cid.startsWith("ZWL/DLP")) return "Dadar";
  if (cid.startsWith("PLT")) return "Sanpada";

  // Then general ZWL
  if (cid.startsWith("ZWL")) return "Thane";

  return "";
};


export default function ActiveCustomers() {
  const [allCustomers, setAllCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVillage, setSelectedVillage] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [sortConfig, setSortConfig] = useState({ key: "", direction: "asc" });
  const [selectedType, setSelectedType] = useState("All"); // Booking / Installment / All
  const [selectedBranch, setSelectedBranch] = useState("");

  const statusDropdownRef = useRef(null);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const user = useMemo(() => {
    const u = localStorage.getItem("user");
    return u ? JSON.parse(u) : null;
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchCustomers();
  }, [user]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/customers`);
      setAllCustomers(res.data);
    } catch (err) {
      console.error("Error fetching customers:", err);
    } finally {
      setLoading(false);
      setPage(1);
    }
  };

  if (!user) return <Navigate to="/login" replace />;

  const villageList = useMemo(() => {
    return [...new Set(allCustomers.map((c) => c.village).filter(Boolean))].sort();
  }, [allCustomers]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setStatusDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    const s = searchTerm.toLowerCase().trim();
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;
    if (from) from.setHours(0, 0, 0, 0);
    if (to) to.setHours(23, 59, 59, 999);

    return allCustomers.filter((c) => {

      // ===== Branch Filter =====
      if (selectedBranch) {
        const branch = getBranchFromCustomerId(c.customerId);

        if (branch !== selectedBranch) return false;
      }

      const entryDate = c.date ? new Date(c.date) : null;

      if (selectedStatuses.length > 0) {
        if (!selectedStatuses.includes(c.status)) return false;
      }

      const matchesSearch =
        !s ||
        String(c.customerId || "").toLowerCase().includes(s) ||
        String(c.name || "").toLowerCase().includes(s) ||
        String(c.village || "").toLowerCase().includes(s);

      const matchesVillage = !selectedVillage || c.village === selectedVillage;

      const matchesDate =
        (!from || (entryDate && entryDate >= from)) &&
        (!to || (entryDate && entryDate <= to));

      return matchesSearch && matchesVillage && matchesDate;
    });

  }, [allCustomers, searchTerm, selectedVillage, selectedStatuses, fromDate, toDate, selectedBranch]);

  const sortedFiltered = useMemo(() => {
    const data = [...filtered];
    if (!sortConfig.key) return data;

    data.sort((a, b) => {
      let aVal, bVal;
      if (sortConfig.key === "date") {
        aVal = a.date ? new Date(a.date) : new Date(0);
        bVal = b.date ? new Date(b.date) : new Date(0);
      } else {
        aVal = String(a[sortConfig.key] || "").toLowerCase();
        bVal = String(b[sortConfig.key] || "").toLowerCase();
      }

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return data;
  }, [filtered, sortConfig]);

  const typedData = useMemo(() => {
    const seenIds = new Set();

    return sortedFiltered
      .map((c) => {
        let type = "Booking";

        if (seenIds.has(c.customerId)) {
          type = "Installment";
        } else {
          seenIds.add(c.customerId);
        }

        return { ...c, type };
      })
      .filter((c) => {
        if (selectedType === "All") return true;
        return c.type === selectedType;
      });

  }, [sortedFiltered, selectedType]);


  const paginated = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return typedData.slice(start, start + rowsPerPage);
  }, [typedData, page, rowsPerPage]);

  // ================= COUNTS =================
  const bookingCount = useMemo(() => typedData.filter((c) => c.type === "Booking").length, [typedData]);
  const installmentCount = useMemo(() => typedData.filter((c) => c.type === "Installment").length, [typedData]);

  const activeCustomerCount = useMemo(() => {
    const activeIds = new Set();
    sortedFiltered.forEach((c) => {
      if (c.customerId && normalizeStatus(c.status) === "activecustomer") activeIds.add(c.customerId);
    });
    return activeIds.size;
  }, [sortedFiltered]);

  const summary = useMemo(() => {
    const uniqueCustomers = Array.from(
      new Map(sortedFiltered.map((c) => [c.customerId, c])).values()
    );

    return {
      totalActive: uniqueCustomers.filter((c) => isActiveCustomer(c.status)).length,

      totalSaledeed: uniqueCustomers.filter((c) => isSaledeedCustomer(c.status)).length,

      totalForFeit: uniqueCustomers.filter((c) => isForFeitCustomer(c.status)).length,

      totalInactive: uniqueCustomers.filter((c) => isInactiveCustomer(c.status)).length,

      totalRefund: uniqueCustomers.filter((c) => isRefundDoneCustomer(c.status)).length,

      // ✅ ADD THIS LINE
      totalBookingCancelled: uniqueCustomers.filter((c) =>
        isBookingCancelledCustomer(c.status)
      ).length,

      totalReceived: uniqueCustomers.reduce(
        (s, c) => s + Number(c.receivedAmount || 0),
        0
      ),

      totalBalance: uniqueCustomers.reduce(
        (s, c) => s + Number(c.balanceAmount || 0),
        0
      ),

      totalRevenue: uniqueCustomers.reduce(
        (s, c) => s + Number(c.totalAmount || 0),
        0
      ),
      // ✅ TOTAL BOOKING AMOUNT
      totalBookingAmount: uniqueCustomers.reduce(
        (s, c) => s + Number(c.bookingAmount || 0),
        0
      ),

    };
  }, [sortedFiltered]);


  const totalPages = Math.max(1, Math.ceil(typedData.length / rowsPerPage));
  const currentPage = Math.min(page, totalPages);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedVillage("");
    setSelectedStatuses([]);
    setFromDate("");
    setToDate("");
    setSortConfig({ key: "", direction: "asc" });
    setSelectedType("All");
    setSelectedBranch("");

    setPage(1);
  };

  const exportToExcel = () => {
    const data = typedData.map((c, i) => ({
      "Sr No": i + 1,
      Date: c.date ? new Date(c.date) : "",
      "Customer ID": c.customerId,
      Name: c.name,
      Location: c.location || "",
      Village: c.village,
      "Total Amount": Number(c.totalAmount || 0),
      Booking: Number(c.bookingAmount || 0),
      Received: Number(c.receivedAmount || 0),
      Balance: Number(c.balanceAmount || 0),
      Type: c.type,
      Status: c.status,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Customers");
    XLSX.writeFile(wb, "Customers.xlsx");
  };

  const statusClass = (status = "") => normalizeStatus(status);

  return (
    <div className="ac-page">
      <h2 className="ac-title">Active Customers</h2>

      {/* ================= FILTERS ================= */}
      <div className="ac-filters">
        <input
          className="ac-search"
          placeholder="Search ID / Name / Village"
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
        />
        <input
          type="date"
          className="ac-date"
          value={fromDate}
          onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
        />
        <input
          type="date"
          className="ac-date"
          value={toDate}
          onChange={(e) => { setToDate(e.target.value); setPage(1); }}
        />
        <select
          className="ac-dropdown"
          value={selectedVillage}
          onChange={(e) => { setSelectedVillage(e.target.value); setPage(1); }}
        >
          <option value="">Select Village</option>
          {villageList.map((v) => <option key={v}>{v}</option>)}
        </select>

       {/* Branch Filter */}
       <select
         className="ac-dropdown"
         value={selectedBranch}
         onChange={(e) => {
           setSelectedBranch(e.target.value);
           setPage(1);
         }}
       >
         <option value="">All Branches</option>
         <option value="Sanpada">Sanpada</option>
         <option value="Thane">Thane</option>
         <option value="Dadar">Dadar</option>
       </select>


        <select
          className="ac-dropdown"
          value={selectedType}
          onChange={(e) => { setSelectedType(e.target.value); setPage(1); }}
        >
          <option value="All">All Types</option>
          <option value="Booking">Booking</option>
          <option value="Installment">Installment</option>
        </select>

        {/* Status Multi-select */}
        <div className="ac-multiselect-dropdown" ref={statusDropdownRef}>
          <div
            className="ac-multiselect-header"
            onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
          >
            {selectedStatuses.length > 0 ? `${selectedStatuses.length} selected` : "Select Status"}
            <span className="arrow">{statusDropdownOpen ? "▲" : "▼"}</span>
          </div>
          {statusDropdownOpen && (
            <div className="ac-multiselect-options">
              {STATUS_VALUES.map((s) => (
                <label key={s} className="ac-checkbox-label">
                  <input
                    type="checkbox"
                    value={s}
                    checked={selectedStatuses.includes(s)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setSelectedStatuses((prev) =>
                        checked ? [...prev, s] : prev.filter((status) => status !== s)
                      );
                      setPage(1);
                    }}
                  />
                  {s}
                </label>
              ))}
            </div>
          )}
        </div>
        <button className="ac-btn export" onClick={exportToExcel}>Export Excel</button>
        <button className="ac-btn reset" onClick={resetFilters}>Reset</button>
      </div>


     {/* ================= SUMMARY ================= */}
     <div className="ac-summary eight">

       <div className="card">
         <div>BOOKING COUNT</div>
         <b>{bookingCount}</b>
       </div>

       <div className="card">
         <div>INSTALLMENT COUNT</div>
         <b>{installmentCount}</b>
       </div>

       <div className="card active">
         <div>ACTIVE CUSTOMERS</div>
         <b>{activeCustomerCount}</b>
       </div>

       <div className="card saledeed">
         <div>SALEDEED DONE</div>
         <b>
           {
             typedData
               .filter((c) =>
                 selectedStatuses.length === 0 ||
                 selectedStatuses.some(
                   (s) => normalizeStatus(s) === normalizeStatus(c.status)
                 )
               )
               .filter(
                 (c) => normalizeStatus(c.status) === "saledeeddone"
               ).length
           }
         </b>
       </div>

       <div className="card forfeit">
         <div>FOR FEIT</div>
         <b>{summary.totalForFeit}</b>
       </div>

       <div className="card inactive">
         <div>INACTIVE CUSTOMERS</div>
         <b>{summary.totalInactive}</b>
       </div>

       <div className="card refund">
         <div>REFUND DONE</div>
         <b>{summary.totalRefund}</b>
       </div>

       {/* ✅ NEW CARD */}
       <div className="card cancelled">
         <div>BOOKING CANCELLED</div>
         <b>{summary.totalBookingCancelled}</b>
       </div>
      {/* ✅ TOTAL BOOKING AMOUNT */}
      <div className="card booking-amount">
        <div>TOTAL BOOKING AMOUNT</div>
        <b>₹{summary.totalBookingAmount.toLocaleString()}</b>
      </div>

       <div className="card received">
         <div>TOTAL RECEIVED</div>
         <b>₹{summary.totalReceived.toLocaleString()}</b>
       </div>

       <div className="card balance">
         <div>TOTAL BALANCE</div>
         <b>₹{summary.totalBalance.toLocaleString()}</b>
       </div>

       <div className="card revenue">
         <div>SALE BOOKED</div>
         <b>₹{summary.totalRevenue.toLocaleString()}</b>
       </div>

     </div>

      {/* ================= TABLE ================= */}
      <div className="ac-table-wrap">
        <table className="ac-table">
          <thead>
            <tr>
              <th>Sr No</th>
              <th onClick={() => handleSort("date")} className="sortable">
                Date {sortConfig.key === "date" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
              </th>
              <th onClick={() => handleSort("customerId")} className="sortable">
                Customer ID {sortConfig.key === "customerId" ? (sortConfig.direction === "asc" ? "▲" : "▼") : ""}
              </th>
              <th>Name</th>
              <th>Location</th>
              <th>Village</th>
              <th>Total Amount</th>
              <th>Booking</th>
              <th>Received</th>
              <th>Balance</th>
              <th>Type</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {paginated.map((c, index) => (
              <tr key={c._id}>
                <td>{(currentPage - 1) * rowsPerPage + index + 1}</td>
                <td>{c.date ? new Date(c.date).toLocaleDateString("en-GB") : "-"}</td>
                <td>{c.customerId}</td>
                <td>{c.name}</td>
                <td>{c.location || "-"}</td>
                <td>{c.village}</td>
                <td>₹{Number(c.totalAmount || 0).toLocaleString()}</td>
                <td>₹{Number(c.bookingAmount || 0).toLocaleString()}</td>
                <td className="green">₹{Number(c.receivedAmount || 0).toLocaleString()}</td>
                <td className="red">₹{Number(c.balanceAmount || 0).toLocaleString()}</td>
                <td><span className={c.type === "Booking" ? "badge booking" : "badge installment"}>{c.type}</span></td>
                <td><span className={`status-badge ${statusClass(c.status)}`}>{c.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ================= PAGINATION ================= */}
        <div className="ac-pagination">
          <div>
            Rows:
            <select value={rowsPerPage} onChange={(e) => { setRowsPerPage(+e.target.value); setPage(1); }}>
              {[10, 25, 50, 100].map((n) => <option key={n}>{n}</option>)}
            </select>
          </div>
          <div className="page-controls">
            <button disabled={currentPage === 1} onClick={() => setPage(1)}>⏮</button>
            <button disabled={currentPage === 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
            {getPageNumbers().map((n) => (
              <button key={n} className={n === currentPage ? "active" : ""} onClick={() => setPage(n)}>{n}</button>
            ))}
            <button disabled={currentPage === totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
            <button disabled={currentPage === totalPages} onClick={() => setPage(totalPages)}>⏭</button>
          </div>
          <div className="page-info">
            Page {currentPage} / {totalPages} | Total {typedData.length}
          </div>
        </div>
      </div>
    </div>
  );
}
