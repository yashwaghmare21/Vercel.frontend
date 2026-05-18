/**
 * lib/api.ts
 * Central fetch wrapper for all AtomQuest backend API calls.
 * - Sends credentials (httpOnly cookie) automatically
 * - Handles 401 → redirect to /login
 * - Throws typed ApiError on non-2xx responses
 */

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",           // sends httpOnly cookie
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });

  if (res.status === 401) {
    // Token expired or missing → redirect to login
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new ApiError(401, "Unauthenticated");
  }

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      detail = body.detail ?? detail;
    } catch { /* ignore */ }
    throw new ApiError(res.status, detail);
  }

  // 204 No Content
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

// ── Auth ──────────────────────────────────────────────────────
export const api = {
  auth: {
    /** POST /api/auth/login using form-data (OAuth2PasswordRequestForm) */
    login: async (email: string, password: string) => {
      const form = new URLSearchParams();
      form.append("username", email);
      form.append("password", password);
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: form.toString(),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new ApiError(res.status, body.detail ?? "Login failed");
      }
      return res.json() as Promise<{ access_token: string; token_type: string }>;
    },
    logout: () => request<void>("/api/auth/logout", { method: "POST" }),
    me: () => request<User>("/api/auth/me"),
    register: (data: UserCreateForm) => request<User>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
    managers: () => request<User[]>("/api/auth/managers"),
  },

  manager: {
    team: () => request<User[]>("/api/manager/team"),
    employeeGoals: (empId: string) =>
      request<Goal[]>(`/api/manager/goals/${empId}`),
    approveGoals: (empId: string) =>
      request<{ message: string }>(`/api/manager/goals/${empId}/approve`, {
        method: "POST",
      }),
    returnGoals: (empId: string, comment: string) =>
      request<{ message: string }>(`/api/manager/goals/${empId}/return`, {
        method: "POST",
        body: JSON.stringify({ comment }),
      }),
  },

  goals: {
    list: () => request<Goal[]>("/api/goals/"),
    create: (data: GoalCreate) =>
      request<Goal>("/api/goals/", { method: "POST", body: JSON.stringify(data) }),
    update: (goalId: string, data: Partial<GoalCreate>) =>
      request<Goal>(`/api/goals/${goalId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    submit: (goalIds: string[]) =>
      request<{ message: string }>("/api/goals/submit", {
        method: "POST",
        body: JSON.stringify({ goal_ids: goalIds }),
      }),
  },
};

// ── Shared types (mirrors backend schemas) ────────────────────
export type User = {
  id: string;
  name: string;
  email: string;
  role: "EMPLOYEE" | "MANAGER" | "ADMIN";
  department?: string;
  manager_id?: string;
  is_active: boolean;
};

export type Goal = {
  id: string;
  employee_id: string;
  cycle_id: string;
  thrust_area: string;
  title: string;
  description?: string;
  uom_type: string;
  target_value?: number;
  target_date?: string;
  weightage: number;
  status: string;
  is_locked: boolean;
  is_shared: boolean;
  return_comment?: string;
};

export type GoalCreate = {
  thrust_area: string;
  title: string;
  description?: string;
  uom_type: string;
  target_value?: number;
  target_date?: string;
  weightage: number;
};

export type UserCreateForm = {
  name: string;
  email: string;
  password: string;
  role: "EMPLOYEE" | "MANAGER" | "ADMIN";
  department?: string;
  manager_id?: string;
};

