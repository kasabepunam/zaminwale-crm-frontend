import React, { useState, useEffect } from "react";
import "../styles/AdvancedFilterPopup.css";

function AdvancedFilterPopup({ show, onClose, onApplyFilters, savedFilters }) {
  // ✅ DEFAULT FILTERS
  const defaultFilters = {
    office: "All",
    village: "All",
    location: "All",
    status: "All",
    callingBy: "All",
    attendingBy: "All",
    startDate: "",
    endDate: ""
  };
  // ✅ LOCAL STATE USES PARENT SAVED FILTERS (NO AUTO RESET)
  const [filters, setFilters] = useState(savedFilters || defaultFilters);
  // ✅ WHEN POPUP OPENS → LOAD LAST APPLIED FILTERS (NOT RESET)
  useEffect(() => {
    if (show) {
      setFilters(savedFilters || defaultFilters);
    }
  }, [show, savedFilters]);
  // ✅ Dropdown Data
  const [dropdownData, setDropdownData] = useState({
    villages: [],
    locations: [],
    callingBy: [],
    attendingBy: []
  });
  // ✅ FETCH VALUES FROM DB
  useEffect(() => {
    if (!show) return;
    fetch("https://zaminwale-crm-backend-yztw.onrender.com/api/customers")
      .then(res => res.json())
      .then(data => {
        const clean = v => v ? v.toString().trim() : "";
        const getUnique = (key) => {
          const set = new Set();
          data.forEach(item => {
            const val = item[key];
            if (Array.isArray(val)) {
              val.forEach(v => v && set.add(clean(v)));
            } else {
              const cleaned = clean(val);
              if (cleaned) set.add(cleaned);
            }
          });
          return Array.from(set).sort();
        };
        setDropdownData({
          villages: getUnique("village"),
          locations: getUnique("location"),
          callingBy: getUnique("callingBy"),
          attendingBy: getUnique("attendingBy")
        });
      })
      .catch(err => console.error("Filter Fetch Error:", err));
  }, [show]);
  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  if (!show) return null;
  return (
    <div className="filter-modal-overlay">
      <div className="filter-modal">
        <div className="filter-header">
          <h2>Advanced Filters</h2>
          <button className="close-btn" onClick={onClose}>✖</button>
        </div>
        <div className="filter-grid">
          {/* ✅ OFFICE */}
          <div>
            <label>Office</label>
            <select
              value={filters.office}
              onChange={(e) => updateFilter("office", e.target.value)}
            >
              <option value="All">All Offices</option>
              <option value="Thane Office">Thane Office (ZWLTH)</option>
              <option value="Sanpada Office">Sanpada Office (ZWL / PLT)</option>
              <option value="Dadar Office">Dadar Office (ZWL/DLP)</option>
            </select>
          </div>
          <div>
            <label>Village</label>
            <select
              value={filters.village}
              onChange={(e) => updateFilter("village", e.target.value)}
            >
              <option value="All">All</option>
              {dropdownData.villages.map((v, i) => (
                <option key={i} value={v}>{v}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Location</label>
            <select
              value={filters.location}
              onChange={(e) => updateFilter("location", e.target.value)}
            >
              <option value="All">All</option>
              {dropdownData.locations.map((l, i) => (
                <option key={i} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Status</label>
            <select
              value={filters.status}
              onChange={(e) => updateFilter("status", e.target.value)}
            >
              <option value="All">All</option>
              <option value="Active Customer">Active Customer</option>
              <option value="Booking Cancelled">Cancelled</option>
              <option value="Refund">Refund</option>
              <option value="SALEDEED DONE">SALEDEED DONE</option>
            </select>
          </div>
          <div>
            <label>Calling By</label>
            <select
              value={filters.callingBy}
              onChange={(e) => updateFilter("callingBy", e.target.value)}
            >
              <option value="All">All</option>
              {dropdownData.callingBy.map((c, i) => (
                <option key={i} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Attending By</label>
            <select
              value={filters.attendingBy}
              onChange={(e) => updateFilter("attendingBy", e.target.value)}
            >
              <option value="All">All</option>
              {dropdownData.attendingBy.map((a, i) => (
                <option key={i} value={a}>{a}</option>
              ))}
            </select>
          </div>

          <div>
            <label>Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => updateFilter("startDate", e.target.value)}
            />
          </div>

          <div>
            <label>End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => updateFilter("endDate", e.target.value)}
            />
          </div>

        </div>

        <div className="filter-actions">

          <button
            className="reset-btn"
            onClick={() => setFilters(defaultFilters)}
          >
            Reset
          </button>

          <button
            className="apply-btn"
            onClick={() => {
              onApplyFilters(filters);   // ✅
              onClose();                 // ✅
            }}
          >
            Apply Filter
          </button>
        </div>
      </div>
    </div>
  );
}
export default AdvancedFilterPopup;
