import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import EditCustomerModal from "./EditCustomerModal.js";
import AdvancedFilterPopup from "./AdvancedFilterPopup.js";
import WhatsappPopup from "./WhatsappPopup.js";
import "./CustomerList.css";
import "../styles/WhatsappPopup.css";

import { exportCustomersWithInstallments } from "../utils/exportExcel.js";
import { exportMonthlyReport } from "./exportMonthlyReport.js";

/* ✅ DATE FORMAT FUNCTION (dd-mm-yyyy) */
const formatDMY = (rawDate) => {
  if (!rawDate) return "";
  if (typeof rawDate === "string" && rawDate.match(/^\d{2}-\d{2}-\d{4}$/)) return rawDate;
  const date = new Date(rawDate);
  if (isNaN(date)) return rawDate;
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

function CustomerList() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showWP, setShowWP] = useState(false);
  const [wpCustomer, setWpCustomer] = useState(null);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const userData = JSON.parse(localStorage.getItem("user"));
  const userRole = userData?.role || "employee";

  /* ✅ ROLE HELPERS */
  const isAdmin = userRole === "admin" || userRole === "superadmin";

  // =================== FILTER STATE ======================
  const initialFilters = {
    searchTerm: "",
    office: "All",
    village: "All",
    status: "All",
    callingBy: "All",
    attendingBy: "All",
    startDate: "",
    endDate: "",
  };
  const [filters, setFilters] = useState(initialFilters);

  // =================== FETCH ======================
  const fetchCustomers = async () => {
    try {
      const res = await axios.get("https://zaminwale-crm-backend-yztw.onrender.com/api/customers");
      setCustomers(res.data);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetchCustomers();
    const interval = setInterval(fetchCustomers, 30000);
    return () => clearInterval(interval);
  }, []);

  // ================= OFFICE LOGIC =======================
  const resolveOffice = (customerId = "") => {
    const id = customerId.trim().toUpperCase();
    if (id.startsWith("ZWL/DLP") || id.includes("/DLP/")) return "Dadar Office";
    if (id.startsWith("ZWL/PLT") || id.includes("/PLT/") || id.startsWith("PLT")) return "Sanpada Office";
    if (id.startsWith("ZWLTH") || id.startsWith("ZWL/TH") || id.startsWith("ZWL")) return "Thane Office";
    return "Other";
  };

  // =================== FILTER ======================
  const filteredData = useMemo(() => {
    let data = [...customers];

    if (filters.searchTerm) {
      const s = filters.searchTerm.toLowerCase();
      data = data.filter(c =>
        c.customerId?.toLowerCase().includes(s) ||
        c.name?.toLowerCase().includes(s) ||
        c.village?.toLowerCase().includes(s)
      );
    }

    if (filters.office !== "All")
      data = data.filter(c => resolveOffice(c.customerId) === filters.office);

    if (filters.village !== "All")
      data = data.filter(c => c.village === filters.village);

    if (filters.status !== "All")
      data = data.filter(c => c.status?.toLowerCase().trim() === filters.status.toLowerCase().trim());

    if (filters.callingBy !== "All")
      data = data.filter(c => Array.isArray(c.callingBy) && c.callingBy.includes(filters.callingBy));

    if (filters.attendingBy !== "All")
      data = data.filter(c => Array.isArray(c.attendingBy) && c.attendingBy.includes(filters.attendingBy));

    if (filters.startDate && filters.endDate) {
      data = data.filter(c => {
        const d = new Date(c.date);
        return d >= new Date(filters.startDate) && d <= new Date(filters.endDate);
      });
    }

    return data;
  }, [customers, filters]);

  // =================== SORT ======================
  const sortedData = useMemo(() => {
    let data = [...filteredData];
    if (sortConfig.key) {
      data.sort((a, b) => {
        let A = a[sortConfig.key] || "";
        let B = b[sortConfig.key] || "";
        if (sortConfig.key === "date")
          return sortConfig.direction === "asc"
            ? new Date(A) - new Date(B)
            : new Date(B) - new Date(A);

        if (!isNaN(A) && !isNaN(B))
          return sortConfig.direction === "asc" ? A - B : B - A;

        return sortConfig.direction === "asc"
          ? A.toString().localeCompare(B.toString())
          : B.toString().localeCompare(A.toString());
      });
    }
    return data;
  }, [filteredData, sortConfig]);

  // =================== PAGINATION ======================
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // =================== ACTIONS ======================
  const handleSort = (key) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "asc"
          ? "desc"
          : "asc",
    });
  };

  const toggleSelectCustomer = (id) => {
    setSelectedCustomers(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
    setSelectAll(false);
  };

  const handleBulkDelete = async () => {
    if (selectedCustomers.length === 0) return alert("No customers selected!");
    if (!window.confirm("Confirm delete?")) return;

    await Promise.all(
      selectedCustomers.map(id =>
        axios.delete(`https://zaminwale-crm-backend-yztw.onrender.com/api/customers/${id}`)
      )
    );

    fetchCustomers();
    setSelectedCustomers([]);
    alert("Deleted successfully!");
  };

  // =================== RENDER ======================
  return (
    <div className="customer-list-container">
      <div className="controls clean-layout">
        <div className="searchbar">
          <i className="fa fa-search search-icon"></i>
          <input
            type="text"
            placeholder="Search by Customer ID, Name, Village..."
            value={filters.searchTerm}
            onChange={(e) =>
              setFilters({ ...filters, searchTerm: e.target.value })
            }
          />
        </div>

        <select
          className="office-dropdown"
          value={filters.office}
          onChange={e => setFilters({ ...filters, office: e.target.value })}
        >
          <option value="All">All Offices</option>
          <option value="Thane Office">Thane Office</option>
          <option value="Sanpada Office">Sanpada Office</option>
          <option value="Dadar Office">Dadar Office</option>
        </select>

        <button className="filter-toggle-btn" onClick={() => setShowFilterPanel(true)}>⚙ Filter</button>
        <button className="reset-btn" onClick={() => setFilters(initialFilters)}>Reset</button>

        {/* ✅ Excel Export → ALL USERS */}
        <button
          className="export-btn"
          onClick={() => exportCustomersWithInstallments(sortedData)}
        >
          Excel Export
        </button>

        {/* 🔒 Admin / Superadmin only */}
        {isAdmin && (
          <>
            <button
              className="export-btn"
              onClick={() => exportMonthlyReport(sortedData)}
            >
              Monthly Report
            </button>

            <button
              className="delete-btn"
              onClick={handleBulkDelete}
            >
              Delete Selected
            </button>
          </>
        )}

        <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
          {[10, 20, 50, 100].map(n => (
            <option key={n}>{n}</option>
          ))}
        </select>
      </div>

      <AdvancedFilterPopup
        show={showFilterPanel}
        onClose={() => setShowFilterPanel(false)}
        onApplyFilters={setFilters}
      />

      <div className="customer-table-wrapper">
        <table className="customer-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setSelectAll(checked);
                    setSelectedCustomers(
                      checked ? paginatedData.map(c => c._id) : []
                    );
                  }}
                />
              </th>
              <th>Sr. No</th>
              <th onClick={() => handleSort("date")}>Date</th>
              <th onClick={() => handleSort("customerId")}>Customer ID</th>
              <th>Name</th>
              <th>Address</th>
              <th>Phone</th>
              <th>Aadhar</th>
              <th>PAN</th>
              <th>Booking Area</th>
              <th>Rate</th>
              <th>Total</th>
              <th>Booking</th>
              <th>Received</th>
              <th>Balance</th>
              <th>Stamp</th>
              <th>Location</th>
              <th>Village</th>
              <th>MOU</th>
              <th>Bank</th>
              <th>Mode</th>
              <th>Cheque / UTR No</th>
              <th>Cheque Date</th>
              <th>Remark</th>
              <th>Status</th>
              <th>Calling By</th>
              <th>Attending By</th>
              <th>Closing By</th>
              <th>Site Visiting By</th>
              <th>WhatsApp</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((cust, index) => (
              <tr key={cust._id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedCustomers.includes(cust._id)}
                    onChange={() => toggleSelectCustomer(cust._id)}
                  />
                </td>

                <td>{(currentPage - 1) * pageSize + index + 1}</td>
                <td>{formatDMY(cust.date)}</td>
                <td>{cust.customerId}</td>

                <td
                  className="clickable-name"
                  onClick={() =>
                    navigate(`/customer-preview/${cust._id}`, {
                      state: { customer: cust },
                    })
                  }
                >
                  {cust.name}
                </td>

                <td>{cust.address}</td>
<td>
  {isAdmin
    ? cust.phone
    : "**********"}
</td>
                <td>{cust.aadharCard}</td>
                <td>{cust.panCard}</td>
                <td>{cust.bookingArea}</td>
                <td>{cust.rate}</td>
                <td>{cust.totalAmount}</td>
                <td>{cust.bookingAmount}</td>
                <td style={{ color: "green" }}>{cust.receivedAmount}</td>
                <td style={{ color: "red" }}>{cust.balanceAmount}</td>
                <td>{cust.stampDutyCharges}</td>
                <td>{cust.location}</td>
                <td>{cust.village}</td>
                <td>{cust.mouCharge}</td>
                <td>{cust.bankName}</td>
                <td>{cust.paymentMode}</td>
                <td className="cheque-column">
                  {cust.chequeNo?.toString().split("/").join("\n")}
                </td>
                <td>{formatDMY(cust.chequeDate)}</td>
                <td>{cust.remark}</td>
                <td>{cust.status}</td>
                <td>{Array.isArray(cust.callingBy) ? cust.callingBy.join(" / ") : "-"}</td>
                <td>{Array.isArray(cust.attendingBy) ? cust.attendingBy.join(" / ") : "-"}</td>
                <td>{Array.isArray(cust.closingBy) ? cust.closingBy.join(" / ") : "-"}</td>
                <td>{Array.isArray(cust.siteVisitBy) ? cust.siteVisitBy.join(" / ") : "-"}</td>

                <td>
                  <button
                    className="whatsapp-btn"
                    onClick={() => {
                      setWpCustomer(cust);
                      setShowWP(true);
                    }}
                  >
                    <i className="fab fa-whatsapp"></i>
                  </button>
                </td>

                <td>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        setSelectedCustomer(cust);
                        setShowEditModal(true);
                      }}
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</button>
        <span>{currentPage} / {totalPages}</span>
        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
      </div>

      {showEditModal && selectedCustomer && (
        <EditCustomerModal
          show={showEditModal}
          onClose={() => setShowEditModal(false)}
          customer={selectedCustomer}
          onSave={fetchCustomers}
        />
      )}

      {showWP && wpCustomer && (
        <WhatsappPopup
          customer={wpCustomer}
          onClose={() => setShowWP(false)}
          message={`Hello ${wpCustomer?.name}`}
        />
      )}
    </div>
  );
}

export default CustomerList;
