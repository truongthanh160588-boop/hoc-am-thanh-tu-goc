import { getUser } from "./auth";

const ADMIN_EMAIL_KEY = "admin_email_truongthanh";
const ADMIN_TOGGLE_KEY = "admin_toggle";

export function isAdmin(): boolean {
  if (typeof window === "undefined") return false;
  
  const user = getUser();
  if (!user) return false;

  // Check email contains "truongthanh"
  if (user.email.toLowerCase().includes("truongthanh")) {
    return true;
  }

  // Check admin toggle
  const adminToggle = localStorage.getItem(ADMIN_TOGGLE_KEY);
  if (adminToggle === "true") {
    return true;
  }

  return false;
}

export function setAdminToggle(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ADMIN_TOGGLE_KEY, enabled ? "true" : "false");
}

export function getAdminToggle(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(ADMIN_TOGGLE_KEY) === "true";
}
