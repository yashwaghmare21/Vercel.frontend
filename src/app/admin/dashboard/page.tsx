"use client";

import Link from 'next/link';

export default function AdminDashboard() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Organization Overview</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">High-level view of company-wide goal adoption and progress.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Employees</h3>
          <p className="text-4xl font-bold text-zinc-900 dark:text-white mt-2">1,240</p>
        </div>
        
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Goals Locked</h3>
          <p className="text-4xl font-bold text-zinc-900 dark:text-white mt-2">982</p>
          <p className="text-xs text-emerald-500 mt-1">79% Compliance</p>
        </div>

        <div className="p-6 bg-white dark:bg-zinc-900 border border-rose-500/50 dark:border-rose-500/30 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/10 rounded-bl-full" />
          <h3 className="text-sm font-medium text-rose-600 dark:text-rose-500">Unlock Requests</h3>
          <p className="text-4xl font-bold text-zinc-900 dark:text-white mt-2">14</p>
        </div>

        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Check-in Completion</h3>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-500">42%</p>
            <p className="text-sm text-zinc-500">Q1</p>
          </div>
        </div>
      </div>

      <div className="p-8 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-3xl flex flex-col items-center justify-center text-center bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="w-16 h-16 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Checkin Completion Table</h2>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-md mb-6">
          Detailed breakdown of check-in completions by department will appear here.
        </p>
      </div>
    </div>
  );
}
