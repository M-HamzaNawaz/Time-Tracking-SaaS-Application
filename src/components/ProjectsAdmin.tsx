"use client";

import { useCallback, useEffect, useState } from "react";
import { Briefcase, Plus, Loader2, Archive, ArchiveRestore, Pencil, Check, X } from "lucide-react";

type Project = {
  id: string;
  name: string;
  clientName: string | null;
  archived: boolean;
  createdAt: string;
};

function ProjectRow({ project, onChanged }: { project: Project; onChanged: () => void }) {
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState(project.name);
  const [clientName, setClientName] = useState(project.clientName ?? "");

  const patch = async (data: object) => {
    setBusy(true);
    try {
      await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  if (editing) {
    return (
      <div className="flex flex-col sm:flex-row gap-2 bg-neutral-950 p-3 rounded-xl border border-neutral-800">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Project name"
          className="flex-1 bg-neutral-900 border border-neutral-700 text-white text-sm rounded-lg py-1.5 px-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          placeholder="Client (optional)"
          className="flex-1 bg-neutral-900 border border-neutral-700 text-white text-sm rounded-lg py-1.5 px-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <div className="flex gap-1">
          <button
            onClick={async () => {
              await patch({ name, clientName });
              setEditing(false);
            }}
            disabled={busy || !name.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg disabled:opacity-50"
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
          </button>
          <button
            onClick={() => {
              setName(project.name);
              setClientName(project.clientName ?? "");
              setEditing(false);
            }}
            disabled={busy}
            className="bg-neutral-800 text-neutral-300 p-2 rounded-lg disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center bg-neutral-950 p-3 rounded-xl border border-neutral-800">
      <div>
        <p className={`text-sm font-medium ${project.archived ? "text-neutral-500 line-through" : "text-white"}`}>
          {project.name}
        </p>
        {project.clientName && (
          <p className="text-xs text-neutral-500">{project.clientName}</p>
        )}
      </div>
      <div className="flex gap-1">
        <button
          onClick={() => setEditing(true)}
          disabled={busy}
          title="Rename"
          className="text-neutral-400 hover:text-indigo-400 p-2 rounded-lg hover:bg-neutral-800 disabled:opacity-50"
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={() => patch({ archived: !project.archived })}
          disabled={busy}
          title={project.archived ? "Unarchive" : "Archive"}
          className="text-neutral-400 hover:text-amber-400 p-2 rounded-lg hover:bg-neutral-800 disabled:opacity-50"
        >
          {busy ? (
            <Loader2 size={16} className="animate-spin" />
          ) : project.archived ? (
            <ArchiveRestore size={16} />
          ) : (
            <Archive size={16} />
          )}
        </button>
      </div>
    </div>
  );
}

export default function ProjectsAdmin({ onChanged }: { onChanged?: () => void }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [name, setName] = useState("");
  const [clientName, setClientName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects?archived=${showArchived}`);
      const data = await res.json();
      if (data.projects) setProjects(data.projects);
    } finally {
      setLoading(false);
    }
  }, [showArchived]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, clientName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create project");
      setName("");
      setClientName("");
      await fetchProjects();
      onChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  const handleChanged = async () => {
    await fetchProjects();
    onChanged?.();
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-xl shadow-black/20">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500/10 p-3 rounded-xl text-indigo-400">
            <Briefcase size={24} />
          </div>
          <h2 className="text-xl font-bold text-white">Projects</h2>
        </div>
        <label className="flex items-center gap-2 text-sm text-neutral-400">
          <input
            type="checkbox"
            checked={showArchived}
            onChange={(e) => setShowArchived(e.target.checked)}
            className="rounded border-neutral-700 bg-neutral-950 text-indigo-600 focus:ring-indigo-500"
          />
          Show archived
        </label>
      </div>

      <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-2 mb-6">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Project name"
          className="flex-1 bg-neutral-950 border border-neutral-700 text-white text-sm rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          placeholder="Client (optional)"
          className="flex-1 bg-neutral-950 border border-neutral-700 text-white text-sm rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={creating || !name.trim()}
          className="flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-xl disabled:opacity-50"
        >
          {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          Add project
        </button>
      </form>

      {error && (
        <p className="text-red-500 text-sm bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20 mb-4">
          {error}
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8 text-neutral-500">
          <Loader2 className="animate-spin" size={20} />
        </div>
      ) : projects.length === 0 ? (
        <p className="text-sm text-neutral-500 py-4">
          No projects yet. Add one above to start tracking time against it.
        </p>
      ) : (
        <div className="space-y-2">
          {projects.map((p) => (
            <ProjectRow key={p.id} project={p} onChanged={handleChanged} />
          ))}
        </div>
      )}
    </div>
  );
}
