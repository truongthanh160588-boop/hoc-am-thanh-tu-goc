export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

const USER_STORAGE_KEY = "hoc_am_thanh_user";

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(USER_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function setUser(user: User): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

export function logout(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(USER_STORAGE_KEY);
}

export function isAuthenticated(): boolean {
  return getUser() !== null;
}
