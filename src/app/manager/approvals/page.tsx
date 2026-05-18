"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import type { Goal } from "@/types/goal";

// ──────────────────────────────────────────────────────────────
//  Types (aligned with backend PendingSubmission response)
// ──────────────────────────────────────────────────────────────
type Submission = {
  id: string;          // employee_id
  employeeName: string;
  submittedAt: string; // ISO or human-readable
  goals: Goal[];
};

// ──────────────────────────────────────────────────────────────
//  Fallback mock data (used ONLY when backend is truly unreachable)
// ──────────────────────────────────────────────────────────────
const FALLBACK: Submission[] = [
  {
    id: "e1", employeeName: "Alice Smith", submittedAt: "2 hours ago",
    goals: [
      { id: "g1", employeeId: "e1", managerId: "m1", status: "manager_review", checkinStatus: "not_started", thrustArea: "Financial",  title: "Increase Revenue by 20%", description: "", weightage: 40, uom: "numeric",     evaluationType: "max", target: 100 },
      { id: "g2", employeeId: "e1", managerId: "m1", status: "manager_review", checkinStatus: "not_started", thrustArea: "Customer",   title: "Improve CSAT to 95",      description: "", weightage: 30, uom: "percentage", evaluationType: "max", target: 95  },
      { id: "g3", employeeId: "e1", managerId: "m1", status: "manager_review", checkinStatus: "not_started", thrustArea: "Process",    title: "Reduce Onboarding Time",   description: "", weightage: 30, uom: "numeric",     evaluationType: "min", target: 14  },
    ],
  },
  {
    id: "e2", employeeName: "Bob Jones", submittedAt: "5 hours ago",
    goals: [
      { id: "g4", employeeId: "e2", managerId: "m1", status: "manager_review", checkinStatus: "not_started", thrustArea: "Process",  title: "Launch Product Beta",    description: "", weightage: 60, uom: "numeric", evaluationType: "min", target: 100 },
      { id: "g5", employeeId: "e2", managerId: "m1", status: "manager_review", checkinStatus: "not_started", thrustArea: "Learning", title: "Complete Team Training", description: "", weightage: 40, uom: "numeric", evaluationType: "min", target: 20  },
    ],
  },
];

/** Map backend PendingSubmission response into the frontend Submission type. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapSubmission(raw: any): Submission {
  return {
    id: raw.employee_id,
    employeeName: raw.employee_name,
    submittedAt: raw.submitted_at
      ? new Date(raw.submitted_at).toLocaleString()
      : "Unknown",
    goals: (raw.goals ?? []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (g: any): Goal => ({
        id:            g.id,
        employeeId:    raw.employee_id,
        managerId:     "",           // not returned by this endpoint
        status:        "manager_review",
        checkinStatus: "not_started",
        thrustArea:    g.thrust_area ?? "",
        title:         g.title ?? "",
        description:   g.description ?? "",
        weightage:     Number(g.weightage) || 0,
        uom:           (g.uom_type ?? "numeric").toLowerCase(),
        evaluationType:"max",
        target:        Number(g.target_value) || 0,
      }),
    ),
  };
}

import { validateManagerEdits } from "@/shared/goal-validation";

// ──────────────────────────────────────────────────────────────
//  Component
// ──────────────────────────────────────────────────────────────
export default function ManagerApprovalsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [activeId, setActiveId]       = useState<string>("");
  const [editingId, setEditingId]     = useState<string | null>(null);
  const [tempWeight, setTempWeight]   = useState<number>(0);
  const [errorMsg, setErrorMsg]       = useState<string | null>(null);
  const [toast, setToast]             = useState<{ msg: string; type: "success" | "warn" } | null>(null);
  const [loading, setLoading]         = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [usingMock, setUsingMock]     = useState(false);

  // ── Load submissions from backend ──────────────────────────────────────────
  const loadSubmissions = useCallback(async () => {
    setFetchLoading(true);
    try {
      const raw = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api/manager/pending-submissions`,
        { credentials: "include" },
      );

      if (raw.status === 401) {
        // Token expired — middleware will redirect, but be safe
        window.location.href = "/login";
        return;
      }

      if (!raw.ok) throw new Error(`Backend error: ${raw.status}`);

      const data = await raw.json();
      const mapped: Submission[] = (data as unknown[]).map(mapSubmission);
      setUsingMock(false);
      setSubmissions(mapped);
      setActiveId(mapped[0]?.id ?? "");
    } catch (err) {
      console.warn("Could not reach backend, using mock data:", err);
      setUsingMock(true);
      setSubmissions(FALLBACK);
      setActiveId(FALLBACK[0].id);
    } finally {
      setFetchLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions]);

  const activeSub    = submissions.find((s) => s.id === activeId) ?? null;
  const goals        = activeSub?.goals ?? [];
  const currentTotal = goals.reduce((acc, g) => acc + g.weightage, 0);

  const showToast = (msg: string, type: "success" | "warn") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2500);
  };

  // Remove a submission from state immediately (no stale-closure bug)
  const removeById = (id: string) => {
    setSubmissions((prev) => {
      const remaining = prev.filter((s) => s.id !== id);
      setActiveId(remaining[0]?.id ?? "");
      return remaining;
    });
    setEditingId(null);
    setErrorMsg(null);
  };

  const approveAndLock = async () => {
    if (currentTotal !== 100) {
      setErrorMsg(`Total weightage must be 100%. Currently ${currentTotal}%.`);
      return;
    }
    const idToRemove = activeId;
    setLoading(true);

    if (!usingMock) {
      try {
        const res = await api.manager.approveGoals(idToRemove);
        console.log("Approved:", res);
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Approval failed. Please retry.";
        setErrorMsg(msg);
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    showToast(`✓ ${activeSub?.employeeName}'s goals approved & locked`, "success");
    removeById(idToRemove);
  };

  const returnForRevision = async () => {
    const idToRemove = activeId;
    setLoading(true);

    if (!usingMock) {
      try {
        await api.manager.returnGoals(idToRemove, "Returned by manager for revision.");
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Return failed. Please retry.";
        setErrorMsg(msg);
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    showToast(`↩ ${activeSub?.employeeName}'s goals returned for revision`, "warn");
    removeById(idToRemove);
  };

  const startEdit = (goal: Goal) => {
    setEditingId(goal.id);
    setTempWeight(goal.weightage);
    setErrorMsg(null);
  };

  const saveEdit = () => {
    if (!editingId) return;
    const updated = goals.map((g) =>
      g.id === editingId ? { ...g, weightage: tempWeight } : g,
    );
    const validation = validateManagerEdits(goals, updated);
    if (!validation.isValid) {
      setErrorMsg(validation.errors[0]);
      return;
    }
    setSubmissions((prev) =>
      prev.map((s) => (s.id === activeId ? { ...s, goals: updated } : s)),
    );
    setEditingId(null);
    setErrorMsg(null);
  };

  // ────────────────────────────────────────────────────────────
  //  Render
  // ────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto space-y-8">

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl shadow-xl text-white font-medium text-sm animate-fadeIn ${
            toast.type === "success" ? "bg-emerald-600" : "bg-amber-500"
          }`}
        >
          {toast.msg}
        </div>
      )}

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            Pending Approvals
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Review submitted goal sheets from your team.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {usingMock && (
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
              Demo Mode (mock data)
            </span>
          )}
          <button
            onClick={loadSubmissions}
            disabled={fetchLoading || loading}
            className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
          >
            {fetchLoading ? "Loading…" : "↻ Refresh"}
          </button>
        </div>
      </div>

      {/* Loading state */}
      {fetchLoading ? (
        <div className="flex items-center justify-center py-20 text-zinc-400">
          <svg className="animate-spin w-6 h-6 mr-3" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Loading submissions…
        </div>
      ) : submissions.length === 0 ? (
        // Empty state
        <div className="p-12 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-3xl flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">All caught up!</h2>
          <p className="text-zinc-500 dark:text-zinc-400">No pending submissions to review.</p>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-6">

          {/* ── Left: submission list ── */}
          <div className="col-span-4 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
              {submissions.length} pending
            </p>
            {submissions.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setActiveId(s.id);
                  setEditingId(null);
                  setErrorMsg(null);
                }}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  activeId === s.id
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                    : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {s.employeeName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                      {s.employeeName}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {s.goals.length} goals · {s.submittedAt}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* ── Right: active submission detail ── */}
          {activeSub && (
            <div className="col-span-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">

              {/* Header */}
              <div className="flex items-center justify-between pb-5 mb-5 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg font-bold">
                    {activeSub.employeeName.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                      {activeSub.employeeName}
                    </h2>
                    <p className="text-xs text-zinc-400">Submitted {activeSub.submittedAt}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-500">Total Weightage</p>
                  <p className={`text-2xl font-bold ${currentTotal === 100 ? "text-emerald-500" : "text-red-500"}`}>
                    {currentTotal}%
                  </p>
                </div>
              </div>

              {/* Error */}
              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-sm flex items-center justify-between">
                  <span>{errorMsg}</span>
                  <button onClick={() => setErrorMsg(null)} className="text-red-400 ml-2">✕</button>
                </div>
              )}

              {/* Goals list */}
              <div className="space-y-3 mb-6">
                {goals.map((goal) => (
                  <div
                    key={goal.id}
                    className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-between"
                  >
                    <div>
                      <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                        {goal.thrustArea}
                      </span>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white mt-0.5">
                        {goal.title}
                      </h4>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Target: {goal.target}
                        {goal.uom === "percentage" ? "%" : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {editingId === goal.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number" min={0} max={100}
                            className="w-16 px-2 py-1 text-center rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
                            value={tempWeight}
                            onChange={(e) => setTempWeight(Number(e.target.value))}
                          />
                          <span className="text-zinc-500 text-sm">%</span>
                          <button onClick={saveEdit} className="text-emerald-600 font-bold text-sm">Save</button>
                          <button onClick={() => setEditingId(null)} className="text-zinc-400 text-sm">✕</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-bold text-zinc-900 dark:text-white">
                            {goal.weightage}%
                          </span>
                          <button
                            onClick={() => startEdit(goal)}
                            className="text-xs font-medium text-amber-600 hover:underline"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  onClick={approveAndLock}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  {loading ? "Processing…" : "Approve & Lock"}
                </button>
                <button
                  onClick={returnForRevision}
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 disabled:opacity-50 text-red-600 font-bold rounded-xl transition-colors border border-red-200 dark:border-red-900/30 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                  {loading ? "Processing…" : "Return for Revision"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
