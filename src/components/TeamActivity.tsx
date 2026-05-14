"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity } from "lucide-react";
import ActivityList from "@/components/ActivityList";

type TeamMember = { id: string; name: string | null; email: string };

type TimeLog = {
  id: string;
  projectName: string;
  startTime: string;
  endTime: string | null;
  duration: number | null;
  note: string | null;
  createdAt: string;
  user?: { name: string | null; email: string };
};

export default function TeamActivity({ users }: { users: TeamMember[] }) {
  const [userId, setUserId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [logs, setLogs] = useState<TimeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (userId) params.set("userId", userId);
      if (from) params.set("from", new Date(from).toISOString());
      if (to) params.set("to", new Date(to).toISOString());
      const res = await fetch(`/api/admin/time-logs?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load activity");
      setLogs(data.logs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load activity");
    } finally {
      setLoading(false);
    }
  }, [userId, from, to]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-xl shadow-black/20">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-indigo-500/10 p-3 rounded-xl text-indigo-400">
          <Activity size={24} />
        </div>
        <h2 className="text-xl font-bold text-white">Team Activity</h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <select
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="flex-1 px-4 py-2.5 border border-neutral-700 rounded-xl bg-neutral-950 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All members</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name || u.email}
            </option>
          ))}
        </select>
        <label className="text-xs text-neutral-400">
          From
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-neutral-700 rounded-xl bg-neutral-950 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </label>
        <label className="text-xs text-neutral-400">
          To
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-neutral-700 rounded-xl bg-neutral-950 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </label>
      </div>

      {error && (
        <p className="text-red-500 text-sm bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20 mb-4">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center text-neutral-500 py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mb-4"></div>
          <p>Loading activity...</p>
        </div>
      ) : (
        <ActivityList logs={logs} onChanged={fetchLogs} title="Entries" />
      )}
    </div>
  );
}
