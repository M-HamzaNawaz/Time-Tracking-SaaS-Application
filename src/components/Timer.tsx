"use client";

import { useState, useEffect } from "react";
import { useTimerStore } from "@/store/useTimerStore";
import { Play, Square, Loader2 } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m
    .toString()
    .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

export default function Timer({ onStop }: { onStop?: () => void }) {
  const {
    isTracking,
    activeLogId,
    projectName,
    note,
    setProjectName,
    setNote,
    startTimer,
    resumeTimer,
    stopTimer,
    getDuration,
  } = useTimerStore();

  const [displayTime, setDisplayTime] = useState(getDuration());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // The server is the source of truth for a running timer: a session may have
  // been started on another device, or local state may be stale.
  useEffect(() => {
    const syncWithServer = async () => {
      try {
        const res = await fetch("/api/time/active");
        if (!res.ok) return;
        const data = await res.json();
        if (data.active) {
          resumeTimer(
            data.active.id,
            new Date(data.active.startTime).getTime(),
            data.active.projectName
          );
        } else if (useTimerStore.getState().isTracking) {
          stopTimer();
          if (data.autoClosed && onStop) onStop();
        }
      } catch (err) {
        console.error("Failed to sync timer with server:", err);
      }
    };
    syncWithServer();
  }, [resumeTimer, stopTimer, onStop]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTracking) {
      interval = setInterval(() => {
        setDisplayTime(getDuration());
      }, 1000);
    } else {
      setDisplayTime(0);
    }
    return () => clearInterval(interval);
  }, [isTracking, getDuration]);

  const handleStart = async () => {
    if (!projectName.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/time/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectName }),
      });
      const data = await res.json();
      if (res.ok) {
        startTimer(data.logId);
      } else {
        setError(data.error || "Failed to start timer");
      }
    } catch (error) {
      console.error("Failed to start timer:", error);
      setError("Failed to start timer");
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    if (!activeLogId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/time/stop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logId: activeLogId, note }),
      });
      if (res.ok) {
        stopTimer();
        if (onStop) onStop();
      }
    } catch (error) {
      console.error("Failed to stop timer:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 flex flex-col items-center justify-center shadow-xl shadow-black/5 dark:shadow-black/50 relative overflow-hidden transition-colors duration-300">
      {/* Decorative background glow */}
      <div
        className={cn(
          "absolute -inset-24 bg-indigo-500/10 blur-3xl rounded-full transition-opacity duration-1000",
          isTracking ? "opacity-100 animate-pulse" : "opacity-0"
        )}
      />

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-8">
        <input
          type="text"
          placeholder="What are you working on?"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          disabled={isTracking}
          className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white text-center text-lg rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300 disabled:opacity-50"
        />

        {isTracking && (
          <textarea
            placeholder="Add a note about this session (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white text-sm rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300 resize-none"
          />
        )}

        {error && (
          <p className="text-red-500 text-sm bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20 w-full text-center">
            {error}
          </p>
        )}

        <div className="relative flex items-center justify-center">
          {/* Timer Circle */}
          <svg className="w-64 h-64 transform -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="120"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-neutral-200 dark:text-neutral-800 transition-colors duration-300"
            />
            {isTracking && (
              <circle
                cx="128"
                cy="128"
                r="120"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray="753"
                strokeDashoffset={753 - (displayTime % 60) * (753 / 60)}
                className="text-indigo-600 dark:text-indigo-500 transition-all duration-1000 ease-linear"
              />
            )}
          </svg>

          <div className="absolute flex flex-col items-center">
            <span className="text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight tabular-nums transition-colors duration-300">
              {formatTime(displayTime)}
            </span>
            <span className="text-neutral-500 dark:text-neutral-400 mt-2 text-sm font-medium uppercase tracking-widest transition-colors duration-300">
              {isTracking ? "Session Active" : "Ready"}
            </span>
          </div>
        </div>

        {isTracking ? (
          <button
            onClick={handleStop}
            disabled={loading}
            className="group flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-full font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-red-500/25 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <Square size={24} className="fill-current" />
            )}
            STOP TRACKING
          </button>
        ) : (
          <button
            onClick={handleStart}
            disabled={loading || !projectName.trim()}
            className="group flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-full font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-600/25 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <Play size={24} className="fill-current ml-1" />
            )}
            START TIMER
          </button>
        )}
      </div>
    </div>
  );
}
