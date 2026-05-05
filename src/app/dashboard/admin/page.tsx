"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Send, Users, ShieldAlert, CheckCircle } from "lucide-react";

export default function AdminDashboard() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("employee");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successLink, setSuccessLink] = useState("");

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessLink("");

    try {
      const res = await fetch("/api/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send invite");
      }

      setSuccessLink(data.inviteLink);
      setEmail("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <ShieldAlert className="text-indigo-500" size={32} />
            Admin Dashboard
          </h1>
          <p className="text-neutral-400 mt-2">
            Manage your team and send invitations to new members.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Invite Form */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-xl shadow-black/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-indigo-500/10 p-3 rounded-xl text-indigo-400">
                <Users size={24} />
              </div>
              <h2 className="text-xl font-bold text-white">Invite New User</h2>
            </div>

            <form onSubmit={handleInvite} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-300">
                  Email Address
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="colleague@example.com"
                    className="appearance-none block w-full px-4 py-3 border border-neutral-700 rounded-xl shadow-sm placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-neutral-950 text-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="mt-1 block w-full px-4 py-3 border border-neutral-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-neutral-950 text-white transition-colors"
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {error && (
                <div className="text-red-500 text-sm bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                  {error}
                </div>
              )}

              {successLink && (
                <div className="text-emerald-500 text-sm bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 break-all">
                  <div className="flex items-center gap-2 font-bold mb-2">
                    <CheckCircle size={18} />
                    Invitation generated successfully!
                  </div>
                  <p className="text-emerald-400/80 mb-2">
                    If Resend is not configured, share this link manually:
                  </p>
                  <code className="bg-neutral-950 px-2 py-1 rounded border border-emerald-500/20 block text-xs">
                    {successLink}
                  </code>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-neutral-900 transition-all disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? "Sending..." : "Send Invitation"}
                <Send size={18} />
              </button>
            </form>
          </div>

          {/* Quick Stats or Info could go here in future */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-xl shadow-black/20 flex flex-col justify-center items-center text-center">
            <ShieldAlert size={48} className="text-neutral-700 mb-4" />
            <h3 className="text-xl font-bold text-neutral-300 mb-2">System Overview</h3>
            <p className="text-neutral-500">
              Additional administrative tools and team activity monitoring will appear here in future updates.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
