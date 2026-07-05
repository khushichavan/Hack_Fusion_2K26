const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8001";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function getAuthToken(): string | null {
  try {
    const session = localStorage.getItem("aquaflow_session");
    if (!session) return null;
    return localStorage.getItem("aquaflow_token");
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem("aquaflow_token", token);
  } else {
    localStorage.removeItem("aquaflow_token");
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) ?? {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = data?.detail ?? data?.message ?? "Backend request failed";
    throw new ApiError(message, response.status);
  }

  return data as T;
}

export type BackendUser = {
  email: string;
  username: string;
  role: "citizen" | "authority" | "admin" | "user";
  reward_points?: number;
};

export function apiHealth() {
  return request<{ status: string }>("/health");
}

export function apiSignup(payload: {
  username: string;
  email: string;
  password: string;
  role: "citizen" | "authority" | "admin" | "user";
}) {
  return request<{ message: string; token?: string; user: BackendUser }>("/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function apiLogin(payload: { email: string; password: string }) {
  return request<{ message: string; token?: string; user: BackendUser }>("/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type PlatformSnapshot = {
  platform: string;
  database: string;
  zones: Array<{
    id: string;
    name: string;
    lat: number;
    lng: number;
    population: number;
    hospitals: number;
    demand_factor: number;
    wastage: number;
    low_income_index: number;
    past_usage: number;
    tank_level: number;
    leakage_alert: boolean;
    status: "balanced" | "warning" | "critical";
  }>;
  latest_allocation: {
    total_supply: number;
    city_fairness_score: number;
    allocations: Array<{
      zone_id: string;
      zone: string;
      allocation_ml: number;
      demand_ml: number;
      fairness_score: number;
      status: "balanced" | "warning" | "critical";
      explanation: string;
    }>;
  };
  analytics: {
    total_supply: number;
    city_fairness_score: number;
    critical_zones: number;
    open_complaints: number;
    active_requests: number;
    tankers_active: number;
  };
  predictions: Array<{ day: string; demand: number; predicted: number }>;
  tankers: Array<{
    id: string;
    driver: string;
    lat: number;
    lng: number;
    capacity: number;
    status: string;
    zone_id: string;
  }>;
  complaints: Array<Record<string, unknown>>;
  notifications: Array<Record<string, unknown>>;
  audit_logs: Array<Record<string, unknown>>;
  emergency_events: Array<Record<string, unknown>>;
};

export function apiPlatformSnapshot() {
  return request<PlatformSnapshot>("/platform/snapshot");
}

export function apiRunFairness(payload: {
  total_supply: number;
  drought_severity?: number;
  emergency_type?: string;
  emergency_zone_id?: string;
}) {
  return request<{ message: string; result: PlatformSnapshot["latest_allocation"] }>(
    "/ai/fairness/allocate",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function apiTriggerEmergency(payload: {
  event_type: string;
  zone_id: string;
  severity?: string;
  notes?: string;
}) {
  return request<{
    message: string;
    event: Record<string, unknown>;
    allocation: PlatformSnapshot["latest_allocation"];
  }>("/emergency/trigger", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function apiCreateComplaint(payload: {
  user_email: string;
  zone_id: string;
  category: string;
  description: string;
  media_url?: string;
  lat?: number;
  lng?: number;
}) {
  return request<{ message: string; complaint: Record<string, unknown> }>("/complaints", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function apiGetFrontendState<T>() {
  return request<{ state: T | null }>("/frontend-state");
}

export function apiSaveFrontendState<T>(state: T) {
  return request<{ message: string }>("/frontend-state", {
    method: "PUT",
    body: JSON.stringify({ state }),
  });
}
