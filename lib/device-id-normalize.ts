/**
 * Device ID Normalization
 * Chuẩn hóa Device ID để đảm bảo consistency giữa generate và verify
 */

/**
 * Normalize Device ID to canonical format
 * - Nếu là UUID đầy đủ → lấy 8 ký tự đầu, uppercase
 * - Nếu đã là short format → uppercase
 * - Trim whitespace
 */
export function normalizeDeviceId(deviceId: string): string {
  if (!deviceId) return "";
  
  // Trim và uppercase
  let normalized = deviceId.trim().toUpperCase();
  
  // Nếu là UUID format (có dấu gạch ngang) → lấy 8 ký tự đầu
  if (normalized.includes("-")) {
    normalized = normalized.replace(/-/g, "").substring(0, 8);
  } else {
    // Nếu không phải UUID, lấy 8 ký tự đầu
    normalized = normalized.substring(0, 8);
  }
  
  return normalized;
}

/**
 * Normalize Activation Key
 * - Trim whitespace
 * - Uppercase
 */
export function normalizeActivationKey(key: string): string {
  if (!key) return "";
  return key.trim().toUpperCase();
}
