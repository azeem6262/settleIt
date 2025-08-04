"use client";

import { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ExpensePieChart() {
  const [summary, setSummary] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch("/api/user/expense-summary", {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        console.log("Fetched Summary:", data)
        setSummary(data);
      } catch (error) {
        console.error("Failed to fetch summary:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) return <p>Loading chart...</p>;
  if (!summary || Object.keys(summary).length === 0)
    return <p>No expense data available</p>;

  const labels = Object.keys(summary);
  const values = Object.values(summary);

  const data = {
    labels,
    datasets: [
      {
        label: "Total Spent",
        data: values,
        backgroundColor: [
          "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-lg font-semibold text-center mb-4">Expense Breakdown</h2>
      <Pie data={data} />
    </div>
  );
}
