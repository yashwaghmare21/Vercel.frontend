"use client";

import { useState } from 'react';

type UnlockRequest = {
  goalId: string;
  goalTitle: string;
  employeeName: string;
  reason: string;
};

const MOCK_UNLOCK_REQUESTS: UnlockRequest[] = [
  { goalId: "g1", goalTitle: "Increase Revenue by 20%", employeeName: "Alice Smith", reason: "Target changed due to market shift" },
  { goalId: "g5", goalTitle: "Launch Product Beta", employeeName: "Bob Jones", reason: "Deadline extended by leadership" },
  { goalId: "g9", goalTitle: "Reduce Churn Rate", employeeName: "Carol Lee", reason: "KPI realignment after Q1 review" },
];

export default function AdminExceptionsPage() {
  const [requests, setRequests] = useState(MOCK_UNLOCK_REQUESTS);
  const [showModal, setShowModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<UnlockRequest | null>(null);

  const handleUnlock = (goalId: string) => {
    // PRD flow: Locked → Admin Unlock → Returned → Employee Edit → Submitted
    setRequests(prev => prev.filter(r => r.goalId !== goalId));
    setShowModal(false);
    setSelectedGoal(null);
  };

  const openConfirm = (req: UnlockRequest) => {
    setSelectedGoal(req);
    setShowModal(true);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Lock Exceptions</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">Unlock locked goals for employee revision. This action is audited.</p>
      </div>

      {requests.length === 0 ? (
        <div className="p-8 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-3xl flex flex-col items-center justify-center text-center bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">All Clear</h2>
          <p className="text-zinc-500 dark:text-zinc-400">No pending unlock requests.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(req => (
            <div key={req.goalId} className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-sm text-zinc-500">{req.employeeName}</p>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{req.goalTitle}</h3>
                <p className="text-sm text-zinc-500 mt-1">Reason: <span className="text-zinc-700 dark:text-zinc-300">{req.reason}</span></p>
              </div>
              <button
                onClick={() => openConfirm(req)}
                className="px-5 py-2.5 bg-rose-600 text-white font-medium rounded-xl hover:bg-rose-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
                Unlock Goal
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {showModal && selectedGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-zinc-200 dark:border-zinc-800">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white text-center mb-2">Confirm Unlock</h3>
            <p className="text-sm text-zinc-500 text-center mb-6">
              Unlocking <strong className="text-zinc-900 dark:text-white">{selectedGoal.goalTitle}</strong> for <strong>{selectedGoal.employeeName}</strong> will set the goal to <span className="text-amber-600 font-bold">Returned</span> status. This action is recorded in the audit log.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUnlock(selectedGoal.goalId)}
                className="flex-1 px-4 py-3 rounded-xl bg-rose-600 text-white font-medium hover:bg-rose-700 transition-colors"
              >
                Confirm Unlock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
