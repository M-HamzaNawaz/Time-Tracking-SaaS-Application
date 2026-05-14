"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, AlertCircle } from "lucide-react";

function AcceptInviteForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="text-center text-red-500 bg-red-500/10 p-4 rounded-xl border border-red-500/20">
        <AlertCircle className="mx-auto mb-2" size={32} />
        Invalid or missing invitation token.
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter your name");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/invite/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, name }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to accept invitation");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-emerald-500 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Account Created!</h2>
        <p className="text-neutral-400">
          Redirecting you to the login page...
        </p>
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm font-medium text-neutral-300">
          Full Name
        </label>
        <div className="mt-1">
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
            className="appearance-none block w-full px-3 py-2 border border-neutral-700 rounded-xl shadow-sm placeholder-neutral-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-neutral-950 text-white transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-300">
          Set Password
        </label>
        <div className="mt-1">
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-neutral-700 rounded-xl shadow-sm placeholder-neutral-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-neutral-950 text-white transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-300">
          Confirm Password
        </label>
        <div className="mt-1">
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-neutral-700 rounded-xl shadow-sm placeholder-neutral-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-neutral-950 text-white transition-colors"
          />
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-neutral-900 transition-all disabled:opacity-50"
      >
        {loading ? "Creating Account..." : "Create Account"}
      </button>
    </form>
  );
}

export default function AcceptInvitePage() {
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white tracking-tight">
          Accept Invitation
        </h2>
        <p className="mt-2 text-center text-sm text-neutral-400">
          Set up your password to access your dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-neutral-900 py-8 px-4 shadow-2xl shadow-indigo-500/10 sm:rounded-2xl sm:px-10 border border-neutral-800">
          <Suspense fallback={<div className="text-white text-center">Loading...</div>}>
            <AcceptInviteForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
