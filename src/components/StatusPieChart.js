import React, { useMemo } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

// -------- HELPERS --------
const normalize = (v = "") =>
  v.toString().toLowerCase().replace(/\s+/g, "");

const parseDate = (raw) => {
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d) ? null : d;
};
// -------------------------

export default function StatusPieChart({ data = [] }) {
  const safeData = Array.isArray(data) ? data : [];

  const chartData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth(); // 0–11
    const currentYear = now.getFullYear();

    let active = 0;
    let saledeed = 0;
    let cancelled = 0;
    let refunded = 0;
    let chequeBounce = 0;

    safeData.forEach((c) => {
      const d = parseDate(c.date);
      if (
        !d ||
        d.getMonth() !== currentMonth ||
        d.getFullYear() !== currentYear
      )
        return;

      const status = normalize(c.status);

      if (status === "activecustomer" || status === "active") active++;
      else if (status === "saledeeddone") saledeed++;
      else if (status === "bookingcancelled") cancelled++;
      else if (status === "refunded") refunded++;
      else if (status === "chequebounce") chequeBounce++;
    });

    return {
      labels: [
        "Booking",
        "SaleDeed",
        "Booking Cancelled",
        "Refunded",
        "Cheque Bounce",
      ],
      datasets: [
        {
          data: [active, saledeed, cancelled, refunded, chequeBounce],
          backgroundColor: [
            "rgba(76, 175, 80, 0.85)",
            "rgba(33,150,243,0.85)",
            "rgba(255, 82, 82, 0.85)",
            "rgba(255, 193, 7, 0.85)",
            "rgba(156, 39, 176,0.85)",
          ],
          borderWidth: 2,
          borderColor: "#fff",
          hoverOffset: 12,
        },
      ],
    };
  }, [safeData]);

  return (
    <div style={{ width: "450px", height: "450px", margin: "0 auto" }}>
      <Pie
        data={chartData}
        options={{
          plugins: {
            legend: {
              position: "bottom",
              labels: { font: { size: 13 } },
            },
            title: {
              display: true,
              text: `${new Date().toLocaleString("default", {
                month: "long",
              })} ${new Date().getFullYear()} – Status`,
            },
          },
        }}
      />
    </div>
  );
}
