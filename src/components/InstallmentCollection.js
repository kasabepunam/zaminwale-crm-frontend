import React, { useContext, useMemo, useState } from "react";
import { CustomerContext } from "../context/CustomerContext.js";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "../styles/InstallmentCollection.css";

const PAGE_SIZE = 20;

const InstallmentCollection = () => {
  const { customers } = useContext(CustomerContext);

  /* ================= DEFAULT LAST 30 DAYS ================= */
  const today = new Date();
  const last30Days = new Date();
  last30Days.setDate(today.getDate() - 30);

  const [start, setStart] = useState(last30Days.toISOString().split("T")[0]);
  const [end, setEnd] = useState(today.toISOString().split("T")[0]);
  const [village, setVillage] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [expandedCustomerId, setExpandedCustomerId] = useState(null);

  /* ================= SORTING ================= */
  const [sortField, setSortField] = useState("date"); // date | customerId
  const [sortOrder, setSortOrder] = useState("desc"); // asc | desc

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((p) => (p === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setPage(1);
  };

  /* ================= DATE HELPERS ================= */
  const parseDate = (value) => {
    if (!value) return null;
    if (value instanceof Date && !isNaN(value)) return value;
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(value);
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
      const [dd, mm, yyyy] = value.split("/").map(Number);
      return new Date(yyyy, mm - 1, dd);
    }
    return null;
  };

  const formatDate = (value) => {
    const d = parseDate(value);
    if (!d) return "";
    return `${String(d.getDate()).padStart(2, "0")}/${String(
      d.getMonth() + 1
    ).padStart(2, "0")}/${d.getFullYear()}`;
  };

  /* ================= TOTAL AMOUNT ================= */
  const getCustomerTotalAmount = (customer) => {
    if (customer.totalAmount) return Number(customer.totalAmount);
    const area = Number(customer.plotArea || 0);
    const rate = Number(customer.rate || 0);
    return area * rate;
  };

  /* ================= CUSTOMER INSTALLMENTS (DATE FILTERED) ================= */
  const getCustomerInstallmentsInRange = (customer) => {
    const s = start ? new Date(start) : null;
    const e = end ? new Date(end) : null;
    if (e) e.setHours(23, 59, 59, 999);

    return (customer.installments || [])
      .filter((i) => {
        const d = parseDate(i.installmentDate);
        if (!d) return false;
        if (s && d < s) return false;
        if (e && d > e) return false;
        if (village && customer.village !== village) return false;
        return true;
      })
      .sort(
        (a, b) =>
          parseDate(a.installmentDate) - parseDate(b.installmentDate)
      );
  };

  /* ================= FILTER + SORT ================= */
  const filteredCustomers = useMemo(() => {
    let list = customers
      .map((c) => ({
        ...c,
        filteredInstallments: getCustomerInstallmentsInRange(c),
      }))
      .filter((c) => c.filteredInstallments.length > 0)
      .filter(
        (c) =>
          c.customerId.toString().includes(search) ||
          c.name.toLowerCase().includes(search.toLowerCase())
      );

    list.sort((a, b) => {
      let valA, valB;

      if (sortField === "customerId") {
        valA = Number(a.customerId);
        valB = Number(b.customerId);
      }

      if (sortField === "date") {
        valA = parseDate(a.filteredInstallments[0]?.installmentDate);
        valB = parseDate(b.filteredInstallments[0]?.installmentDate);
      }

      if (!valA || !valB) return 0;
      return sortOrder === "asc" ? valA - valB : valB - valA;
    });

    return list;
  }, [customers, start, end, village, search, sortField, sortOrder]);

  /* ================= TOTAL RECEIVED & BALANCE ================= */
  const { totalReceived, totalBalance } = useMemo(() => {
    let received = 0;
    let balance = 0;

    filteredCustomers.forEach((c) => {
      const totalAmount = getCustomerTotalAmount(c);
      const customerReceived = c.filteredInstallments.reduce(
        (sum, i) => sum + Number(i.receivedAmount || 0),
        0
      );
      received += customerReceived;
      balance += totalAmount - customerReceived;
    });

    return { totalReceived: received, totalBalance: balance };
  }, [filteredCustomers]);

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(filteredCustomers.length / PAGE_SIZE);
  const paginated = filteredCustomers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const goPrev = () => setPage((p) => Math.max(p - 1, 1));
  const goNext = () => setPage((p) => Math.min(p + 1, totalPages));

  /* ================= EXCEL EXPORT ================= */
  const exportExcel = () => {
    const rows = [];

    filteredCustomers.forEach((c) => {
      const totalAmount = getCustomerTotalAmount(c);

      c.filteredInstallments.forEach((i, idx) => {
        rows.push({
          "Customer ID": c.customerId,
          Name: c.name,
          Village: c.village || "-",
          "Installment No": i.installmentNo || idx + 1,
          "Installment Date": formatDate(i.installmentDate),
          "Total Amount": totalAmount,
          "Installment Amount": i.installmentAmount,
          Received: i.receivedAmount,
          Balance: i.balanceAmount,
          Bank: i.bankName,
          Mode: i.paymentMode,
          "Cheque No / UTR No": i.chequeNo,
          "Cheque Date": formatDate(i.chequeDate),
          Status: i.status,
          Remark: i.remark,
        });
      });
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Installments");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf]), "Installment_Collection.xlsx");
  };

  /* ================= UI ================= */
  return (
    <div className="installment-collection-body">
      <h1>Installment Collection</h1>

      {/* ===== SUMMARY ===== */}
      <div className="summary-cards">
        <div className="summary-card received">
          <h3>Received Amount</h3>
          <p>₹ {totalReceived.toLocaleString("en-IN")}</p>
        </div>
        <div className="summary-card balance">
          <h3>Balance Amount</h3>
          <p>₹ {totalBalance.toLocaleString("en-IN")}</p>
        </div>
      </div>

      {/* ===== FILTERS ===== */}
      <div className="filter-row">
        <input
          type="text"
          placeholder="Search by Customer ID or Name"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />

        <input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />

        <select value={village} onChange={(e) => setVillage(e.target.value)}>
          <option value="">All Villages</option>
          {[...new Set(customers.map((c) => c.village))].map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>

        <button onClick={exportExcel}>Excel Export</button>
      </div>

      {/* ===== TABLE ===== */}
      <table className="customers-table">
        <thead>
          <tr>
            <th>Sr</th>

            <th onClick={() => handleSort("date")} style={{ cursor: "pointer" }}>
              Installment Date {sortField === "date" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
            </th>

            <th onClick={() => handleSort("customerId")} style={{ cursor: "pointer" }}>
              PLT No {sortField === "customerId" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
            </th>

            <th>Name</th>
            <th>Village</th>
            <th>Total Installments</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {paginated.map((c, i) => {
            const firstInstallment = c.filteredInstallments[0];
            const isExpanded = expandedCustomerId === c.customerId;

            return (
              <React.Fragment key={c.customerId}>
                <tr>
                  <td>{(page - 1) * PAGE_SIZE + i + 1}</td>
                  <td>{formatDate(firstInstallment?.installmentDate)}</td>
                  <td>{c.customerId}</td>
                  <td>{c.name}</td>
                  <td>{c.village}</td>
                  <td>{c.filteredInstallments.length}</td>
                  <td>
                    <button onClick={() =>
                      setExpandedCustomerId(isExpanded ? null : c.customerId)
                    }>
                      {isExpanded ? "Hide" : "Show"}
                    </button>
                  </td>
                </tr>

                {isExpanded && (
                  <tr>
                    <td colSpan={7}>
                      <table className="installment-inline-table">
                        <thead>
                          <tr>
                            <th>Sr</th>
                            <th>Date</th>
                            <th>Received</th>
                            <th>Balance</th>
                            <th>Bank</th>
                            <th>Mode</th>
                            <th>Cheque / UTR</th>
                            <th>Cheque Date</th>
                            <th>Status</th>
                            <th>Remark</th>
                          </tr>
                        </thead>
                        <tbody>
                          {c.filteredInstallments.map((i, idx) => (
                            <tr key={idx}>
                              <td>{i.installmentNo || idx + 1}</td>
                              <td>{formatDate(i.installmentDate)}</td>
                              <td>{i.receivedAmount}</td>
                              <td>{i.balanceAmount}</td>
                              <td>{i.bankName}</td>
                              <td>{i.paymentMode}</td>
                              <td>{i.chequeNo}</td>
                              <td>{formatDate(i.chequeDate)}</td>
                              <td>{i.status}</td>
                              <td>{i.remark}</td>
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

      {/* ===== PAGINATION ===== */}
      <div className="pagination">
        <button onClick={goPrev} disabled={page === 1}>Previous</button>
        <span>Page {page} of {totalPages}</span>
        <button onClick={goNext} disabled={page === totalPages}>Next</button>
      </div>
    </div>
  );
};

export default InstallmentCollection;
