"use client";

import { useState } from 'react';

type FeedbackEntry = {
  id: string;
  employeeName: string;
  quarter: string;
  comment: string;
  createdAt: string;
};

const MOCK_FEEDBACK: FeedbackEntry[] = [
  { id: "f1", employeeName: "Alice Smith", quarter: "Q1", comment: "Strong execution on revenue targets. Keep pushing on CSAT.", createdAt: "2025-05-10T10:00:00Z" },
  { id: "f2", employeeName: "Bob Jones", quarter: "Q1", comment: "Beta launch delayed — needs a recovery plan for Q2.", createdAt: "2025-05-10T10:30:00Z" },
];

export default function ManagerCommentsPage() {
  const [feedback, setFeedback] = useState(MOCK_FEEDBACK);
  const [newComment, setNewComment] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("Alice Smith");

  const employees = ["Alice Smith", "Bob Jones", "Carol Lee", "Dave Kim", "Eve Park"];

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    const entry: FeedbackEntry = {
      id: `f${Date.now()}`,
      employeeName: selectedEmployee,
      quarter: "Q1",
      comment: newComment,
      createdAt: new Date().toISOString(),
    };
    setFeedback(prev => [entry, ...prev]);
    setNewComment("");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Quarterly Feedback</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">Log structured feedback for your team members.</p>
      </div>

      {/* New Feedback */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">Add Feedback</h3>
        <div className="space-y-4">
          <select
            value={selectedEmployee}
            onChange={e => setSelectedEmployee(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white"
          >
            {employees.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
          <textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Write your quarterly feedback..."
            className="w-full p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white min-h-[100px] focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Submit Feedback
          </button>
        </div>
      </div>

      {/* History */}
      <div className="space-y-4">
        {feedback.map(f => (
          <div key={f.id} className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-zinc-900 dark:text-white">{f.employeeName}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-500">{f.quarter}</span>
              </div>
              <span className="text-xs text-zinc-400">{new Date(f.createdAt).toLocaleDateString()}</span>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{f.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
