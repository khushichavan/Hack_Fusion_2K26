// Thin compatibility layer over the store-based session.
import { currentUser, getSession, setSession, setState, type StoredUser, type Role } from "./store";
import { setAuthToken } from "./api";

export type { Role };
export type AuthUser = StoredUser;

export function getUser(): AuthUser | null {
  return currentUser();
}

export function setUser(u: AuthUser) {
  setState((s) => {
    const exists = s.users.some((x) => x.email === u.email);
    const users = exists
      ? s.users.map((x) => (x.email === u.email ? { ...x, ...u } : x))
      : [...s.users, u];
    return { ...s, users };
  });
  setSession({ email: u.email, role: u.role });
}

export function clearUser() {
  setAuthToken(null);
  setSession(null);
}

export { getSession, setSession };
