"use client";

import { useCycle } from '@/contexts/CycleContext';
import { useState } from 'react';

// Mock locked goals for the check-in view
const MOCK_LOCKED_GOALS = [
  { id: "g1", title: "Increase Revenue", uom: "numeric", target: 100, actual: 0, checkinStatus: "not_started" },
  { id: "g2", title: "Improve CSAT", uom: "percentage", target: 95, actual: 40, checkinStatus: "on_track" }
];

export default function CheckinsPage() {
  const { cycle, isLoading } = useCycle();
  const [goals, setGoals] = useState(MOCK_LOCKED_GOALS);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isCheckinOpen = cycle?.canCheckin;

  const handleActualChange = (id: string, val: string) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, actual: Number(val) } : g));
  };

  const handleStatusChange = (id: string, status: string) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, checkinStatus: status } : g));
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Check-in submitted successfully!");
    }, 800);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Quarterly Check-ins</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">Log your progress for the active quarter.</p>
        </div>
        <div className="text-right">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <span className={`w-2 h-2 rounded-full ${isCheckinOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-sm font-medium text-zinc-900 dark:text-white">
              {isCheckinOpen ? `${cycle.quarter} Check-ins Open` : 'Check-ins Closed'}
            </span>
          </div>
        </div>
      </div>

      {!isCheckinOpen ? (
        <div className="p-8 border border-dashed border-red-200 dark:border-red-900/30 rounded-3xl flex flex-col items-center justify-center text-center bg-red-50/50 dark:bg-red-900/10">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">Check-in Window Closed</h2>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-md">
            The {cycle?.quarter} check-in window is currently closed by HR Admin. You cannot log progress at this time.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
          <div className="space-y-6">
            {goals.map((goal, i) => (
              <div key={goal.id} className="p-5 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50 dark:bg-black flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex-1">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Goal {i + 1}</span>
                  <h4 className="text-lg font-bold text-zinc-900 dark:text-white mt-1">{goal.title}</h4>
                  <p className="text-sm text-zinc-500 mt-1">Target: {goal.target} {goal.uom === 'percentage' ? '%' : ''}</p>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-full sm:w-auto">
                    <label className="block text-xs font-medium text-zinc-500 mb-1">Actual Value</label>
                    <input 
                      type="number"
                      value={goal.actual}
                      onChange={(e) => handleActualChange(goal.id, e.target.value)}
                      className="w-full sm:w-32 h-10 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  </div>

                  <div className="w-full sm:w-auto">
                    <label className="block text-xs font-medium text-zinc-500 mb-1">Status</label>
                    <select 
                      value={goal.checkinStatus}
                      onChange={(e) => handleStatusChange(goal.id, e.target.value)}
                      className="w-full sm:w-40 h-10 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    >
                      <option value="not_started">Not Started</option>
                      <option value="on_track">On Track</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Check-in Progress'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
