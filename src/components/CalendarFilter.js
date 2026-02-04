import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

// DATE PARSER (DD/MM/YYYY SUPPORT)
const parseDate = (dateStr) => {
  if (!dateStr) return null;
  const cleaned = dateStr.replace(/-/g, "/");
  const [day, month, year] = cleaned.split("/");
  return new Date(`${year}-${month}-${day}`);
};

function CalendarFilter({ data, onFilter }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  useEffect(() => {
    let filtered = data;

    if (selectedDate) {
      filtered = filtered.filter((item) => {
        const d = parseDate(item.date);
        return (
          d.getDate() === selectedDate.getDate() &&
          d.getMonth() === selectedDate.getMonth() &&
          d.getFullYear() === selectedDate.getFullYear()
        );
      });
    }

    if (selectedMonth !== "") {
      filtered = filtered.filter((item) => {
        const d = parseDate(item.date);
        return d.getMonth() + 1 === Number(selectedMonth);
      });
    }

    if (selectedYear !== "") {
      filtered = filtered.filter((item) => {
        const d = parseDate(item.date);
        return d.getFullYear() === Number(selectedYear);
      });
    }

    onFilter(filtered);
  }, [selectedDate, selectedMonth, selectedYear]);

  return (
    <div className="calendar-section">

      <div className="filters" style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <select onChange={(e) => setSelectedMonth(e.target.value)}>
          <option value="">Select Month</option>
          {[...Array(12)].map((x, i) => (
            <option key={i+1} value={i+1}>{i+1}</option>
          ))}
        </select>

        <select onChange={(e) => setSelectedYear(e.target.value)}>
          <option value="">Select Year</option>
          {[2022, 2023, 2024, 2025].map((yr) => (
            <option key={yr} value={yr}>{yr}</option>
          ))}
        </select>
      </div>

      <Calendar onChange={setSelectedDate} value={selectedDate} />

    </div>
  );
}

export default CalendarFilter;
