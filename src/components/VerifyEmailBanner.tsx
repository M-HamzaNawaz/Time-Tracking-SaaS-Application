"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Mail, Loader2, X } from "lucide-react";

export default function VerifyEmailBanner() {
  const { data: session } = useSession();
  const [busy, setBusy] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  if (!session || session.user.isVerified || dismissed) return null;

  const handleResend = async () => {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/resend-verification", { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send");
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-3 text-sm text-amber-700 dark:text-amber-300 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Mail size={16} />
        <span>
          {sent
            ? `A new verification link was sent to ${session.user.email}.`
            : error
              ? error
              : `Please verify your email (${session.user.email}) to secure your account.`}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {!sent && (
          <button
            onClick={handleResend}
            disabled={busy}
            className="font-medium text-amber-700 dark:text-amber-200 hover:underline disabled:opacity-50 flex items-center gap-1"
          >
            {busy && <Loader2 size={14} className="animate-spin" />}
            Resend
          </button>
        )}
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200"
          title="Dismiss"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
