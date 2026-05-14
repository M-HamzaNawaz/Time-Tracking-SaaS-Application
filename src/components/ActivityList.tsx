"use client";

import { useState } from "react";
import { format } from "date-fns";
import { FolderGit2, Pencil, Trash2, Check, X, Loader2 } from "lucide-react";
import { formatDuration } from "@/lib/format";

type TimeLog = {
  id: string;
  projectName: string;
  startTime: string | Date;
  endTime?: string | Date | null;
  duration: number | null;
  note: string | null;
  createdAt: string | Date;
  user?: { name: string | null; email: string };
};

// Format a date for a <input type="datetime-local"> value (local time).
const toDateTimeLocal = (value: string | Date) => {
  const d = new Date(value);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
};

function LogRow({ log, onChanged }: { log: TimeLog; onChanged?: () => void }) {
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [projectName, setProjectName] = useState(log.projectName);
  const [note, setNote] = useState(log.note ?? "");
  const [startTime, setStartTime] = useState(toDateTimeLocal(log.startTime));
  const [endTime, setEndTime] = useState(
    log.endTime ? toDateTimeLocal(log.endTime) : ""
  );

  const completed = log.duration !== null;

  const handleSave = async () => {
    setBusy(true);
    setError("");
    try {
      const body: Record<string, string> = { projectName, note };
      if (completed) {
        body.startTime = new Date(startTime).toISOString();
        body.endTime = new Date(endTime).toISOString();
      }
      const res = await fetch(`/api/time/logs/${log.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");
      setEditing(false);
      onChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this time entry? This cannot be undone.")) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/time/logs/${log.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      onChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
      setBusy(false);
    }
  };

  if (editing) {
    return (
      <li className="p-6 bg-neutral-50 dark:bg-neutral-800/50 space-y-3">
        <input
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Project name"
          className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white text-sm rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note (optional)"
          rows={2}
          className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white text-sm rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
        {completed && (
          <div className="flex flex-col sm:flex-row gap-3">
            <label className="flex-1 text-xs text-neutral-500 dark:text-neutral-400">
              Start
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="mt-1 w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white text-sm rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </label>
            <label className="flex-1 text-xs text-neutral-500 dark:text-neutral-400">
              End
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="mt-1 w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white text-sm rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </label>
          </div>
        )}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={busy}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-3 py-1.5 rounded-lg disabled:opacity-50"
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            Save
          </button>
          <button
            onClick={() => {
              setEditing(false);
              setError("");
            }}
            disabled={busy}
            className="flex items-center gap-1.5 bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-sm font-medium px-3 py-1.5 rounded-lg disabled:opacity-50"
          >
            <X size={16} />
            Cancel
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="p-6 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors flex items-center justify-between group">
      <div className="flex items-start gap-4">
        <div className="bg-indigo-500/10 p-3 rounded-xl text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
          <FolderGit2 size={24} />
        </div>
        <div>
          <p className="text-neutral-900 dark:text-white font-semibold text-lg">
            {log.projectName}
          </p>
          <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 flex gap-2 items-center">
            <span>{format(new Date(log.startTime), "MMM d, yyyy h:mm a")}</span>
            {log.user && (
              <span className="text-neutral-400 dark:text-neutral-500">
                · {log.user.name || log.user.email}
              </span>
            )}
          </div>
          {log.note && (
            <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-2 italic">
              {log.note}
            </p>
          )}
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          {log.duration !== null ? (
            <span className="text-neutral-900 dark:text-white font-bold font-mono bg-neutral-100 dark:bg-neutral-950 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 transition-colors duration-300">
              {formatDuration(log.duration)}
            </span>
          ) : (
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold animate-pulse">
              In Progress...
            </span>
          )}
        </div>
        {onChanged && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setEditing(true)}
              disabled={busy}
              title="Edit"
              className="text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-50"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={handleDelete}
              disabled={busy}
              title="Delete"
              className="text-neutral-400 hover:text-red-500 p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-50"
            >
              {busy ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            </button>
          </div>
        )}
      </div>
    </li>
  );
}

export default function ActivityList({
  logs,
  onChanged,
  title = "Recent Activity",
}: {
  logs: TimeLog[];
  onChanged?: () => void;
  title?: string;
}) {
  if (logs.length === 0) {
    return (
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 text-center text-neutral-500 dark:text-neutral-400 transition-colors duration-300">
        No recent activity found. Start a timer to see logs here.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-xl shadow-black/5 dark:shadow-black/20 transition-colors duration-300">
      <div className="px-6 py-5 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center bg-neutral-50/50 dark:bg-neutral-900/50 transition-colors duration-300">
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">{title}</h3>
      </div>
      <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
        {logs.map((log) => (
          <LogRow key={log.id} log={log} onChanged={onChanged} />
        ))}
      </ul>
    </div>
  );
}
