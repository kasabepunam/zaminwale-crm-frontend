import React, { useContext, useMemo } from "react";
import { CustomerContext } from "../context/CustomerContext.js";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Chart.js register
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// ---------------- HELPERS ----------------
const normalize = (v = "") =>
  v.toString().toLowerCase().replace(/\s+/g, "");

const parseDate = (raw) => {
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d) ? null : d;
};
// -----------------------------------------

const StatusMonthGraphSpark = () => {
  const { customers } = useContext(CustomerContext);

  const chartData = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();

    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    const activeCounts = Array(12).fill(0);
    const saleDeedCounts = Array(12).fill(0);

    customers.forEach((c) => {
      const d = parseDate(c.date);
      if (!d || d.getFullYear() !== currentYear) return;

      const m = d.getMonth(); // 0–11
      const status = normalize(c.status);

      if (status === "active" || status === "activecustomer") {
        activeCounts[m]++;
      }

      if (status === "saledeeddone" || status === "saledeed") {
        saleDeedCounts[m]++;
      }
    });

    return {
      labels: months,
      datasets: [
        {
          label: "Booking",
          data: activeCounts,
          backgroundColor: "#1E90FF",
        },
        {
          label: "SaleDeed Done",
          data: saleDeedCounts,
          backgroundColor: "#28A745",
        },
      ],
    };
  }, [customers]);

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: `Jan – Dec ${new Date().getFullYear()} (Booking / SaleDeed)`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export default StatusMonthGraphSpark;
