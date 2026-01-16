"use client";

import { createPurchase, getPurchases, isCoursePurchased, updatePurchaseStatus } from "./purchase-supabase";
import { getAuthUser } from "./auth-supabase";

export interface PurchaseZalo {
  id: string;
  userEmail: string;
  courseId: string;
  amountVnd: number;
  status: "pending" | "paid" | "rejected";
  createdAt: string;
  note?: string;
}

const PURCHASES_STORAGE_KEY = "purchases_v1";
const PAID_COURSES_STORAGE_KEY = "paid_courses_by_user_v1";

// Generate unique ID
function generatePurchaseId(): string {
  return `PUR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// LocalStorage helpers
function getPurchasesFromStorage(): PurchaseZalo[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(PURCHASES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function savePurchasesToStorage(purchases: PurchaseZalo[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PURCHASES_STORAGE_KEY, JSON.stringify(purchases));
  } catch (error) {
    console.error("Error saving purchases to localStorage:", error);
  }
}

function getPaidCoursesFromStorage(): Record<string, string[]> {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(PAID_COURSES_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function savePaidCoursesToStorage(paidCourses: Record<string, string[]>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PAID_COURSES_STORAGE_KEY, JSON.stringify(paidCourses));
  } catch (error) {
    console.error("Error saving paid courses to localStorage:", error);
  }
}

// Create purchase
export async function createPurchaseZalo(
  courseId: string,
  amountVnd: number,
  note?: string
): Promise<PurchaseZalo> {
  const user = await getAuthUser();
  const userEmail = user?.email || "guest@example.com";

  const purchase: PurchaseZalo = {
    id: generatePurchaseId(),
    userEmail,
    courseId,
    amountVnd,
    status: "pending",
    createdAt: new Date().toISOString(),
    note: note || undefined,
  };

  // Try Supabase first, fallback to localStorage
  try {
    const { data, error } = await createPurchase(courseId, amountVnd, undefined, note);
    if (!error && data) {
      // Supabase success, also save to localStorage as backup
      const purchases = getPurchasesFromStorage();
      purchases.push(purchase);
      savePurchasesToStorage(purchases);
      return purchase;
    }
  } catch (error) {
    console.warn("Supabase createPurchase failed, using localStorage:", error);
  }

  // Fallback to localStorage
  const purchases = getPurchasesFromStorage();
  purchases.push(purchase);
  savePurchasesToStorage(purchases);

  return purchase;
}

// Get purchases for user
export async function getUserPurchases(userEmail?: string): Promise<PurchaseZalo[]> {
  // Try Supabase first
  try {
    const { data, error } = await getPurchases();
    if (!error && data && data.length > 0) {
      // Convert Supabase format to PurchaseZalo format
      const user = await getAuthUser();
      const email = userEmail || user?.email || "";
      return data
        .filter((p) => !email || p.user_id === user?.id)
        .map((p) => ({
          id: p.id,
          userEmail: email,
          courseId: p.course_id,
          amountVnd: p.amount_vnd,
          status: p.status as "pending" | "paid" | "rejected",
          createdAt: p.created_at,
          note: p.transaction_code || undefined,
        }));
    }
  } catch (error) {
    console.warn("Supabase getPurchases failed, using localStorage:", error);
  }

  // Fallback to localStorage
  const purchases = getPurchasesFromStorage();
  const email = userEmail || (await getAuthUser())?.email || "";
  return purchases.filter((p) => !email || p.userEmail === email);
}

// Get pending purchases (for admin)
export async function getPendingPurchases(): Promise<PurchaseZalo[]> {
  // Try Supabase first
  try {
    const { data, error } = await getPurchases();
    if (!error && data) {
      return data
        .filter((p) => p.status === "pending")
        .map((p) => {
          // Need to get user email from user_id - simplified for now
          return {
            id: p.id,
            userEmail: "", // Will need to fetch from profiles table
            courseId: p.course_id,
            amountVnd: p.amount_vnd,
            status: p.status as "pending" | "paid" | "rejected",
            createdAt: p.created_at,
            note: p.transaction_code || undefined,
          };
        });
    }
  } catch (error) {
    console.warn("Supabase getPendingPurchases failed, using localStorage:", error);
  }

  // Fallback to localStorage
  const purchases = getPurchasesFromStorage();
  return purchases.filter((p) => p.status === "pending");
}

// Check if course is paid
export async function isCoursePaidZalo(courseId: string, userEmail?: string): Promise<boolean> {
  // Try Supabase first
  try {
    const isPaid = await isCoursePurchased(courseId);
    if (isPaid) return true;
  } catch (error) {
    console.warn("Supabase isCoursePurchased failed, using localStorage:", error);
  }

  // Fallback to localStorage
  const email = userEmail || (await getAuthUser())?.email || "";
  if (!email) return false;

  const purchases = getPurchasesFromStorage();
  return purchases.some(
    (p) => p.userEmail === email && p.courseId === courseId && p.status === "paid"
  );
}

// Update purchase status (admin only)
export async function updatePurchaseStatusZalo(
  purchaseId: string,
  status: "paid" | "rejected",
  userEmail?: string
): Promise<boolean> {
  // Try Supabase first
  try {
    const { error } = await updatePurchaseStatus(purchaseId, status);
    if (!error) {
      // Also update localStorage
      const purchases = getPurchasesFromStorage();
      const index = purchases.findIndex((p) => p.id === purchaseId);
      if (index !== -1) {
        purchases[index].status = status;
        savePurchasesToStorage(purchases);

        // Update paid courses
        if (status === "paid") {
          const purchase = purchases[index];
          const paidCourses = getPaidCoursesFromStorage();
          if (!paidCourses[purchase.userEmail]) {
            paidCourses[purchase.userEmail] = [];
          }
          if (!paidCourses[purchase.userEmail].includes(purchase.courseId)) {
            paidCourses[purchase.userEmail].push(purchase.courseId);
            savePaidCoursesToStorage(paidCourses);
          }
        }
      }
      return true;
    }
  } catch (error) {
    console.warn("Supabase updatePurchaseStatus failed, using localStorage:", error);
  }

  // Fallback to localStorage
  const purchases = getPurchasesFromStorage();
  const index = purchases.findIndex((p) => p.id === purchaseId);
  if (index === -1) return false;

  purchases[index].status = status;
  savePurchasesToStorage(purchases);

  // Update paid courses
  if (status === "paid") {
    const purchase = purchases[index];
    const email = userEmail || purchase.userEmail;
    const paidCourses = getPaidCoursesFromStorage();
    if (!paidCourses[email]) {
      paidCourses[email] = [];
    }
    if (!paidCourses[email].includes(purchase.courseId)) {
      paidCourses[email].push(purchase.courseId);
      savePaidCoursesToStorage(paidCourses);
    }
  }

  return true;
}

// Get Zalo message template
export function getZaloMessageTemplate(purchase: PurchaseZalo): string {
  const transferContent = `HATG ${purchase.userEmail} ${purchase.id}`;
  return `Em đã chuyển khoản KHÓA HỌC HỌC ÂM THANH TỪ GỐC (3.000.000đ).
Email đăng nhập: ${purchase.userEmail}
Mã đơn: ${purchase.id}
Nội dung CK: ${transferContent}
Nhờ anh Trương Thanh kích hoạt giúp em ạ.`;
}

// Get transfer content format
export function getTransferContent(userEmail: string, purchaseId: string): string {
  return `HATG ${userEmail} ${purchaseId}`;
}

// Get transfer info text (for copy)
export function getTransferInfoText(): string {
  return `Thông tin chuyển khoản:

Chủ TK: Trương Văn Thanh
STK: 0891000645477
Ngân hàng: Vietcombank Bạc Liêu
Số tiền: 3.000.000 VNĐ`;
}

// Get Zalo link
export function getZaloLink(message?: string): string {
  const phone = "0974704444";
  const encodedMessage = message ? encodeURIComponent(message) : "";
  return `https://zalo.me/${phone}${encodedMessage ? `?message=${encodedMessage}` : ""}`;
}
