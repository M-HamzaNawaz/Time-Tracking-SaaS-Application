"use client";

import { useEffect, useState } from "react";
import Timer from "@/components/Timer";
import ActivityList from "@/components/ActivityList";
import ManualEntryForm from "@/components/ManualEntryForm";
import Navbar from "@/components/Navbar";
import { Download } from "lucide-react";

type TimeLog = {
  id: string;
  projectName: string;
  startTime: string;
  endTime: string | null;
  duration: number | null;
  note: string | null;
  createdAt: string;
};

type Project = {
  id: string;
  name: string;
  clientName: string | null;
  archived: boolean;
};

export default function EmployeeDashboard() {
  const [logs, setLogs] = useState<TimeLog[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
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

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (data.projects) setProjects(data.projects);
    } catch (error) {
      console.error("Failed to fetch projects", error);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchProjects();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row gap-12">
        {/* Left Column: Timer */}
        <div className="w-full lg:w-1/3 flex flex-col">
          <Timer onStop={fetchLogs} projects={projects} />
          <ManualEntryForm onAdded={fetchLogs} projects={projects} />
        </div>

        {/* Right Column: Activity List */}
        <div className="w-full lg:w-2/3 flex flex-col">
          <div className="flex justify-end mb-4">
            <a
              href="/api/time/logs/export"
              className="flex items-center gap-1.5 text-sm font-medium text-indigo-400 hover:text-indigo-300 px-3 py-1.5 rounded-lg hover:bg-neutral-800 transition-colors"
            >
              <Download size={16} />
              Export my logs
            </a>
          </div>
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
