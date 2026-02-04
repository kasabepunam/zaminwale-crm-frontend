import React from "react";
import { Line } from "react-chartjs-2";

const parseDate = (dateStr) => {
  const cleaned = dateStr.replace(/-/g, "/");
  const [day, month, year] = cleaned.split("/");
  return new Date(`${year}-${month}-${day}`);
};

function MonthlyChart({ data }) {
  const months = Array(12).fill(0);

  data.forEach((item) => {
    const d = parseDate(item.date);
    months[d.getMonth()] += Number(item.received || 0);
  });

  const chartData = {
    labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
    datasets: [
      {
        label: "Monthly Received",
        data: months,
        borderWidth: 2,
        borderColor: "#2196F3",
        fill: false,
      },
    ],
  };

  return (
    <div style={{ width: "700px" }}>
      <Line data={chartData} />
    </div>
  );
}

export default MonthlyChart;
