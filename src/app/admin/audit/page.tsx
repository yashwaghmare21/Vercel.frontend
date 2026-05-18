"use client";

type AuditEvent = {
  id: string;
  actor: string;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  timestamp: string;
};

const MOCK_AUDIT: AuditEvent[] = [
  { id: "a1", actor: "Admin User", action: "UNLOCK_GOAL", entityType: "Goal", entityId: "g1", details: "Unlocked 'Increase Revenue' for Alice Smith. Status changed: Locked → Returned.", timestamp: "2025-05-18T14:30:00Z" },
  { id: "a2", actor: "Manager User", action: "APPROVE_GOALS", entityType: "GoalSheet", entityId: "gs1", details: "Approved goal sheet for Bob Jones (3 goals, 100% weightage).", timestamp: "2025-05-17T10:15:00Z" },
  { id: "a3", actor: "Manager User", action: "RETURN_GOALS", entityType: "GoalSheet", entityId: "gs2", details: "Returned Carol Lee's goal sheet with comment: 'Please adjust Q2 targets.'", timestamp: "2025-05-16T16:45:00Z" },
  { id: "a4", actor: "Admin User", action: "CYCLE_CHANGE", entityType: "Cycle", entityId: "c1", details: "Changed Q1 FY 2025-26 phase from PLANNING to CHECKIN.", timestamp: "2025-05-15T09:00:00Z" },
  { id: "a5", actor: "Manager User", action: "EDIT_WEIGHTAGE", entityType: "Goal", entityId: "g5", details: "Changed weightage of 'Launch Beta' from 40% to 50% during review.", timestamp: "2025-05-14T11:20:00Z" },
  { id: "a6", actor: "Employee User", action: "SUBMIT_GOALS", entityType: "GoalSheet", entityId: "gs3", details: "Alice Smith submitted goal sheet with 2 goals (total 100%).", timestamp: "2025-05-13T08:30:00Z" },
];

const actionColors: Record<string, string> = {
  UNLOCK_GOAL: "bg-rose-500",
  APPROVE_GOALS: "bg-emerald-500",
  RETURN_GOALS: "bg-amber-500",
  CYCLE_CHANGE: "bg-blue-500",
  EDIT_WEIGHTAGE: "bg-purple-500",
  SUBMIT_GOALS: "bg-indigo-500",
};

export default function AdminAuditPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Audit Logs</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-2">Complete timeline of who changed what and when.</p>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-zinc-200 dark:bg-zinc-800" />

        <div className="space-y-6">
          {MOCK_AUDIT.map(event => (
            <div key={event.id} className="relative flex gap-6 pl-12">
              {/* Dot */}
              <div className={`absolute left-3.5 top-1.5 w-3.5 h-3.5 rounded-full ring-4 ring-white dark:ring-black ${actionColors[event.action] || 'bg-zinc-400'}`} />

              <div className="flex-1 p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-zinc-900 dark:text-white">{event.actor}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                      {event.action.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-400">
                    {new Date(event.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{event.details}</p>
                <p className="text-xs text-zinc-400 mt-2">{event.entityType} #{event.entityId}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
