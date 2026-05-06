// Frontend-only data store backed by localStorage.
// Simple pub/sub so components can re-render on changes.
import { useSyncExternalStore } from "react";
import { apiGetFrontendState, apiSaveFrontendState } from "./api";

export type Role = "citizen" | "authority" | "admin" | "user";
export type Priority = "high" | "medium" | "low";
export type Category = "Hospital" | "Residential" | "Industry";
export type RequestStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Completed"
  | "Expired"
  | "Active";

export type LocationDetails = {
  area: string;
  city: string;
  pincode: string;
  lat?: number;
  lng?: number;
};

export type StoredUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  department?: string;
  emergencyContact?: string;
  preferredLanguage?: string;
  savedLocation?: LocationDetails;
  password: string;
  role: Role;
  avatar?: string;
};

export type Area = {
  id: string;
  name: string;
  category: Category;
  demand: number;
  priority: Priority;
  allocated: number;
  status: "Full" | "Partial" | "No Supply";
  justification: string;
};

export type DemandRequest = {
  id: string;
  userEmail: string;
  userName: string;
  userPhone: string;
  location: LocationDetails;
  coordinates?: { lat: number; lng: number };
  amount: number;
  purpose: "Drinking Water" | "Household Use" | "Hospital/Emergency" | "Community Tank" | "Other";
  priority: Priority;
  description: string;
  createdAt: number;
  submittedAt: number;
  ttlMs: number;
  status: RequestStatus;
  score: number;
  scoreLabel: "Critical" | "High" | "Medium" | "Low";
};

export type Notification = {
  id: string;
  forEmail?: string; // undefined = broadcast
  title: string;
  body: string;
  createdAt: number;
  read: boolean;
};

export type AuditLog = {
  id: string;
  ts: number;
  actor: string;
  action: string;
  reason?: string;
};

export type CombinedSupplyPlan = {
  id: string;
  area: string;
  city?: string;
  pincode?: string;
  requestIds: string[];
  totalAmount: number;
  createdAt: number;
};

export type AppState = {
  users: StoredUser[];
  totalSupply: number;
  defaultTtlMin: number;
  areas: Area[];
  requests: DemandRequest[];
  combinedPlans: CombinedSupplyPlan[];
  notifications: Notification[];
  logs: AuditLog[];
  theme: "light" | "dark";
};

const KEY = "aquaflow_state_v1";
let remotePersistTimer: ReturnType<typeof setTimeout> | null = null;
let remoteSyncReady = false;

const seed = (): AppState => ({
  users: [
    {
      id: "u-admin",
      name: "City Admin",
      email: "admin@city.gov",
      phone: "+1 555 0001",
      location: "City HQ",
      password: "admin123",
      role: "admin",
    },
    {
      id: "u-demo",
      name: "Maya Citizen",
      email: "user@city.gov",
      phone: "+1 555 0100",
      location: "Sector 12",
      password: "user123",
      role: "citizen",
    },
  ],
  totalSupply: 1500,
  defaultTtlMin: 30,
  areas: [
    {
      id: "a1",
      name: "City General Hospital",
      category: "Hospital",
      demand: 350,
      priority: "high",
      allocated: 0,
      status: "No Supply",
      justification: "",
    },
    {
      id: "a2",
      name: "Sector 12 Residential",
      category: "Residential",
      demand: 320,
      priority: "medium",
      allocated: 0,
      status: "No Supply",
      justification: "",
    },
    {
      id: "a3",
      name: "Riverside Heights",
      category: "Residential",
      demand: 480,
      priority: "medium",
      allocated: 0,
      status: "No Supply",
      justification: "",
    },
    {
      id: "a4",
      name: "Industrial Park",
      category: "Industry",
      demand: 600,
      priority: "low",
      allocated: 0,
      status: "No Supply",
      justification: "",
    },
    {
      id: "a5",
      name: "Old Town Clinic",
      category: "Hospital",
      demand: 180,
      priority: "high",
      allocated: 0,
      status: "No Supply",
      justification: "",
    },
  ],
  requests: [],
  notifications: [
    {
      id: "n1",
      title: "Welcome to AquaFlow",
      body: "Your dashboard is ready.",
      createdAt: Date.now() - 60_000 * 30,
      read: false,
    },
  ],
  logs: [
    { id: "l1", ts: Date.now() - 60_000 * 60, actor: "System", action: "Demo data initialized" },
  ],
  combinedPlans: [],
  theme: "light",
});

let state: AppState = load();

function load(): AppState {
  if (typeof window === "undefined") return seed();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const s = seed();
      localStorage.setItem(KEY, JSON.stringify(s));
      return s;
    }
    return { ...seed(), ...JSON.parse(raw) };
  } catch {
    return seed();
  }
}

const listeners = new Set<() => void>();
function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // localStorage can be unavailable in private browsing or SSR-like shells.
  }
  listeners.forEach((l) => l());
  queueRemotePersist();
}

function queueRemotePersist() {
  if (typeof window === "undefined") return;
  if (!remoteSyncReady) return;
  if (remotePersistTimer) clearTimeout(remotePersistTimer);
  const snapshot = state;
  remotePersistTimer = setTimeout(() => {
    apiSaveFrontendState(snapshot).catch((error) => {
      console.warn("Backend state sync failed", error);
    });
  }, 250);
}

function applyRemoteState(remoteState: AppState) {
  state = { ...seed(), ...remoteState };
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Keep the in-memory state usable even if browser storage is blocked.
  }
  listeners.forEach((l) => l());
}

function isAppState(value: unknown): value is AppState {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<AppState>;
  return (
    Array.isArray(candidate.users) &&
    Array.isArray(candidate.areas) &&
    Array.isArray(candidate.requests) &&
    Array.isArray(candidate.notifications) &&
    typeof candidate.totalSupply === "number"
  );
}

export async function syncStateFromBackend() {
  if (typeof window === "undefined") return false;
  try {
    const result = await apiGetFrontendState<AppState>();
    if (isAppState(result.state)) {
      applyRemoteState(result.state);
    } else {
      remoteSyncReady = true;
      await apiSaveFrontendState(state);
    }
    remoteSyncReady = true;
    return true;
  } catch (error) {
    console.warn("Backend state load failed", error);
    return false;
  }
}

export function getState(): AppState {
  return state;
}

export function setState(updater: (s: AppState) => AppState) {
  state = updater(state);
  persist();
}

export function useStore<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => selector(state),
    () => selector(state),
  );
}

export const uid = () => Math.random().toString(36).slice(2, 10);

// --- Logs / notifications helpers ---
export function addLog(actor: string, action: string, reason?: string) {
  setState((s) => ({
    ...s,
    logs: [{ id: uid(), ts: Date.now(), actor, action, reason }, ...s.logs].slice(0, 200),
  }));
}

export function saveUserLocation(email: string, location: LocationDetails) {
  setState((s) => ({
    ...s,
    users: s.users.map((u) => (u.email === email ? { ...u, savedLocation: location } : u)),
  }));
  const label = `${location.area}${location.city ? `, ${location.city}` : ""}${location.pincode ? `, ${location.pincode}` : ""}`;
  addLog("User", `Saved location ${label}`);
}

export function computeRequestScore(
  purpose: DemandRequest["purpose"],
  priority: Priority,
  ttlMs: number,
  amount: number,
) {
  const purposeWeight: Record<DemandRequest["purpose"], number> = {
    "Hospital/Emergency": 5,
    "Drinking Water": 4,
    "Household Use": 3,
    "Community Tank": 3,
    Other: 1,
  };
  const urgencyMinutes = Math.max(1, Math.min(240, ttlMs / 60_000));
  const urgencyWeight =
    urgencyMinutes <= 15
      ? 5
      : urgencyMinutes <= 30
        ? 4
        : urgencyMinutes <= 60
          ? 3
          : urgencyMinutes <= 120
            ? 2
            : 1;
  const quantityWeight = Math.min(5, Math.max(1, Math.ceil(amount / 100)));
  const priorityWeight = priority === "high" ? 4 : priority === "medium" ? 2.5 : 1;
  const score = purposeWeight[purpose] + urgencyWeight + quantityWeight + priorityWeight;
  const scoreLabel =
    score >= 15 ? "Critical" : score >= 12 ? "High" : score >= 9 ? "Medium" : "Low";
  return { score, scoreLabel } as const;
}

export function createCombinedSupplyPlan(
  area: string,
  requestIds: string[],
  totalAmount: number,
  city?: string,
  pincode?: string,
) {
  setState((s) => ({
    ...s,
    combinedPlans: [
      { id: uid(), area, city, pincode, requestIds, totalAmount, createdAt: Date.now() },
      ...s.combinedPlans,
    ],
  }));
  addLog("Admin", `Combined supply plan created for ${area}`);
}

export function notify(title: string, body: string, forEmail?: string) {
  setState((s) => ({
    ...s,
    notifications: [
      { id: uid(), title, body, createdAt: Date.now(), read: false, forEmail },
      ...s.notifications,
    ].slice(0, 100),
  }));
}

// --- Allocation logic ---
const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

export function computeAllocation(areas: Area[], totalSupply: number): Area[] {
  const sorted = [...areas].sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
  let remaining = totalSupply;
  const result: Area[] = sorted.map((a) => {
    const give = Math.min(a.demand, Math.max(0, remaining));
    remaining -= give;
    let status: Area["status"] = "No Supply";
    if (give >= a.demand) status = "Full";
    else if (give > 0) status = "Partial";
    const justification =
      give >= a.demand
        ? `Full allocation granted (priority: ${a.priority}).`
        : give > 0
          ? `Partial allocation: ${give}/${a.demand} ML. Higher-priority demand was served first.`
          : `No allocation: total supply was exhausted by higher-priority areas.`;
    return { ...a, allocated: give, status, justification };
  });
  // Restore original order
  return areas.map((a) => result.find((r) => r.id === a.id)!);
}

export function recalcAllocation(actor = "System") {
  setState((s) => ({ ...s, areas: computeAllocation(s.areas, s.totalSupply) }));
  addLog(actor, "Recalculated allocation");
}

// --- Auth ---
const AUTH_KEY = "aquaflow_session";
export type Session = { email: string; role: Role };

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY) || "null");
  } catch {
    return null;
  }
}
export function setSession(s: Session | null) {
  if (s) localStorage.setItem(AUTH_KEY, JSON.stringify(s));
  else localStorage.removeItem(AUTH_KEY);
  listeners.forEach((l) => l());
}
export function currentUser(): StoredUser | null {
  const s = getSession();
  if (!s) return null;
  return state.users.find((u) => u.email === s.email && u.role === s.role) ?? null;
}

// --- Reset / clear ---
export function resetDemoData() {
  state = seed();
  persist();
}
export function clearAll() {
  localStorage.removeItem(KEY);
  localStorage.removeItem(AUTH_KEY);
  state = seed();
  persist();
}

// --- Theme ---
export function applyTheme(theme: "light" | "dark") {
  if (typeof document !== "undefined") {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }
  setState((s) => ({ ...s, theme }));
}

// Initialize allocation + theme on first load (browser only)
if (typeof window !== "undefined") {
  if (state.areas.every((a) => a.allocated === 0)) {
    state = { ...state, areas: computeAllocation(state.areas, state.totalSupply) };
    persist();
  }
  applyTheme(state.theme);
  syncStateFromBackend();
}

// --- Request expiry sweep ---
export function sweepExpired() {
  const now = Date.now();
  const expired = state.requests.filter(
    (r) => (r.status === "Pending" || r.status === "Active") && r.createdAt + r.ttlMs <= now,
  );
  if (!expired.length) return;

  setState((s) => ({
    ...s,
    requests: s.requests.map((request) =>
      expired.some((expiredRequest) => expiredRequest.id === request.id)
        ? { ...request, status: "Expired" as RequestStatus }
        : request,
    ),
    logs: [
      ...expired.map((request) => ({
        id: uid(),
        ts: now,
        actor: "System",
        action: `Request ${request.id} expired`,
      })),
      ...s.logs,
    ].slice(0, 200),
    notifications: [
      ...expired.map((request) => ({
        id: uid(),
        title: "Request expired",
        body: `Your request for ${request.location?.area ?? "your location"} (${request.amount} ML) expired.`,
        createdAt: now,
        read: false,
        forEmail: request.userEmail,
      })),
      ...s.notifications,
    ].slice(0, 100),
  }));
}
