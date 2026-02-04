import React from "react";
import { Pie } from "react-chartjs-2";

function AmountPieChart({ data }) {
  const received = data.reduce((sum, x) => sum + Number(x.received || 0), 0);
  const balance = data.reduce((sum, x) => sum + Number(x.balance || 0), 0);

  const chartData = {
    labels: ["Received Amount", "Balance Amount"],
    datasets: [
      {
        data: [received, balance],
        backgroundColor: ["#4CAF50", "#F44336"],
      },
    ],
  };

  return (
    <div style={{ width: "400px" }}>
      <Pie data={chartData} />
    </div>
  );
}

export default AmountPieChart;
