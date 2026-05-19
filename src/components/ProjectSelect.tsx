"use client";

type Project = {
  id: string;
  name: string;
  clientName: string | null;
  archived: boolean;
};

export default function ProjectSelect({
  projects,
  value,
  onChange,
  disabled,
}: {
  projects: Project[];
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
}) {
  const active = projects.filter((p) => !p.archived);

  if (active.length === 0) {
    return (
      <div className="w-full bg-neutral-50 dark:bg-neutral-950 border border-dashed border-neutral-300 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 text-center text-sm rounded-xl py-3 px-4">
        No projects yet. Ask an admin to create one.
      </div>
    );
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white text-center text-lg rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300 disabled:opacity-50"
    >
      <option value="">Select a project…</option>
      {active.map((p) => (
        <option key={p.id} value={p.id}>
          {p.clientName ? `${p.clientName} – ${p.name}` : p.name}
        </option>
      ))}
    </select>
  );
}
