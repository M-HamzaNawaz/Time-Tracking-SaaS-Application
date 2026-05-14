import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TimerState {
  isTracking: boolean;
  activeLogId: string | null;
  startTime: number | null;
  projectName: string;
  note: string;
  setProjectName: (name: string) => void;
  setNote: (note: string) => void;
  startTimer: (logId: string) => void;
  resumeTimer: (logId: string, startTimeMs: number, projectName: string) => void;
  stopTimer: () => void;
  getDuration: () => number;
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      isTracking: false,
      activeLogId: null,
      startTime: null,
      projectName: '',
      note: '',
      setProjectName: (name) => set({ projectName: name }),
      setNote: (note) => set({ note }),
      startTimer: (logId) => set({ isTracking: true, activeLogId: logId, startTime: Date.now() }),
      resumeTimer: (logId, startTimeMs, projectName) =>
        set({ isTracking: true, activeLogId: logId, startTime: startTimeMs, projectName }),
      stopTimer: () => set({ isTracking: false, activeLogId: null, startTime: null, projectName: '', note: '' }),
      getDuration: () => {
        const { isTracking, startTime } = get();
        if (!isTracking || !startTime) return 0;
        return Math.floor((Date.now() - startTime) / 1000);
      },
    }),
    {
      name: 'timer-storage',
    }
  )
);
