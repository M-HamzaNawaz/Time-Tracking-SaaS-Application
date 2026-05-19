"use client";

import { useCallback, useEffect, useState } from "react";
import { BarChart3, Download } from "lucide-react";
import { formatDuration } from "@/lib/format";

type UserRow = {
  userId: string;
  name: string | null;
  email: string;
  totalSeconds: number;
  entries: number;
};

type ProjectRow = {
  projectName: string;
  totalSeconds: number;
  entries: number;
};

export default function TeamReports() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [byUser, setByUser] = useState<UserRow[]>([]);
  const [byProject, setByProject] = useState<ProjectRow[]>([]);
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (from) params.set("from", new Date(from).toISOString());
      if (to) params.set("to", new Date(to).toISOString());
      const res = await fetch(`/api/admin/reports?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load report");
      setByUser(data.byUser);
      setByProject(data.byProject);
      setTotalSeconds(data.totalSeconds);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load report");
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const exportUrl = (() => {
    const params = new URLSearchParams();
    if (from) params.set("from", new Date(from).toISOString());
    if (to) params.set("to", new Date(to).toISOString());
    const qs = params.toString();
    return `/api/admin/time-logs/export${qs ? `?${qs}` : ""}`;
  })();

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-xl shadow-black/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500/10 p-3 rounded-xl text-indigo-400">
            <BarChart3 size={24} />
          </div>
          <h2 className="text-xl font-bold text-white">Reports</h2>
        </div>
        <a
          href={exportUrl}
          className="flex items-center gap-1.5 text-sm font-medium text-indigo-400 hover:text-indigo-300 px-3 py-1.5 rounded-lg hover:bg-neutral-800 transition-colors"
        >
          <Download size={16} />
          Export CSV
        </a>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6 items-end">
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
        <div className="flex-1 text-right">
          <p className="text-xs text-neutral-500 uppercase tracking-wider">Total tracked</p>
          <p className="text-2xl font-bold text-white tabular-nums">
            {formatDuration(totalSeconds)}
          </p>
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-sm bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20 mb-4">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center text-neutral-500 py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mb-4"></div>
          <p>Loading report...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3">
              By Member
            </h3>
            {byUser.length === 0 ? (
              <p className="text-sm text-neutral-500">No data for this range.</p>
            ) : (
              <div className="space-y-2">
                {byUser.map((row) => (
                  <div
                    key={row.userId}
                    className="flex justify-between items-center bg-neutral-950 p-3 rounded-xl border border-neutral-800"
                  >
                    <div>
                      <p className="text-white text-sm font-medium">
                        {row.name || row.email}
                      </p>
                      <p className="text-neutral-500 text-xs">{row.entries} entries</p>
                    </div>
                    <span className="text-white font-mono font-bold text-sm">
                      {formatDuration(row.totalSeconds)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3">
              By Project
            </h3>
            {byProject.length === 0 ? (
              <p className="text-sm text-neutral-500">No data for this range.</p>
            ) : (
              <div className="space-y-2">
                {byProject.map((row) => (
                  <div
                    key={row.projectName}
                    className="flex justify-between items-center bg-neutral-950 p-3 rounded-xl border border-neutral-800"
                  >
                    <div>
                      <p className="text-white text-sm font-medium">{row.projectName}</p>
                      <p className="text-neutral-500 text-xs">{row.entries} entries</p>
                    </div>
                    <span className="text-white font-mono font-bold text-sm">
                      {formatDuration(row.totalSeconds)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
