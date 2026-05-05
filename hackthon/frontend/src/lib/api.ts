const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8001";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
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
  role: "user" | "admin";
};

export function apiHealth() {
  return request<{ status: string }>("/health");
}

export function apiSignup(payload: { username: string; email: string; password: string; role: "user" | "admin" }) {
  return request<{ message: string; user: BackendUser }>("/signup", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function apiLogin(payload: { email: string; password: string }) {
  return request<{ message: string; user: BackendUser }>("/login", {
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
