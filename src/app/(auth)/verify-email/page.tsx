"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

function VerifyEmailInner() {
  const params = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token.");
      return;
    }
    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setStatus("error");
          setMessage(data.error || "Verification failed");
        } else {
          setStatus("success");
          setMessage(data.message || "Email verified");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Verification failed");
      });
  }, [token]);

  return (
    <div className="text-center">
      {status === "loading" && (
        <>
          <Loader2 className="mx-auto h-12 w-12 text-indigo-500 animate-spin mb-4" />
          <p className="text-neutral-700 dark:text-neutral-300">Verifying your email...</p>
        </>
      )}
      {status === "success" && (
        <>
          <CheckCircle className="mx-auto h-16 w-16 text-emerald-500 mb-4" />
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">{message}</h2>
          <Link
            href="/login"
            className="inline-block mt-4 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
          >
            Continue to sign in
          </Link>
        </>
      )}
      {status === "error" && (
        <>
          <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">{message}</h2>
          <Link
            href="/login"
            className="inline-block mt-4 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
          >
            Back to sign in
          </Link>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-indigo-600 dark:text-indigo-500">
          <Clock size={48} />
        </div>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-neutral-900 py-8 px-4 shadow-2xl shadow-indigo-500/10 sm:rounded-2xl sm:px-10 border border-neutral-200 dark:border-neutral-800">
          <Suspense fallback={<p className="text-center text-neutral-500">Loading...</p>}>
            <VerifyEmailInner />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
