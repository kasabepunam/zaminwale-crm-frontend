import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../styles/TotalReceived.css";

const BASE_URL = "https://zaminwale-crm-backend-yztw.onrender.com";

/* ================= DATE HELPERS ================= */
const parseDate = (raw) => {
  if (!raw) return null;

  if (typeof raw === "string" && raw.includes(".")) {
    const [dd, mm, yyyy] = raw.split(".");
    const d = new Date(yyyy, mm - 1, dd);
    d.setHours(12, 0, 0, 0);
    return d;
  }

  const d = new Date(raw);

  if (isNaN(d)) return null;

  d.setHours(12, 0, 0, 0);
  return d;
};

const formatDate = (d) => {
  if (!d) return "-";

  return `${String(d.getDate()).padStart(2, "0")}.${String(
    d.getMonth() + 1
  ).padStart(2, "0")}.${d.getFullYear()}`;
};

const dayStart = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

export default function TotalReceived() {
  const [customers, setCustomers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedVillage, setSelectedVillage] = useState("");

  /* ✅ NEW STATE */
  const [selectedType, setSelectedType] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];
  const [fromDate, setFromDate] = useState(todayStr);
  const [toDate, setToDate] = useState(todayStr);

  /* ============ PAGINATION ============ */
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 15;

  /* ================= FETCH ================= */
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/customers`)
      .then((res) => setCustomers(res.data || []))
      .catch(() => alert("Server connection failed"));
  }, []);

  /* ✅ Reset page when filter changes */
  useEffect(() => {
    setCurrentPage(1);
  }, [fromDate, toDate, searchText, selectedVillage, selectedType]);

  /* ================= UNIQUE VILLAGES ================= */
  const villages = useMemo(() => {
    return [...new Set(customers.map((c) => c.village).filter(Boolean))].sort();
  }, [customers]);

 /* ================= ALL ROWS ================= */
 const allRows = useMemo(() => {
   let rows = [];

   customers.forEach((c) => {

     // Skip cancelled/refund/bounce
     if (
       c.status?.toLowerCase().includes("cancel") ||
       c.status?.toLowerCase().includes("refund") ||
       c.status?.toLowerCase().includes("bounce")
     )
       return;

       /* ================= BOOKING (RECEIVED) ================= */

          const bookingDate = parseDate(c.date);

          const bookingReceived = Number(c.receivedAmount || 0);

          if (bookingDate && bookingReceived > 0) {
            rows.push({
              date: bookingDate,
              customerId: c.customerId,
              name: c.name,
              village: c.village,

              // ✅ Use receivedAmount (NOT bookingAmount)
              amount: bookingReceived,

              totalAmount: Number(
                c.totalAmount ||
                  c.grandTotal ||
                  c.finalAmount ||
                  c.plotTotal ||
                  0
              ),

              type: "Booking",
            });
          }


      /* ================= INSTALLMENTS ================= */

          (c.installments || []).forEach((inst) => {

            const instDate = parseDate(
              inst.installmentDate || inst.date || inst.paymentDate
            );

            const instAmount = Number(inst.receivedAmount || 0);

            if (instDate && instAmount > 0) {
              rows.push({
                date: instDate,
                customerId: c.customerId,
                name: c.name,
                village: c.village,

                // ✅ Only receivedAmount
                amount: instAmount,

                totalAmount: Number(
                  c.totalAmount ||
                    c.grandTotal ||
                    c.finalAmount ||
                    c.plotTotal ||
                    0
                ),

                type: "Installment",
              });
            }
          });

        });

        return rows;

      }, [customers]);

  /* ================= FILTER ================= */
  const filteredRows = useMemo(() => {
    const from = dayStart(new Date(fromDate));
    const to = dayStart(new Date(toDate));

    return allRows
      .filter((r) => dayStart(r.date) >= from && dayStart(r.date) <= to)
      .filter(
        (r) =>
          r.customerId.toLowerCase().includes(searchText.toLowerCase()) ||
          r.name.toLowerCase().includes(searchText.toLowerCase())
      )
      .filter((r) => !selectedVillage || r.village === selectedVillage)

      /* ✅ TYPE FILTER */
      .filter((r) => !selectedType || r.type === selectedType)

      .sort((a, b) => b.date - a.date);
  }, [
    allRows,
    fromDate,
    toDate,
    searchText,
    selectedVillage,
    selectedType,
  ]);

  /* ================= TOTALS ================= */
  const totalAmount = useMemo(
    () => filteredRows.reduce((s, r) => s + r.amount, 0),
    [filteredRows]
  );

  const bookingCount = filteredRows.filter(
    (r) => r.type === "Booking"
  ).length;

  const installmentCount = filteredRows.filter(
    (r) => r.type === "Installment"
  ).length;

  /* ================= TOTAL SALE BOOKED ================= */
  const totalSaleBooked = useMemo(() => {
    return filteredRows
      .filter((r) => r.type === "Booking")
      .reduce((s, r) => s + r.totalAmount, 0);
  }, [filteredRows]);

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);

  const paginatedRows = filteredRows.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  /* ================= EXPORT ================= */
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filteredRows.map((r) => ({
        Date: formatDate(r.date),
        "Customer ID": r.customerId,
        Name: r.name,
        Village: r.village,
        "Total Amount": r.totalAmount,
        Received: r.amount,
        Type: r.type,
      }))
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Collection");

    XLSX.writeFile(wb, "Collection_Report.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();

    doc.text("Collection Report", 14, 15);

    autoTable(doc, {
      startY: 20,
      head: [["Date", "Customer", "Name", "Village", "Total", "Received", "Type"]],
      body: filteredRows.map((r) => [
        formatDate(r.date),
        r.customerId,
        r.name,
        r.village,
        r.totalAmount,
        r.amount,
        r.type,
      ]),
    });

    doc.save("Collection_Report.pdf");
  };

  /* ================= UI ================= */
  return (
    <div className="total-received-container">
      <h2>Collection Report</h2>

      {/* ================= SUMMARY ================= */}
      <div className="summary-row">
        <div className="total-box">
          <h3>Total Collection</h3>
          <p>₹{totalAmount.toLocaleString()}</p>
        </div>

        <div className="total-box sale">
          <h3>Total Sale Booked</h3>
          <p>₹{totalSaleBooked.toLocaleString()}</p>
        </div>

        <div className="total-box booking">
          <h3>Bookings</h3>
          <p>{bookingCount}</p>
        </div>

        <div className="total-box installment">
          <h3>Installments</h3>
          <p>{installmentCount}</p>
        </div>
      </div>

      {/* ================= FILTER ================= */}
      <div className="filter-container">
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />

        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />

        <input
          type="text"
          placeholder="Search Customer"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        {/* Village */}
        <select
          value={selectedVillage}
          onChange={(e) => setSelectedVillage(e.target.value)}
        >
          <option value="">All Villages</option>

          {villages.map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>

        {/* ✅ Type Filter */}
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="Booking">Booking</option>
          <option value="Installment">Installment</option>
        </select>

        <button onClick={exportExcel}>Excel</button>
        <button onClick={exportPDF}>PDF</button>
      </div>

      {/* ================= TABLE ================= */}
      <table className="report-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Customer ID</th>
            <th>Name</th>
            <th>Village</th>
            <th>Total ₹</th>
            <th>Received ₹</th>
            <th>Type</th>
          </tr>
        </thead>

        <tbody>
          {paginatedRows.length ? (
            paginatedRows.map((r, i) => (
              <tr key={i}>
                <td>{formatDate(r.date)}</td>
                <td>{r.customerId}</td>
                <td>{r.name}</td>
                <td>{r.village}</td>
                <td>₹{r.totalAmount.toLocaleString()}</td>
                <td>₹{r.amount.toLocaleString()}</td>
                <td>{r.type}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7">No Data Found</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ================= PAGINATION ================= */}
      <div className="pagination">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          ⬅ Prev
        </button>

        <span>
          Page {currentPage} / {totalPages || 1}
        </span>

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          Next ➡
        </button>
      </div>
    </div>
  );
}
