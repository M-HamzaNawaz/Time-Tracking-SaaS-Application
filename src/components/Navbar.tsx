"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Clock, LogOut, Moon, Sun, User } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!session) return null;

  const isAdmin = session.user?.role === "admin";
  const dashboardLink = isAdmin ? "/dashboard/admin" : "/dashboard/employee";

  return (
    <nav className="bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href={dashboardLink} className="flex-shrink-0 flex items-center gap-2">
              <Clock className="text-indigo-600 dark:text-indigo-500" size={28} />
              <span className="text-neutral-900 dark:text-white font-bold text-xl tracking-tight">TimeTracker</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-900 rounded-full px-4 py-2 border border-neutral-200 dark:border-neutral-800 transition-colors duration-300">
              <User size={16} className="text-neutral-500 dark:text-neutral-400" />
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {session.user?.email}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold uppercase ml-2">
                {session.user?.role}
              </span>
            </div>
            
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 p-2 rounded-full transition-colors"
                title="Toggle Theme"
              >
                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            )}

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 p-2 rounded-full transition-colors"
              title="Sign Out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
