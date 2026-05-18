"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function EmployeeDashboard() {
  const [managerName, setManagerName] = useState<string>("");

  useEffect(() => {
    // Extract session from cookie
    const cookies = document.cookie.split(';');
    const sessionCookie = cookies.find(c => c.trim().startsWith('atomquest_session='));
    if (sessionCookie) {
      try {
        const raw = sessionCookie.substring(sessionCookie.indexOf('=') + 1);
        const session = JSON.parse(decodeURIComponent(raw));
        if (session.manager_name) {
          setManagerName(session.manager_name);
        }
      } catch (e) {}
    }
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Welcome back!</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">Here is a quick overview of your goal progress.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Total Goals</h3>
          <p className="text-4xl font-bold text-zinc-900 dark:text-white mt-2">0</p>
        </div>

        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Reporting Manager</h3>
          <p className="text-xl font-bold text-zinc-900 dark:text-white mt-2 truncate">
            {managerName || "No Manager Assigned"}
          </p>
        </div>
        
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
          <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">Status</h3>
          <p className="text-xl font-bold text-zinc-900 dark:text-white mt-2">Draft Mode</p>
        </div>

        <div className="p-6 bg-indigo-600 rounded-2xl shadow-md text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-sm font-medium text-indigo-200">Next Deadline</h3>
            <p className="text-xl font-bold mt-2">Goal Submission</p>
            <p className="text-sm text-indigo-200 mt-1">May 15, 2025</p>
          </div>
          <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
        </div>
      </div>

      <div className="p-8 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-3xl flex flex-col items-center justify-center text-center bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">No Goals Found</h2>
        <p className="text-zinc-500 dark:text-zinc-400 max-w-md mb-6">
          You haven't set any goals for this cycle yet. Head over to the Goal Sheet to get started.
        </p>
        <Link 
          href="/employee/goals"
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
        >
          Create Goal Sheet
        </Link>
      </div>
    </div>
  );
}
