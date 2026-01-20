import { Platform } from "react-native";

/**
 * FCM Token Manager
 * Manages FCM token storage and registration with backend
 *
 * Flow:
 * 1. Token generated on app startup
 * 2. Stored temporarily in memory
 * 3. Sent to backend after login (when userId is available)
 * 4. Re-registered if token refreshes while user is logged in
 */

let fcmToken: string | null = null;
let currentUserId: string | null = null;

/**
 * Get device type based on platform
 * @returns "ANDROID" | "IOS"
 */
export const getDeviceType = (): "ANDROID" | "IOS" => {
  return Platform.OS === "ios" ? "IOS" : "ANDROID";
};

/**
 * Store FCM token in memory
 */
export const storeFCMToken = (token: string): void => {
  fcmToken = token;
  console.log(
    "💾 FCM Token stored temporarily:",
    token.substring(0, 50) + "...",
  );
};

/**
 * Get stored FCM token
 */
export const getStoredFCMToken = (): string | null => {
  return fcmToken;
};

/**
 * Set current logged-in user ID
 */
export const setUserId = (userId: string): void => {
  currentUserId = userId;
  console.log("👤 User ID set:", userId);
};

/**
 * Get current user ID
 */
export const getUserId = (): string | null => {
  return currentUserId;
};

/**
 * Clear user session (call on logout)
 */
export const clearUserSession = (): void => {
  currentUserId = null;
  console.log("🔓 User session cleared");
};

/**
 * Check if we have both token and userId ready for registration
 */
export const isReadyForRegistration = (): boolean => {
  return fcmToken !== null && currentUserId !== null;
};

/**
 * Get registration payload for backend
 */
export const getRegistrationPayload = (): {
  userId: string;
  token: string;
  deviceType: "ANDROID" | "IOS";
} | null => {
  if (!isReadyForRegistration()) {
    return null;
  }

  return {
    userId: currentUserId!,
    token: fcmToken!,
    deviceType: getDeviceType(),
  };
};
