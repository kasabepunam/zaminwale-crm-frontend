import React, { useContext, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { CustomerContext } from "../context/CustomerContext.js";
import "../styles/Dashboard.css";
import StatusPieChart from "../components/StatusPieChart.js";
import ProgressCircle from "../components/ProgressCircle.js";
import ThemeToggle from "../components/ThemeToggle.js";
import NotificationBell from "../components/NotificationBell.js";
import StatusMonthGraphSpark from "../components/StatusMonthGraphSpark.js";

// ---------------- HELPERS ----------------
const normalize = (v) => v?.toString().toLowerCase().replace(/\s+/g, "").trim();

export const isActiveCustomer = (status) => {
  const s = normalize(status);
  return s === "activecustomer" || s === "active";
};

const parseDate = (raw) => {
  if (!raw) return null;
  if (typeof raw === "string" && raw.includes(".")) {
    const [dd, mm, yyyy] = raw.split(".");
    return new Date(yyyy, mm - 1, dd);
  }
  if (typeof raw === "string" && raw.includes("/")) {
    const [dd, mm, yyyy] = raw.split("/");
    return new Date(yyyy, mm - 1, dd);
  }
  const d = new Date(raw);
  return isNaN(d) ? null : d;
};

const dayStart = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

// ---------------- DASHBOARD ----------------
const Dashboard = () => {
  const { customers } = useContext(CustomerContext);
  const navigate = useNavigate();
  const [selectedMonth] = useState(new Date());

  // ---------------- LOGOUT ----------------
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  // ---------------- VALID CUSTOMERS (EXCLUDE CANCELLED) ----------------
  const validCustomers = useMemo(() => {
    return customers.filter((c) => !normalize(c.status).includes("cancel"));
  }, [customers]);

  // ---------------- ACTIVE CUSTOMERS ----------------
  const activeCustomers = useMemo(
    () => validCustomers.filter((c) => isActiveCustomer(c.status)).length,
    [validCustomers]
  );

  // ---------------- TOTAL INSTALLMENTS ----------------
  const totalInstallments = useMemo(() => {
    return validCustomers.reduce((sum, c) => {
      return (
        sum +
        (c.installments?.reduce(
          (i, r) =>
            i +
            (Number(r.receivedAmount) ||
              Number(r.installmentAmount) ||
              Number(r.amount) ||
              0),
          0
        ) || 0)
      );
    }, 0);
  }, [validCustomers]);

  // ---------------- TODAY'S COLLECTION ----------------
  const todaysCollection = useMemo(() => {
    const today = dayStart(new Date()).getTime();
    let total = 0;

    validCustomers.forEach((c) => {
      const bookingDate = parseDate(c.date);
      if (bookingDate && dayStart(bookingDate).getTime() === today) {
        total += Number(c.bookingAmount || 0);
      }

      c.installments?.forEach((inst) => {
        const instDate = parseDate(
          inst.installmentDate || inst.paymentDate || inst.date
        );
        if (instDate && dayStart(instDate).getTime() === today) {
          total += Number(
            inst.receivedAmount || inst.installmentAmount || inst.amount || 0
          );
        }
      });
    });

    return total;
  }, [validCustomers]);

  // ---------------- MONTHLY COLLECTION ----------------
  const monthCollection = useMemo(() => {
    const month = selectedMonth.getMonth();
    const year = selectedMonth.getFullYear();
    let total = 0;

    validCustomers.forEach((c) => {
      const bookingDate = parseDate(c.date);
      if (
        bookingDate &&
        bookingDate.getMonth() === month &&
        bookingDate.getFullYear() === year
      ) {
        total += Number(c.bookingAmount || 0);
      }

      c.installments?.forEach((inst) => {
        const instDate = parseDate(inst.installmentDate || inst.date || inst.paymentDate);
        if (instDate && instDate.getMonth() === month && instDate.getFullYear() === year) {
          total += Number(inst.receivedAmount || inst.amount || inst.installmentAmount || 0);
        }
      });
    });

    return total;
  }, [validCustomers, selectedMonth]);

  // ---------------- NEXT DUE PAYMENTS ----------------
  const nextDuePayments = useMemo(() => {
    const today = dayStart(new Date()).getTime();

    return validCustomers
      .map((c) => {
        const nextDue = c.installments?.find((inst) => {
          const d = parseDate(inst.date);
          return d && dayStart(d).getTime() > today;
        });

        return nextDue
          ? {
              customerId: c.customerId || "-",
              name: c.name || "-",
              date: nextDue.date,
              amount: nextDue.amount || 0,
            }
          : null;
      })
      .filter(Boolean)
      .sort(
        (a, b) =>
          dayStart(parseDate(a.date)).getTime() - dayStart(parseDate(b.date)).getTime()
      )
      .slice(0, 10);
  }, [validCustomers]);

  // ---------------- JSX ----------------
  return (
    <div className="dashboard-container">
      {/* HEADER */}
      <div className="dashboard-header">
        {/* Search bar removed */}
      </div>

      {/* DASHBOARD CARDS */}
      <div className="dashboard-cards">
        <Link to="/total-received" className="card-link">
          <div className="crm-card card-blue">
            <div className="crm-card-icon">₹</div>
            <div className="crm-card-content">
              <span className="crm-card-title">Today's Collection</span>
              <span className="crm-card-value">
              </span>
              <span className="crm-card-sub">Today</span>
            </div>
          </div>
        </Link>

        <Link to="/total-collection" className="card-link">
          <div className="crm-card card-red">
            <div className="crm-card-icon">
              <i className="fa fa-calendar"></i>
            </div>
            <div className="crm-card-content">
              <span className="crm-card-title">Monthly Booking Report</span>
              <span className="crm-card-value"></span>
              <span className="crm-card-sub">Current Month</span>
            </div>
          </div>
        </Link>

        <Link to="/customers/active" className="card-link">
          <div className="crm-card card-orange">
            <div className="crm-card-icon">
              <i className="fa fa-users"></i>
            </div>
            <div className="crm-card-content">
              <span className="crm-card-title">Active Customers</span>
              <span className="crm-card-sub">Currently Active</span>
            </div>
          </div>
        </Link>

        <Link to="/dashboard/99villa" className="card-link">
          <div className="crm-card card-green">
            <div className="crm-card-icon">
              <i className="fa fa-home"></i>
            </div>
            <div className="crm-card-content">
              <span className="crm-card-title">99 Villa Project</span>
              <span className="crm-card-value">Bungalow / Plots</span>
              <span className="crm-card-sub">Project Overview</span>
            </div>
          </div>
        </Link>

        <Link to="/project-location" className="card-link">
          <div className="crm-card card-purple">
            <div className="crm-card-icon">
              <i className="fa fa-map-marker"></i>
            </div>
            <div className="crm-card-content">
              <span className="crm-card-title">Projects</span>
              <span className="crm-card-value">4</span>
              <span className="crm-card-sub">Active Locations</span>
            </div>
          </div>
        </Link>
      </div>

      {/* CHARTS */}
      <div className="charts-row">
        <div className="chart-card">
          <h3>Customer Status Overview</h3>
          <StatusPieChart data={validCustomers} />
        </div>
        <div className="chart-card">
          <h3>Year-wise Booking / SaleDeed</h3>
          <StatusMonthGraphSpark />
        </div>
      </div>

      {/* TABLES */}
      <div className="tables-row">
        <div className="table-card">
          <h3>Recent Customers</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer ID</th>
                <th>Name</th>
                <th>Received Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {validCustomers.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "15px" }}>
                    No customers found
                  </td>
                </tr>
              ) : (
                validCustomers.slice(0, 10).map((c) => {
                  let received = Number(c.bookingAmount || 0);

                  c.installments?.forEach((i) => {
                    received +=
                      Number(i.receivedAmount) ||
                      Number(i.installmentAmount) ||
                      Number(i.amount) ||
                      0;
                  });

                  return (
                    <tr key={c._id}>
                      <td>
                        {c.date
                          ? dayStart(parseDate(c.date)).toLocaleDateString("en-GB")
                          : "-"}
                      </td>
                      <td>{c.customerId || "-"}</td>
                      <td>{c.name || "-"}</td>
                      <td>₹{received.toLocaleString()}</td>
                      <td>{c.status || "-"}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="table-card">
          <h3>Next Due Payments</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {nextDuePayments.map((p, i) => {
                const due = dayStart(parseDate(p.date));
                const today = dayStart(new Date());
                return (
                  <tr key={i}>
                    <td>{p.customerId}</td>
                    <td>{p.name}</td>
                    <td>{due.toLocaleDateString()}</td>
                    <td>₹{p.amount.toLocaleString()}</td>
                    <td>
                      {due < today
                        ? "Overdue"
                        : due.getTime() === today.getTime()
                        ? "Today"
                        : "Upcoming"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
