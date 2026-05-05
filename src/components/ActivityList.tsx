import { format } from "date-fns";
import { FolderGit2 } from "lucide-react";

type TimeLog = {
  id: string;
  projectName: string;
  startTime: string | Date;
  duration: number | null;
  createdAt: string | Date;
};

const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  
  const parts = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0 || parts.length === 0) parts.push(`${s}s`);
  
  return parts.join(" ");
};

export default function ActivityList({ logs }: { logs: TimeLog[] }) {
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
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Recent Activity</h3>
      </div>
      <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
        {logs.map((log) => (
          <li key={log.id} className="p-6 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors flex items-center justify-between group">
            <div className="flex items-start gap-4">
              <div className="bg-indigo-500/10 p-3 rounded-xl text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                <FolderGit2 size={24} />
              </div>
              <div>
                <p className="text-neutral-900 dark:text-white font-semibold text-lg">{log.projectName}</p>
                <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 flex gap-2 items-center">
                  <span>{format(new Date(log.startTime), "MMM d, yyyy h:mm a")}</span>
                </div>
              </div>
            </div>
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
          </li>
        ))}
      </ul>
    </div>
  );
}
