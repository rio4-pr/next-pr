"use client";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function PieChart() {
  const data = {
    labels: ["ข่าว", "ไปราชการ", "รถ", "ค่าใช้จ่าย"],
    datasets: [
      {
        data: [22, 20, 18, 24],
      },
    ],
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false, // ⭐ สำคัญ
  };

  return <Doughnut data={data} options={options} />;
}
