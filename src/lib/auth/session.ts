import { AuthUser, UserRole } from "@/types/user";

const TOKEN_KEY = "accessToken";
const USER_KEY = "authUser";

export function setSession(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  queueMicrotask(() => window.dispatchEvent(new Event("ngv-session")));
}

export function updateStoredUser(user: AuthUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  queueMicrotask(() => window.dispatchEvent(new Event("ngv-session")));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  queueMicrotask(() => window.dispatchEvent(new Event("ngv-session")));
}

export function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function getUserRole(): UserRole | null {
  return getUser()?.role ?? null;
}

export function getPortalRouteForRole(role: UserRole): string {
  if (role === "admin") return "/portal/admin";
  if (role === "teacher") return "/portal/teacher";
  return "/portal/student";
}

export function isAuthenticated(): boolean {
  return !!getToken() && !!getUser();
}

export function subscribeSession(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("ngv-session", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("ngv-session", callback);
  };
}
export function getSessionSnapshot(): string {
  const user = getUser();
  return getToken() && user ? JSON.stringify(user) : "";
}
