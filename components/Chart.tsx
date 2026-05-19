"use client";

import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
);

export default function Chart() {
  const data = {
    labels: ["10 พ.ค.", "11 พ.ค.", "12 พ.ค.", "13 พ.ค."],
    datasets: [
      {
        label: "ข่าว",
        data: [30, 40, 25, 35],
      },
      {
        label: "ไปราชการ",
        data: [20, 30, 15, 25],
      },
    ],
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false, // ⭐ สำคัญ
  };

  return <Line data={data} options={options} />;
}