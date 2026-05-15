"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Clock } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, organizationName }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      const signInRes = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (signInRes?.error) {
        router.push("/login");
      } else {
        router.push("/dashboard/admin");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create account");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-indigo-600 dark:text-indigo-500">
          <Clock size={48} className="animate-pulse" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
          Create your workspace
        </h2>
        <p className="mt-2 text-center text-sm text-neutral-500 dark:text-neutral-400">
          Start tracking time with your team
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-neutral-900 py-8 px-4 shadow-2xl shadow-indigo-500/10 sm:rounded-2xl sm:px-10 border border-neutral-200 dark:border-neutral-800 transition-colors duration-300">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Your name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="mt-1 appearance-none block w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-xl shadow-sm placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white transition-colors duration-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Organization name
              </label>
              <input
                type="text"
                required
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="Acme Inc."
                className="mt-1 appearance-none block w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-xl shadow-sm placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white transition-colors duration-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@acme.com"
                className="mt-1 appearance-none block w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-xl shadow-sm placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white transition-colors duration-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="mt-1 appearance-none block w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-xl shadow-sm placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white transition-colors duration-300"
              />
            </div>

            {error && (
              <div className="text-red-600 dark:text-red-500 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-neutral-100 dark:focus:ring-offset-neutral-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
