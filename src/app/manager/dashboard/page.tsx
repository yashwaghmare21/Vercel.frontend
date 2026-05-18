"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type Stats = {
  team_size: number;
  pending_approvals: number;
  goals_locked: number;
};

type PendingEmployee = {
  employee_id: string;
  employee_name: string;
  goals: { id: string }[];
  submitted_at: string;
};

export default function ManagerDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [pending, setPending] = useState<PendingEmployee[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const headers = { credentials: "include" as RequestCredentials };

    // Fetch stats and pending submissions in parallel
    Promise.all([
      fetch(`${API_BASE}/api/manager/stats`, headers)
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null),
      fetch(`${API_BASE}/api/manager/pending-submissions`, headers)
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => []),
    ]).then(([statsData, pendingData]) => {
      setStats(statsData);
      setPending(Array.isArray(pendingData) ? pendingData.slice(0, 5) : []);
      setLoadingStats(false);
    });
  }, []);

  // Skeleton number display
  const Num = ({ n }: { n: number | undefined }) =>
    loadingStats ? (
      <div className="h-10 w-16 bg-zinc-200 dark:bg-zinc-700 rounded-lg animate-pulse mt-2" />
    ) : (
      <p className="text-4xl font-bold text-zinc-900 dark:text-white mt-2">
        {n ?? "—"}
      </p>
    );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Team Overview</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">
          Manage your direct reports&apos; goals and check-ins.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Team Size</h3>
          <Num n={stats?.team_size} />
        </div>

        <div className="p-6 bg-white dark:bg-zinc-900 border border-amber-500/50 dark:border-amber-500/30 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-bl-full" />
          <h3 className="text-sm font-medium text-amber-600 dark:text-amber-500">Pending Approvals</h3>
          {loadingStats ? (
            <div className="h-10 w-16 bg-amber-100 dark:bg-amber-900/30 rounded-lg animate-pulse mt-2" />
          ) : (
            <p className="text-4xl font-bold text-zinc-900 dark:text-white mt-2">
              {stats?.pending_approvals ?? "—"}
            </p>
          )}
          {stats && stats.pending_approvals > 0 && (
            <Link
              href="/manager/approvals"
              className="mt-2 inline-block text-xs font-semibold text-amber-600 hover:underline"
            >
              Review now →
            </Link>
          )}
        </div>

        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Goals Locked</h3>
          <Num n={stats?.goals_locked} />
        </div>

        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Team Completion</h3>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-500">0%</p>
            <p className="text-sm text-zinc-500">Q1</p>
          </div>
        </div>
      </div>

      {/* Action Required panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Action Required</h3>
            <Link href="/manager/approvals" className="text-sm font-medium text-amber-600 hover:text-amber-700">
              View All
            </Link>
          </div>

          {loadingStats ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : pending.length === 0 ? (
            <div className="text-center py-8 text-zinc-400">
              <p className="text-2xl mb-2">✅</p>
              <p className="text-sm">No pending approvals</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map((emp) => (
                <div
                  key={emp.employee_id}
                  className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-black"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                      {emp.employee_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-900 dark:text-white">
                        {emp.employee_name}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {emp.goals.length} goal{emp.goals.length !== 1 ? "s" : ""} submitted
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/manager/approvals"
                    className="px-3 py-1.5 text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-lg hover:bg-amber-200 transition-colors"
                  >
                    Review
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
