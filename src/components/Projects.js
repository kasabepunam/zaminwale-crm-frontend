import React, { useState, useContext, useMemo } from "react";
import { CustomerContext } from "../context/CustomerContext.js";
import { CSVLink } from "react-csv";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import "../components/Projects.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

function Projects({ user }) {
  const { customers, loading } = useContext(CustomerContext);

  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedVillage, setSelectedVillage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [chartType, setChartType] = useState("bar");
  const itemsPerPage = 5;

  const maskPhone = (phone) => phone.replace(/\d(?=\d{4})/g, "*");

  // ---------------- Dynamic Locations and Villages ----------------
  const locationsMap = useMemo(() => {
    const map = {};
    customers.forEach((c) => {
      if (!c.location) return;
      if (!map[c.location]) map[c.location] = new Set();
      if (c.village) map[c.location].add(c.village);
    });
    Object.keys(map).forEach((loc) => {
      map[loc] = Array.from(map[loc]);
    });
    return map;
  }, [customers]);

  // ---------------- Filter Customers ----------------
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (selectedLocation && c.location !== selectedLocation) return false;
      if (selectedVillage && c.village !== selectedVillage) return false;
      return true;
    });
  }, [customers, selectedLocation, selectedVillage]);

  // ---------------- Pagination ----------------
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // ---------------- CSV headers ----------------
  const headers = [
    { label: "Customer ID", key: "customerId" },
    { label: "Name", key: "name" },
    { label: "Phone", key: "phone" },
    { label: "Total Amount", key: "totalAmount" },
    { label: "Booking Amount", key: "bookingAmount" },
    { label: "Balance Amount", key: "balanceAmount" },
    { label: "Location", key: "location" },
    { label: "Village", key: "village" },
  ];

  // ---------------- Chart Data ----------------
  const projectStats = useMemo(() => {
    if (!customers || customers.length === 0) {
      return { "Zaminwale Pvt Ltd": { count: 0, total: 0 }, "99 Villa": { count: 0, total: 0 } };
    }
    const stats = {};
    customers.forEach((c) => {
      if (!c.location) return;
      if (!stats[c.location]) stats[c.location] = { count: 0, total: 0 };
      stats[c.location].count += 1;
      stats[c.location].total += Number(c.totalAmount) || 0;
    });
    return stats;
  }, [customers]);

  const chartData = {
    labels: Object.keys(projectStats),
    datasets: [
      {
        label: "Total Customers",
        data: Object.values(projectStats).map((s) => s.count),
        backgroundColor: "rgba(75,192,192,0.5)",
      },
      {
        label: "Total Amount (₹)",
        data: Object.values(projectStats).map((s) => s.total),
        backgroundColor: "rgba(255,99,132,0.5)",
      },
    ],
  };

  // ---------------- RENDER ----------------
  return (
    <div className="projects-container">
      <h2>🗂 Projects / Locations</h2>



      {/* 🔹 CSV Export */}
      <div style={{ margin: "10px 0" }}>
        <CSVLink data={filteredCustomers} headers={headers} filename="customers.csv">
          Export CSV
        </CSVLink>
      </div>

      {/* 🔹 Location Dropdown */}
      <div className="location-filter">
        <h4>Select Location:</h4>
        <select
          value={selectedLocation}
          onChange={(e) => {
            setSelectedLocation(e.target.value);
            setSelectedVillage("");
            setCurrentPage(1);
          }}
        >
          <option value="">-- Select Location --</option>
          <option value="Zaminwale Pvt Ltd">Zaminwale Pvt Ltd</option>
          <option value="99 Villa">99 Villa</option>
        </select>
      </div>

      {/* 🔹 Village Filter */}
      {selectedLocation && locationsMap[selectedLocation] && (
        <div className="village-filter">
          <h4>Select Village:</h4>
          {locationsMap[selectedLocation].map((vill) => (
            <button
              key={vill}
              className={selectedVillage === vill ? "active" : ""}
              onClick={() => {
                setSelectedVillage(vill);
                setCurrentPage(1);
              }}
            >
              {vill}
            </button>
          ))}
          <button
            onClick={() => setSelectedVillage("")}
            className={selectedVillage === "" ? "active" : ""}
          >
            All Villages
          </button>
        </div>
      )}

      {/* 🔹 Customer Table */}
      {selectedLocation && (
        <div className="table-wrapper">
          <h4>
            Customers in "{selectedLocation}" {selectedVillage && `- ${selectedVillage}`}
          </h4>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <table className="customer-table">
              <thead>
                <tr>
                  <th>Customer ID</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Total Amount</th>
                  <th>Booking Amount</th>
                  <th>Balance Amount</th>
                  <th>Location</th>
                  <th>Village</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCustomers.length > 0 ? (
                  paginatedCustomers.map((c) => (
                    <tr key={c._id}>
                      <td>{c.customerId}</td>
                      <td>{c.name}</td>
                      <td>{user.role === "admin" ? c.phone : maskPhone(c.phone)}</td>
                      <td>{c.totalAmount}</td>
                      <td>{c.bookingAmount}</td>
                      <td>{c.balanceAmount}</td>
                      <td>{c.location}</td>
                      <td>{c.village}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center" }}>
                      No customers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {/* 🔹 Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination">
              <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
                Prev
              </button>
              <span>
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Projects;
