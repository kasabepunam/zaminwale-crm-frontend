import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "../styles/Installments.css";

/* ================= DATE FORMAT ================= */
const formatDMY = (date) => {
  if (!date) return "-";
  const d = new Date(date);
  if (isNaN(d)) return "-";
  return `${String(d.getDate()).padStart(2, "0")}-${String(
    d.getMonth() + 1
  ).padStart(2, "0")}-${d.getFullYear()}`;
};

/* ================= PAGINATION ================= */
function Pagination({ totalPages, currentPage, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="pagination">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Prev
      </button>
      <span>
        Page {currentPage} / {totalPages}
      </span>
      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </button>
    </div>
  );
}

function Installments() {
  const [customers, setCustomers] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  const [dateSort, setDateSort] = useState("desc");
  const [idSort, setIdSort] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [activeCustomer, setActiveCustomer] = useState(null);
  const [activeInstallment, setActiveInstallment] = useState(null);

  const [form, setForm] = useState({
    installmentDate: "",
    installmentAmount: "",
    receivedAmount: "",
    balanceAmount: "",
    bankName: "",
    paymentMode: "Cash",
    chequeNo: "",
    chequeDate: "",
    status: "Pending",
    remark: "",
  });

  /* ================= FETCH ================= */
  const fetchCustomers = () => {
    axios.get("http://192.168.29.50:5001/api/customers").then((res) => {
      const data = res.data.map((c) => {
        const totalAmount = c.installments?.reduce(
          (acc, i) => acc + parseFloat(i.installmentAmount || 0),
          0
        );
        const receivedAmount = c.installments?.reduce(
          (acc, i) => acc + parseFloat(i.receivedAmount || 0),
          0
        );
        const balanceAmount = totalAmount - receivedAmount;
        return {
          ...c,
          totalAmount,
          receivedAmount,
          balanceAmount,
        };
      });
      setCustomers(data);
    });
  };
  useEffect(fetchCustomers, []);

  /* ================= FILTER ================= */
  const isSameMonth = (date) => {
    if (!date || !selectedMonth) return false;
    const d = new Date(date);
    const m = new Date(selectedMonth);
    return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear();
  };

  const filteredCustomers = useMemo(() => {
    setCurrentPage(1);

    let data = customers
      .map((c) => ({
        ...c,
        filteredInstallments: selectedMonth
          ? c.installments?.filter((i) => isSameMonth(i.installmentDate))
          : c.installments,
      }))
      .filter(
        (c) =>
          (c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.customerId?.toLowerCase().includes(searchTerm.toLowerCase())) &&
          c.filteredInstallments?.length > 0
      );

    if (idSort) {
      data.sort((a, b) => {
        const comp = a.customerId.localeCompare(b.customerId);
        return idSort === "asc" ? comp : -comp;
      });
    } else {
      data.sort((a, b) => {
        const da = new Date(a.date || a.createdAt);
        const db = new Date(b.date || b.createdAt);
        return dateSort === "asc" ? da - db : db - da;
      });
    }

    return data;
  }, [customers, searchTerm, selectedMonth, dateSort, idSort]);

  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCustomers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCustomers, currentPage]);

  /* ================= MODAL ================= */
  const openModal = (customer, installment = null) => {
    setActiveCustomer(customer);
    setActiveInstallment(installment);

    // 🔹 Total received amount of all previous installments
    let receivedAmount = 0;
    if (!installment && customer.installments?.length) {
      receivedAmount = customer.installments.reduce(
        (acc, i) => acc + parseFloat(i.receivedAmount || 0),
        0
      );
    }

    setForm(
      installment
        ? { ...installment }
        : {
            installmentDate: "",
            installmentAmount: "",
            receivedAmount: receivedAmount, // 🔹 auto-fill received amount
            balanceAmount: "",
            bankName: "",
            paymentMode: "Cash",
            chequeNo: "",
            chequeDate: "",
            status: "Paid",
            remark: "",
          }
    );

    setShowModal(true);
  };

  const handleFormChange = (field, value) => {
    let updatedForm = { ...form, [field]: value };
    const installmentAmt = parseFloat(
      field === "installmentAmount" ? value : updatedForm.installmentAmount
    );
    const receivedAmt = parseFloat(
      field === "receivedAmount" ? value : updatedForm.receivedAmount
    );

    if (!isNaN(installmentAmt) && !isNaN(receivedAmt)) {
      updatedForm.balanceAmount = (installmentAmt - receivedAmt).toFixed(2);
    }
    setForm(updatedForm);
  };

  const saveInstallment = async () => {
    if (activeInstallment) {
      await axios.put(
        `http://192.168.29.50:5001/api/customers/${activeCustomer._id}/installments/${activeInstallment._id}`,
        form
      );
    } else {
      await axios.post(
        `http://192.168.29.50:5001/api/customers/${activeCustomer._id}/installments`,
        form
      );
    }
    setShowModal(false);
    fetchCustomers();
  };

  const deleteInstallment = async (cid, iid) => {
    if (window.confirm("Delete this installment?")) {
      await axios.delete(
        `http://192.168.29.50:5001/api/customers/${cid}/installments/${iid}`
      );
      fetchCustomers();
    }
  };

  const exportToExcel = () => {
    const rows = [];
    filteredCustomers.forEach((c) => {
      c.filteredInstallments.forEach((i) => {
        rows.push({
          "Customer ID": c.customerId,
          Name: c.name,
          "Total Amount": c.totalAmount,
          Received: c.receivedAmount,
          Balance: c.balanceAmount,
          "Installment Date": formatDMY(i.installmentDate),
          Amount: i.installmentAmount,
          Bank: i.bankName,
          Mode: i.paymentMode,
          Cheque: i.chequeNo,
          Status: i.status,
        });
      });
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Installments");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf]), "Installments.xlsx");
  };
  return (
    <div className="installment-page-container">
      <h2>Installments Management</h2>

      <div className="controls">
        <input
          className="search-input"
          placeholder="Search by Name / ID"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        />
        <button onClick={exportToExcel}>Export Excel</button>
      </div>

      <div className="table-wrapper">
        <table className="installment-table">
          <thead>
            <tr>
              <th>Sr No</th>
              <th>Customer ID</th>
              <th>Name</th>
              <th>Village</th>
              <th>Total Amount</th>
              <th>Received</th>
              <th>Installments</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCustomers.map((c, idx) => (
              <React.Fragment key={c._id}>
                <tr>
                  <td>{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</td>
                  <td>{c.customerId}</td>
                  <td>{c.name}</td>
                  <td>{c.village}</td>
                  <td>{c.totalAmount}</td>
                  <td>{c.receivedAmount}</td>
                  <td>{c.filteredInstallments.length}</td>
                  <td>
                    <button
                      onClick={() =>
                        setExpanded((p) => ({ ...p, [c._id]: !p[c._id] }))
                      }
                    >
                      {expanded[c._id] ? "Hide" : "Show"}
                    </button>
                    <button onClick={() => openModal(c)}>+ Add</button>
                  </td>
                </tr>

                {expanded[c._id] && (
                  <tr>
                    <td colSpan="9">
                      <table className="inner-installment-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Received</th>
                            <th>Balance</th>
                            <th>Bank</th>
                            <th>Mode</th>
                            <th>Cheque</th>
                            <th>Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {c.filteredInstallments.map((i) => (
                            <tr key={i._id}>
                              <td>{formatDMY(i.installmentDate)}</td>
                              <td>{i.installmentAmount}</td>
                              <td>{i.receivedAmount}</td>
                              <td>{i.balanceAmount}</td>
                              <td>{i.bankName || "-"}</td>
                              <td>{i.paymentMode}</td>
                              <td>{i.chequeNo || "-"}</td>
                              <td>{i.status}</td>
                              <td>
                                <button onClick={() => openModal(c, i)}>Edit</button>
                                <button
                                  onClick={() => deleteInstallment(c._id, i._id)}
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="modal">
          <div className="modal-box">
            <h3>{activeInstallment ? "Edit Installment" : "Add Installment"}</h3>

            <input
              type="date"
              value={form.installmentDate}
              onChange={(e) => handleFormChange("installmentDate", e.target.value)}
              placeholder="Installment Date"
            />
            <input
              type="number"
              value={form.installmentAmount}
              onChange={(e) =>
                handleFormChange("installmentAmount", e.target.value)
              }
              placeholder="Installment Amount"
            />
            <input
              type="number"
              value={form.receivedAmount}
              onChange={(e) =>
                handleFormChange("receivedAmount", e.target.value)
              }
              placeholder="Received Amount"
            />
            <input
              type="number"
              value={form.balanceAmount}
              readOnly
              placeholder="Balance Amount"
            />
            <input
              type="text"
              value={form.bankName}
              onChange={(e) => handleFormChange("bankName", e.target.value)}
              placeholder="Bank Name"
            />
            <select
              value={form.paymentMode}
              onChange={(e) => handleFormChange("paymentMode", e.target.value)}
            >
              <option value="Cash">Cash</option>
              <option value="Cheque">Cheque</option>
              <option value="Online">Online</option>
            </select>
            <input
              type="text"
              value={form.chequeNo}
              onChange={(e) => handleFormChange("chequeNo", e.target.value)}
              placeholder="Cheque No"
            />
            <input
              type="date"
              value={form.chequeDate}
              onChange={(e) => handleFormChange("chequeDate", e.target.value)}
              placeholder="Cheque Date"
            />
            <select
              value={form.status}
              onChange={(e) => handleFormChange("status", e.target.value)}
            >
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
            </select>
            <textarea
              value={form.remark}
              onChange={(e) => handleFormChange("remark", e.target.value)}
              placeholder="Remark"
            />

            <div className="modal-actions">
              <button onClick={saveInstallment}>Save</button>
              <button onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Installments;
