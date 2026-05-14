"use client";

import { useEffect, useState } from "react";
import Timer from "@/components/Timer";
import ActivityList from "@/components/ActivityList";
import ManualEntryForm from "@/components/ManualEntryForm";
import Navbar from "@/components/Navbar";

type TimeLog = {
  id: string;
  projectName: string;
  startTime: string;
  endTime: string | null;
  duration: number | null;
  note: string | null;
  createdAt: string;
};

export default function EmployeeDashboard() {
  const [logs, setLogs] = useState<TimeLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/time/logs");
      const data = await res.json();
      if (data.logs) {
        setLogs(data.logs);
      }
    } catch (error) {
      console.error("Failed to fetch logs", error);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row gap-12">
        {/* Left Column: Timer */}
        <div className="w-full lg:w-1/3 flex flex-col">
          <Timer onStop={fetchLogs} />
          <ManualEntryForm onAdded={fetchLogs} />
        </div>

        {/* Right Column: Activity List */}
        <div className="w-full lg:w-2/3 flex flex-col">
          {loadingLogs ? (
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mb-4"></div>
              <p className="text-neutral-400 font-medium">Loading your activity...</p>
            </div>
          ) : (
            <ActivityList logs={logs} onChanged={fetchLogs} />
          )}
        </div>
      </main>
    </div>
  );
}
