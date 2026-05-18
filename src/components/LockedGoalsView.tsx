"use client";

import { useState } from 'react';

type LockedGoal = {
  id: string;
  title: string;
  thrustArea: string;
  uom: string;
  target: number | string;
  weightage: number;
  status: string;
};

const MOCK_LOCKED: LockedGoal[] = [
  { id: "g1", title: "Increase Revenue by 20%", thrustArea: "Financial", uom: "percentage", target: 20, weightage: 40, status: "locked" },
  { id: "g2", title: "Improve CSAT to 95", thrustArea: "Customer", uom: "numeric", target: 95, weightage: 30, status: "locked" },
  { id: "g3", title: "Reduce Onboarding Time", thrustArea: "Process", uom: "timeline", target: "2025-06-30", weightage: 30, status: "locked" },
];

export default function LockedGoalsView() {
  const [goals] = useState<LockedGoal[]>(MOCK_LOCKED);

  return (
    <div className="space-y-4">
      {goals.length === 0 ? (
        <div className="p-8 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-3xl flex flex-col items-center justify-center text-center bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="w-16 h-16 bg-zinc-200 dark:bg-zinc-800 text-zinc-400 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">No Locked Goals</h2>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-md">
            Your goals are still in draft mode. Once approved by your manager, they will appear here as read-only.
          </p>
        </div>
      ) : (
        goals.map((goal) => (
          <div key={goal.id} className="p-5 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 relative overflow-hidden">
            {/* Lock badge */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-bold">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Locked
            </div>

            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{goal.thrustArea}</span>
            <h4 className="text-lg font-bold text-zinc-900 dark:text-white mt-1">{goal.title}</h4>
            <div className="flex items-center gap-6 mt-3 text-sm text-zinc-500 dark:text-zinc-400">
              <span>UoM: <strong className="text-zinc-700 dark:text-zinc-300">{goal.uom}</strong></span>
              <span>Target: <strong className="text-zinc-700 dark:text-zinc-300">{goal.target}{goal.uom === 'percentage' ? '%' : ''}</strong></span>
              <span>Weight: <strong className="text-zinc-700 dark:text-zinc-300">{goal.weightage}%</strong></span>
            </div>

            {/* Read-only overlay message */}
            <p className="mt-3 text-xs text-zinc-400 italic">This goal is locked and read-only. Contact HR Admin to request an unlock.</p>
          </div>
        ))
      )}
    </div>
  );
}
