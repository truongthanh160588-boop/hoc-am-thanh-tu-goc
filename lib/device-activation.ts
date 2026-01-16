"use client";

/**
 * Device ID & Activation Management
 * Lưu trữ Device ID và trạng thái kích hoạt trong localStorage
 */

const DEVICE_ID_KEY = "hatg_device_id_v1";
const ACTIVATION_KEY = "hatg_activation_v1";

export interface ActivationState {
  [courseId: string]: {
    activated: boolean;
    deviceId: string;
    activatedAt: string;
  };
}

/**
 * Lấy hoặc tạo Device ID
 */
export function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") return "";
  
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  
  if (!deviceId) {
    // Tạo UUID mới
    deviceId = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  
  return deviceId;
}

/**
 * Lấy Device ID hiện tại (không tạo mới)
 */
export function getDeviceId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(DEVICE_ID_KEY);
}

/**
 * Format Device ID để hiển thị (rút gọn)
 */
export function formatDeviceId(deviceId: string): string {
  // Lấy 8 ký tự đầu, uppercase
  return deviceId.substring(0, 8).toUpperCase();
}

/**
 * Lấy trạng thái kích hoạt cho courseId
 */
export function getActivationState(courseId: string): {
  activated: boolean;
  deviceId: string | null;
  activatedAt: string | null;
} {
  if (typeof window === "undefined") {
    return { activated: false, deviceId: null, activatedAt: null };
  }
  
  const stored = localStorage.getItem(ACTIVATION_KEY);
  if (!stored) {
    return { activated: false, deviceId: null, activatedAt: null };
  }
  
  try {
    const state: ActivationState = JSON.parse(stored);
    const courseState = state[courseId];
    
    if (!courseState) {
      return { activated: false, deviceId: null, activatedAt: null };
    }
    
    return {
      activated: courseState.activated,
      deviceId: courseState.deviceId,
      activatedAt: courseState.activatedAt,
    };
  } catch {
    return { activated: false, deviceId: null, activatedAt: null };
  }
}

/**
 * Lưu trạng thái kích hoạt
 */
export function setActivationState(
  courseId: string,
  deviceId: string,
  activated: boolean = true
): void {
  if (typeof window === "undefined") return;
  
  const stored = localStorage.getItem(ACTIVATION_KEY);
  let state: ActivationState = stored ? JSON.parse(stored) : {};
  
  state[courseId] = {
    activated,
    deviceId,
    activatedAt: new Date().toISOString(),
  };
  
  localStorage.setItem(ACTIVATION_KEY, JSON.stringify(state));
}

/**
 * Kiểm tra đã kích hoạt chưa
 */
export function isActivated(courseId: string): boolean {
  return getActivationState(courseId).activated;
}
