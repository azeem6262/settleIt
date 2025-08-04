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
      console.log("=== DEBUG INFO ===");
      console.log("Session status:", status);
      console.log("Session data:", session);
      console.log("Session user:", session?.user);
      console.log("Session user email:", session?.user?.email);
      console.log("Session user id:", session?.user?.id);

      // Only fetch if user is authenticated
      if (status === "loading") {
        console.log("Session still loading, waiting...");
        return;
      }
      
      if (status === "unauthenticated" || !session) {
        console.log("User not authenticated");
        setLoading(false);
        setError("Please sign in to view your expenses");
        return;
      }

      if (status === "authenticated" && session) {
        console.log("User authenticated, making API call...");
        
        try {
          const res = await fetch("/api/user/expense-summary", {
            method: "GET",
            credentials: "include",
            headers: {
              'Content-Type': 'application/json',
            },
          });

          console.log("Response status:", res.status);
          console.log("Response headers:", Object.fromEntries(res.headers.entries()));

          const data = await res.json();
          console.log("Response data:", data);

          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}, data: ${JSON.stringify(data)}`);
          }

          setSummary(data);
          setError(null);
        } catch (error) {
          if(error instanceof Error){
          console.error("Failed to fetch summary:", error);
          setError(`Failed to load expense data: ${error.message}`);}
        } finally {
          setLoading(false);
        }
      }
    };

    fetchSummary();
  }, [session, status]);

  // Show loading while session is being fetched
  if (status === "loading") {
    return <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-md">
      <p>Loading session...</p>
    </div>;
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
    return <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-md">
      <p>Loading chart data...</p>
    </div>;
  }

  // Show error message
  if (error) {
    return (
      <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-md">
        <p className="text-center text-red-500">{error}</p>
        <div className="mt-4 text-xs text-gray-500">
          <p>Debug info:</p>
          <p>Status: {status}</p>
          <p>Has session: {session ? 'Yes' : 'No'}</p>
          <p>User email: {session?.user?.email || 'N/A'}</p>
        </div>
      </div>
    );
  }

  // Show no data message
  if (!summary || Object.keys(summary).length === 0) {
    return (
      <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-md">
        <p className="text-center">No expense data available</p>
        <div className="mt-4 text-xs text-gray-500">
          <p>Session status: {status}</p>
          <p>User: {session?.user?.email}</p>
        </div>
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