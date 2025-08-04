"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ExpensePieChart() {
  const { data: session, status } = useSession();
  const [summary, setSummary] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      // Only fetch if user is authenticated
      if (status === "loading") return; // Still loading session
      
      if (status === "unauthenticated" || !session) {
        setLoading(false);
        setError("Please sign in to view your expenses");
        return;
      }

      try {
        const res = await fetch("/api/user/expense-summary", {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        console.log("Fetched Summary:", data);
        setSummary(data);
        setError(null);
      } catch (error) {
        console.error("Failed to fetch summary:", error);
        setError("Failed to load expense data");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [session, status]); // Add session and status as dependencies

  // Show loading while session is being fetched
  if (status === "loading") {
    return <p>Loading...</p>;
  }

  // Show sign-in message if not authenticated
  if (status === "unauthenticated") {
    return (
      <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-md">
        <p className="text-center">Please sign in to view your expense breakdown</p>
      </div>
    );
  }

  // Show loading while fetching data
  if (loading) {
    return <p>Loading chart...</p>;
  }

  // Show error message
  if (error) {
    return (
      <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-md">
        <p className="text-center text-red-500">{error}</p>
      </div>
    );
  }

  // Show no data message
  if (!summary || Object.keys(summary).length === 0) {
    return (
      <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-md">
        <p className="text-center">No expense data available</p>
      </div>
    );
  }

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