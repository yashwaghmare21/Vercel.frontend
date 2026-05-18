"use client";

import { useState, useEffect } from "react";
import { api, ApiError, User } from "@/lib/api";

// Quick-login demo accounts (seeded by seed.py / bulk_seed_fast.py)
const DEMO_ACCOUNTS = [
  {
    role: "EMPLOYEE",
    label: "Employee",
    email: "employee@atomquest.demo",
    password: "Demo@123",
    icon: "👤",
    color: "bg-sky-100 hover:bg-sky-200 text-sky-900 border border-sky-300 font-extrabold shadow-sm dark:bg-zinc-800 dark:border-zinc-700 dark:text-white",
  },
  {
    role: "MANAGER",
    label: "Manager",
    email: "manager@atomquest.demo",
    password: "Demo@123",
    icon: "🎯",
    color: "bg-blue-100 hover:bg-blue-200 text-blue-900 border border-blue-300 font-extrabold shadow-sm dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-300",
  },
  {
    role: "ADMIN",
    label: "Admin",
    email: "admin@atomquest.demo",
    password: "Demo@123",
    icon: "⚙️",
    color: "bg-indigo-100 hover:bg-indigo-200 text-indigo-900 border border-indigo-300 font-extrabold shadow-sm dark:bg-violet-900/30 dark:border-violet-800 dark:text-violet-300",
  },
] as const;


/** Parse the role out of a JWT without verifying the signature. */
function getRoleFromToken(token: string): string | null {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json).role ?? null;
  } catch {
    return null;
  }
}

function redirectByRole(role: string) {
  if (role === "MANAGER") window.location.href = "/manager/dashboard";
  else if (role === "ADMIN") window.location.href = "/admin/dashboard";
  else window.location.href = "/employee/dashboard";
}

export default function LoginPage() {
  // Tab control: "signin" | "register"
  const [activeTab, setActiveTab] = useState<"signin" | "register">("signin");

  // Sign In State
  const [signInEmail, setSignInEmail]       = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signInLoading, setSignInLoading]   = useState(false);
  const [signInError, setSignInError]       = useState<string | null>(null);
  const [fillLabel, setFillLabel]           = useState<string | null>(null);

  // Register State
  const [regName, setRegName]             = useState("");
  const [regEmail, setRegEmail]           = useState("");
  const [regPassword, setRegPassword]     = useState("");
  const [regRole, setRegRole]             = useState<"EMPLOYEE" | "MANAGER">("EMPLOYEE");
  const [regDept, setRegDept]             = useState("");
  const [regManagerId, setRegManagerId]   = useState("");
  const [regLoading, setRegLoading]       = useState(false);
  const [regError, setRegError]           = useState<string | null>(null);
  const [regSuccess, setRegSuccess]       = useState<string | null>(null);

  // Active Managers List (for Employee signup dropdown)
  const [managers, setManagers] = useState<User[]>([]);

  // Load active managers list for registration dropdown
  useEffect(() => {
    if (activeTab === "register") {
      api.auth.managers()
        .then(setManagers)
        .catch((err) => console.warn("Failed to load managers:", err));
    }
  }, [activeTab]);

  // Sign In Handler
  const handleSignIn = async (emailVal: string, passwordVal: string) => {
    setSignInLoading(true);
    setSignInError(null);
    try {
      const { access_token } = await api.auth.login(emailVal, passwordVal);
      const role = getRoleFromToken(access_token);
      if (!role) throw new Error("Could not determine user role from token.");
      redirectByRole(role);
    } catch (err) {
      if (err instanceof ApiError) setSignInError(err.message);
      else if (err instanceof Error) setSignInError(err.message);
      else setSignInError("Login failed. Please try again.");
      setSignInLoading(false);
    }
  };

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signInEmail.trim() || !signInPassword.trim()) {
      setSignInError("Please enter your email and password.");
      return;
    }
    handleSignIn(signInEmail.trim(), signInPassword.trim());
  };

  const handleQuickLogin = (account: (typeof DEMO_ACCOUNTS)[number]) => {
    setSignInEmail(account.email);
    setSignInPassword(account.password);
    setFillLabel(account.label);
    setSignInError(null);
    setTimeout(() => {
      setFillLabel(null);
      handleSignIn(account.email, account.password);
    }, 300);
  };

  // Registration Handler
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegSuccess(null);

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setRegError("Please fill out all required fields.");
      return;
    }

    if (regRole === "EMPLOYEE" && !regManagerId) {
      setRegError("Please select a Reporting Manager.");
      return;
    }

    setRegLoading(true);
    try {
      await api.auth.register({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword.trim(),
        role: regRole,
        department: regDept.trim() || undefined,
        manager_id: regRole === "EMPLOYEE" ? regManagerId : undefined,
      });

      setRegSuccess("Account created successfully! Switching to sign in...");
      
      // Reset registration form
      setRegName("");
      setRegEmail("");
      setRegPassword("");
      setRegDept("");
      setRegManagerId("");

      // Switch tab and pre-fill sign in email
      setTimeout(() => {
        setSignInEmail(regEmail.trim());
        setRegSuccess(null);
        setActiveTab("signin");
      }, 1500);

    } catch (err) {
      if (err instanceof ApiError) setRegError(err.message);
      else if (err instanceof Error) setRegError(err.message);
      else setRegError("Registration failed. Please check details.");
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-sky-100 via-blue-50 to-white dark:from-zinc-950 dark:via-slate-900 dark:to-zinc-950 p-4 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/30 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '6s' }} />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-400/30 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />

      <div className="w-full max-w-md relative z-10">
        <div className="p-8 rounded-3xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-blue-200/80 dark:border-zinc-800 shadow-2xl shadow-blue-500/10 transition-all duration-300">

          {/* Logo & Portal Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 mb-3 shadow-lg shadow-blue-500/35">
              <span className="text-2xl">⚡</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-blue-950 dark:text-white">
              AtomQuest <span className="text-blue-600 dark:text-blue-400">1.0</span>
            </h1>
            <p className="text-blue-900/80 dark:text-zinc-300 text-sm font-extrabold mt-1">
              Goal Setting &amp; Tracking Portal
            </p>
          </div>

          {/* Sliding Tab Selectors */}
          <div className="flex bg-blue-50 dark:bg-zinc-950 p-1 rounded-xl mb-6 border border-blue-100 dark:border-zinc-850">
            <button
              onClick={() => { setActiveTab("signin"); setSignInError(null); }}
              className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${
                activeTab === "signin"
                  ? "bg-white dark:bg-zinc-800 text-blue-950 dark:text-white shadow-md border border-blue-100/50 dark:border-zinc-700"
                  : "text-blue-900/60 dark:text-zinc-400 hover:text-blue-950"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setActiveTab("register"); setRegError(null); setRegSuccess(null); }}
              className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${
                activeTab === "register"
                  ? "bg-white dark:bg-zinc-800 text-blue-950 dark:text-white shadow-md border border-blue-100/50 dark:border-zinc-700"
                  : "text-blue-900/60 dark:text-zinc-400 hover:text-blue-950"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* ────────────────── SIGN IN TAB ────────────────── */}
          {activeTab === "signin" && (
            <div className="animate-fadeIn">
              {signInError && (
                <div className="mb-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm font-semibold flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{signInError}</span>
                </div>
              )}

              <form onSubmit={handleSignInSubmit} className="space-y-4" id="login-form">
                <div>
                  <label
                    htmlFor="login-email"
                    className="block text-xs font-extrabold text-blue-950 dark:text-blue-300 uppercase tracking-wider mb-1.5"
                  >
                    Email Address
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@atomquest.demo"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    disabled={signInLoading}
                    className="w-full h-11 px-4 rounded-xl border border-blue-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800 text-zinc-955 dark:text-white placeholder-zinc-450 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50 transition-shadow"
                  />
                </div>

                <div>
                  <label
                    htmlFor="login-password"
                    className="block text-xs font-extrabold text-blue-955 dark:text-blue-300 uppercase tracking-wider mb-1.5"
                  >
                    Password
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    disabled={signInLoading}
                    className="w-full h-11 px-4 rounded-xl border border-blue-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800 text-zinc-955 dark:text-white placeholder-zinc-450 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50 transition-shadow"
                  />
                </div>

                <button
                  id="login-submit"
                  type="submit"
                  disabled={signInLoading}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:from-blue-700 active:to-indigo-700 text-white font-black text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 mt-2"
                >
                  {signInLoading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Signing in…
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-blue-100 dark:bg-zinc-800" />
                <span className="text-xs text-blue-900/60 dark:text-zinc-400 font-extrabold uppercase tracking-wider">Quick Demo Login</span>
                <div className="flex-1 h-px bg-blue-100 dark:bg-zinc-800" />
              </div>

              {/* Quick-login buttons */}
              <div className="grid grid-cols-3 gap-3">
                {DEMO_ACCOUNTS.map((account) => (
                  <button
                    key={account.role}
                    id={`quick-login-${account.role.toLowerCase()}`}
                    onClick={() => handleQuickLogin(account)}
                    disabled={signInLoading}
                    className={`h-11 rounded-xl font-extrabold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 ${account.color} ${
                      fillLabel === account.label ? "scale-95 opacity-80" : ""
                    }`}
                  >
                    <span>{account.icon}</span>
                    {account.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ────────────────── REGISTER TAB ────────────────── */}
          {activeTab === "register" && (
            <div className="animate-fadeIn">
              {regError && (
                <div className="mb-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm font-semibold flex items-center gap-2 animate-shake">
                  <span>⚠️</span>
                  <span>{regError}</span>
                </div>
              )}

              {regSuccess && (
                <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-sm font-semibold flex items-center gap-2">
                  <span>✅</span>
                  <span>{regSuccess}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-3" id="register-form">
                <div>
                  <label className="block text-xs font-extrabold text-blue-955 dark:text-blue-300 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    disabled={regLoading}
                    className="w-full h-10 px-4 rounded-xl border border-blue-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800 text-zinc-955 dark:text-white placeholder-zinc-450 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-blue-955 dark:text-blue-300 uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@atomquest.demo"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    disabled={regLoading}
                    className="w-full h-10 px-4 rounded-xl border border-blue-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800 text-zinc-955 dark:text-white placeholder-zinc-450 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-blue-955 dark:text-blue-300 uppercase tracking-wider mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Create a strong password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    disabled={regLoading}
                    className="w-full h-10 px-4 rounded-xl border border-blue-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800 text-zinc-955 dark:text-white placeholder-zinc-450 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-extrabold text-blue-955 dark:text-blue-300 uppercase tracking-wider mb-1">
                      Portal Role *
                    </label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as "EMPLOYEE" | "MANAGER")}
                      disabled={regLoading}
                      className="w-full h-10 px-3 rounded-xl border border-blue-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800 text-zinc-955 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      <option value="EMPLOYEE">Employee</option>
                      <option value="MANAGER">Manager</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold text-blue-955 dark:text-blue-300 uppercase tracking-wider mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sales"
                      value={regDept}
                      onChange={(e) => setRegDept(e.target.value)}
                      disabled={regLoading}
                      className="w-full h-10 px-4 rounded-xl border border-blue-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800 text-zinc-955 dark:text-white placeholder-zinc-450 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Manager dropdown (Shown only if role is Employee) */}
                {regRole === "EMPLOYEE" && (
                  <div className="animate-fadeIn">
                    <label className="block text-xs font-extrabold text-blue-955 dark:text-blue-300 uppercase tracking-wider mb-1">
                      Reporting Manager *
                    </label>
                    <select
                      required
                      value={regManagerId}
                      onChange={(e) => setRegManagerId(e.target.value)}
                      disabled={regLoading}
                      className="w-full h-10 px-3 rounded-xl border border-blue-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800 text-zinc-955 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      <option value="">-- Choose your Manager --</option>
                      {managers.map((mgr) => (
                        <option key={mgr.id} value={mgr.id}>
                          {mgr.name} ({mgr.department ?? "No Department"})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-50 hover:to-indigo-500 text-white font-black text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4 shadow-lg shadow-blue-500/25"
                >
                  {regLoading ? "Creating Account…" : "Register & Sign Up"}
                </button>
              </form>
            </div>
          )}

          <p className="text-center text-xs text-blue-900/50 dark:text-zinc-500 font-bold mt-6">
            AtomQuest Corporate Portal v1.0.0
          </p>
        </div>
      </div>
    </div>
  );
}
