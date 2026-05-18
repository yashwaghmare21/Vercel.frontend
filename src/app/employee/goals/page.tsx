"use client";

import GoalSheetForm from '@/components/GoalSheetForm';
import LockedGoalsView from '@/components/LockedGoalsView';
import { useState } from 'react';

export default function EmployeeGoalsPage() {
  const [activeTab, setActiveTab] = useState<'DRAFT' | 'LOCKED'>('DRAFT');

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Goal Sheet</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">Manage your goals for the current cycle.</p>
        </div>
      </div>

      <div className="flex items-center gap-2 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('DRAFT')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === 'DRAFT' 
              ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' 
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
          }`}
        >
          Draft & Edit
        </button>
        <button
          onClick={() => setActiveTab('LOCKED')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
            activeTab === 'LOCKED' 
              ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm' 
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
          }`}
        >
          Locked Goals
        </button>
      </div>

      <div className="mt-8">
        {activeTab === 'DRAFT' ? (
          <GoalSheetForm />
        ) : (
          <LockedGoalsView />
        )}
      </div>
    </div>
  );
}
