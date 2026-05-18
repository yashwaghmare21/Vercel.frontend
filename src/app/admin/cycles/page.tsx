"use client";

import { useState } from 'react';

type CycleEntry = {
  id: string;
  name: string;
  quarter: string;
  startDate: string;
  endDate: string;
  phase: "PLANNING" | "CHECKIN" | "CLOSED";
};

const INITIAL_CYCLES: CycleEntry[] = [
  { id: "c1", name: "FY 2025-26", quarter: "Q1", startDate: "2025-04-01", endDate: "2025-06-30", phase: "CHECKIN" },
  { id: "c2", name: "FY 2025-26", quarter: "Q2", startDate: "2025-07-01", endDate: "2025-09-30", phase: "CLOSED" },
  { id: "c3", name: "FY 2025-26", quarter: "Q3", startDate: "2025-10-01", endDate: "2025-12-31", phase: "CLOSED" },
  { id: "c4", name: "FY 2025-26", quarter: "Q4", startDate: "2026-01-01", endDate: "2026-03-31", phase: "CLOSED" },
];

const phaseColors: Record<string, string> = {
  PLANNING: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  CHECKIN: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  CLOSED: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-500",
};

export default function AdminCyclesPage() {
  const [cycles, setCycles] = useState(INITIAL_CYCLES);

  const togglePhase = (id: string) => {
    setCycles(prev => prev.map(c => {
      if (c.id !== id) return c;
      const order: CycleEntry["phase"][] = ["CLOSED", "PLANNING", "CHECKIN"];
      const nextIdx = (order.indexOf(c.phase) + 1) % order.length;
      return { ...c, phase: order[nextIdx] };
    }));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Cycle Management</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">Open or close quarters to control when employees can submit goals or log check-ins.</p>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">
              <th className="px-6 py-4">Fiscal Year</th>
              <th className="px-6 py-4">Quarter</th>
              <th className="px-6 py-4">Start</th>
              <th className="px-6 py-4">End</th>
              <th className="px-6 py-4">Phase</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {cycles.map(c => (
              <tr key={c.id} className="border-b border-zinc-100 dark:border-zinc-800 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-zinc-900 dark:text-white">{c.name}</td>
                <td className="px-6 py-4 text-sm font-bold text-zinc-900 dark:text-white">{c.quarter}</td>
                <td className="px-6 py-4 text-sm text-zinc-500">{c.startDate}</td>
                <td className="px-6 py-4 text-sm text-zinc-500">{c.endDate}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${phaseColors[c.phase]}`}>
                    {c.phase}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => togglePhase(c.id)}
                    className="px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                  >
                    Toggle Phase
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
