"use client";

import { useState } from 'react';

type ReportRow = {
  employeeName: string;
  manager: string;
  goalTitle: string;
  thrustArea: string;
  weightage: number;
  target: number | string;
  actual: number | string;
  status: string;
};

const MOCK_REPORT: ReportRow[] = [
  { employeeName: "Alice Smith", manager: "John Doe", goalTitle: "Increase Revenue", thrustArea: "Financial", weightage: 40, target: 100, actual: 75, status: "on_track" },
  { employeeName: "Alice Smith", manager: "John Doe", goalTitle: "Improve CSAT", thrustArea: "Customer", weightage: 30, target: 95, actual: 88, status: "on_track" },
  { employeeName: "Alice Smith", manager: "John Doe", goalTitle: "Reduce Onboarding", thrustArea: "Process", weightage: 30, target: "2025-06-30", actual: "-", status: "not_started" },
  { employeeName: "Bob Jones", manager: "John Doe", goalTitle: "Launch Beta", thrustArea: "Process", weightage: 50, target: 1, actual: 0, status: "not_started" },
  { employeeName: "Bob Jones", manager: "John Doe", goalTitle: "Team Training", thrustArea: "Learning", weightage: 50, target: 20, actual: 12, status: "on_track" },
  { employeeName: "Carol Lee", manager: "Jane Mgr", goalTitle: "Reduce Churn", thrustArea: "Customer", weightage: 60, target: 5, actual: 3, status: "completed" },
  { employeeName: "Carol Lee", manager: "Jane Mgr", goalTitle: "New Hires", thrustArea: "Learning", weightage: 40, target: 10, actual: 10, status: "completed" },
];

const statusBadge: Record<string, string> = {
  not_started: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800",
  on_track: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

export default function AdminReportsPage() {
  const [data] = useState(MOCK_REPORT);
  const [filterManager, setFilterManager] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const managers = [...new Set(data.map(r => r.manager))];

  const filtered = data.filter(r => {
    if (filterManager && r.manager !== filterManager) return false;
    if (filterStatus && r.status !== filterStatus) return false;
    return true;
  });

  const handleExportCSV = () => {
    const headers = ["Employee", "Manager", "Goal", "Thrust Area", "Weightage", "Target", "Actual", "Status"];
    const rows = filtered.map(r => [r.employeeName, r.manager, r.goalTitle, r.thrustArea, r.weightage, r.target, r.actual, r.status]);
    const csvContent = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `atomquest_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Reports & Export</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">Planned vs Actual tracking with export capability.</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <select
          value={filterManager}
          onChange={e => setFilterManager(e.target.value)}
          className="h-10 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white"
        >
          <option value="">All Managers</option>
          {managers.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="h-10 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white"
        >
          <option value="">All Statuses</option>
          <option value="not_started">Not Started</option>
          <option value="on_track">On Track</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">
              <th className="px-6 py-4">Employee</th>
              <th className="px-6 py-4">Manager</th>
              <th className="px-6 py-4">Goal</th>
              <th className="px-6 py-4">Area</th>
              <th className="px-6 py-4">Wt.</th>
              <th className="px-6 py-4">Target</th>
              <th className="px-6 py-4">Actual</th>
              <th className="px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={i} className="border-b border-zinc-100 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-colors">
                <td className="px-6 py-3 text-sm font-medium text-zinc-900 dark:text-white">{r.employeeName}</td>
                <td className="px-6 py-3 text-sm text-zinc-500">{r.manager}</td>
                <td className="px-6 py-3 text-sm text-zinc-900 dark:text-white">{r.goalTitle}</td>
                <td className="px-6 py-3 text-xs font-bold text-indigo-600 uppercase">{r.thrustArea}</td>
                <td className="px-6 py-3 text-sm font-bold text-zinc-900 dark:text-white">{r.weightage}%</td>
                <td className="px-6 py-3 text-sm text-zinc-500">{r.target}</td>
                <td className="px-6 py-3 text-sm text-zinc-900 dark:text-white font-bold">{r.actual}</td>
                <td className="px-6 py-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusBadge[r.status] || ''}`}>
                    {r.status.replace("_", " ")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
