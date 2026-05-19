"use client";

import { useState } from "react";
import { Plus, Loader2, X } from "lucide-react";
import ProjectSelect from "@/components/ProjectSelect";

type Project = {
  id: string;
  name: string;
  clientName: string | null;
  archived: boolean;
};

export default function ManualEntryForm({
  onAdded,
  projects,
}: {
  onAdded?: () => void;
  projects: Project[];
}) {
  const [open, setOpen] = useState(false);
  const [projectId, setProjectId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setProjectId("");
    setStartTime("");
    setEndTime("");
    setNote("");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) {
      setError("Please select a project");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/time/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
          note,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add entry");
      reset();
      setOpen(false);
      onAdded?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add entry");
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-6 w-full flex items-center justify-center gap-2 border border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-400 dark:hover:border-indigo-500 rounded-2xl py-3 text-sm font-medium transition-colors"
      >
        <Plus size={18} />
        Add time manually
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 space-y-4 transition-colors duration-300"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-neutral-900 dark:text-white">Add Time Manually</h3>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            reset();
          }}
          className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white p-1 rounded-lg"
        >
          <X size={18} />
        </button>
      </div>

      <ProjectSelect projects={projects} value={projectId} onChange={setProjectId} />

      <div className="flex flex-col sm:flex-row gap-3">
        <label className="flex-1 text-xs text-neutral-500 dark:text-neutral-400">
          Start
          <input
            type="datetime-local"
            required
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="mt-1 w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white text-sm rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </label>
        <label className="flex-1 text-xs text-neutral-500 dark:text-neutral-400">
          End
          <input
            type="datetime-local"
            required
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="mt-1 w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white text-sm rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </label>
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Note (optional)"
        rows={2}
        className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white text-sm rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
      />

      {error && (
        <p className="text-red-500 text-sm bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold py-2.5 rounded-xl transition-colors disabled:opacity-50"
      >
        {busy ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
        Add Entry
      </button>
    </form>
  );
}
