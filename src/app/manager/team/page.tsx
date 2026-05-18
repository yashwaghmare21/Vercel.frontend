"use client";

import { useState, useEffect, useCallback } from 'react';
import { api, Goal, User } from '@/lib/api';

type EnhancedMember = {
  id: string;
  name: string;
  email: string;
  department?: string;
  goals: Goal[];
  goalsCount: number;
  status: 'draft' | 'submitted' | 'manager_review' | 'locked';
  completion: number;
};

const statusLabel: Record<string, { text: string; cls: string }> = {
  draft:          { text: "Draft",        cls: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400" },
  submitted:      { text: "Submitted",    cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  manager_review: { text: "Under Review", cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  locked:         { text: "Locked",       cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
};

export default function ManagerTeamPage() {
  const [team, setTeam] = useState<EnhancedMember[]>([]);
  const [selectedEmp, setSelectedEmp] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTeamData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch team members
      const members = await api.manager.team();
      
      // 2. Fetch goals for each member in parallel
      const enhanced: EnhancedMember[] = await Promise.all(
        members.map(async (m) => {
          try {
            const goals = await api.manager.employeeGoals(m.id);
            
            // Determine overall status
            // If any are SUBMITTED -> manager_review
            // If all are APPROVED -> locked
            // If any are DRAFT or RETURNED -> draft
            let status: 'draft' | 'submitted' | 'manager_review' | 'locked' = 'draft';
            if (goals.length > 0) {
              if (goals.some(g => g.status === 'SUBMITTED')) {
                status = 'manager_review';
              } else if (goals.every(g => g.status === 'APPROVED')) {
                status = 'locked';
              } else if (goals.some(g => g.status === 'DRAFT' || g.status === 'RETURNED')) {
                status = 'draft';
              }
            }

            // In hackathon mode, calculate simple completion or default to 0
            // (e.g. percentage of goals marked APPROVED / locked)
            const approvedCount = goals.filter(g => g.status === 'APPROVED').length;
            const completion = goals.length > 0 ? Math.round((approvedCount / goals.length) * 100) : 0;

            return {
              id: m.id,
              name: m.name,
              email: m.email,
              department: m.department,
              goals,
              goalsCount: goals.length,
              status,
              completion,
            };
          } catch {
            return {
              id: m.id,
              name: m.name,
              email: m.email,
              department: m.department,
              goals: [],
              goalsCount: 0,
              status: 'draft' as const,
              completion: 0,
            };
          }
        })
      );

      setTeam(enhanced);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load team data';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTeamData();
  }, [loadTeamData]);

  const selectedMember = team.find(m => m.id === selectedEmp);
  const selectedGoals  = selectedMember?.goals ?? [];

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Team Tracking</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">
            View your direct reports&apos; planned vs actual progress. Click a row to see their goals.
          </p>
        </div>
        <button
          onClick={loadTeamData}
          disabled={loading}
          className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
        >
          {loading ? 'Refreshing…' : '↻ Refresh'}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/20 text-red-600 dark:text-red-400 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Detail panel – shown when a row is selected */}
      {selectedEmp && selectedMember && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4 shadow-sm animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg font-bold">
                {selectedMember.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{selectedMember.name}</h2>
                <p className="text-sm text-zinc-500">{selectedMember.email} · {selectedGoals.length} goal{selectedGoals.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedEmp(null)}
              className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              ← Back to team
            </button>
          </div>

          {selectedGoals.length === 0 ? (
            <p className="text-zinc-500 text-sm italic py-4">No goals configured for this cycle yet.</p>
          ) : (
            <ul className="space-y-2">
              {selectedGoals.map((g) => (
                <li
                  key={g.id}
                  className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block mb-0.5">{g.thrust_area}</span>
                    <span className="font-semibold text-zinc-900 dark:text-white">{g.title}</span>
                    <p className="text-sm text-zinc-500 mt-0.5">
                      Weightage: {g.weightage}% · Target: {g.target_value} ({g.uom_type})
                    </p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    g.status === 'APPROVED'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : g.status === 'SUBMITTED'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : g.status === 'RETURNED'
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                  }`}>
                    {g.status.replace('_', ' ').toLowerCase()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Team table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-zinc-500 dark:text-zinc-400">
            <svg className="animate-spin w-8 h-8 text-indigo-600" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <span>Loading team reports…</span>
          </div>
        ) : team.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 dark:text-zinc-400">
            <p className="text-lg font-bold">No direct reports found</p>
            <p className="text-sm mt-1">Direct reports registered in the database with your manager ID will show here.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-left text-xs font-bold uppercase tracking-wider text-zinc-500">
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Goals</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Cycle Progress</th>
              </tr>
            </thead>
            <tbody>
              {team.map(m => (
                <tr
                  key={m.id}
                  className={`border-b border-zinc-100 dark:border-zinc-800 last:border-0 transition-colors cursor-pointer ${
                    selectedEmp === m.id
                      ? 'bg-indigo-50/50 dark:bg-indigo-900/10'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-950'
                  }`}
                  onClick={() => setSelectedEmp(m.id === selectedEmp ? null : m.id)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {m.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <span className="text-sm font-semibold text-zinc-900 dark:text-white block truncate">{m.name}</span>
                        <span className="text-xs text-zinc-400 dark:text-zinc-500 block truncate">{m.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-zinc-900 dark:text-white">{m.goalsCount}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusLabel[m.status]?.cls || ''}`}>
                      {statusLabel[m.status]?.text || m.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex-shrink-0">
                        <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${m.completion}%` }} />
                      </div>
                      <span className="text-sm font-bold text-zinc-900 dark:text-white">{m.completion}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
