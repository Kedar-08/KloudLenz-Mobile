import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

/**
 * FCM Token Service
 * Generates Firebase Cloud Messaging (FCM) device token on Android
 *
 * Requirements:
 * - Must run on physical Android device (not emulator/Expo Go)
 * - Notification permissions must be granted
 * - google-services.json must be configured in app.json
 */

export interface FCMTokenResult {
  success: boolean;
  token?: string;
  error?: string;
}

/**
 * Check if the app is running on a real physical device
 */
const isPhysicalDevice = (): boolean => {
  return Device.isDevice;
};

/**
 * Check if running in Expo Go (not a standalone build)
 * Properly detects Expo Go vs EAS development builds
 */
const isExpoGo = (): boolean => {
  // Check if running in Expo Go client
  // EAS development builds will have executionEnvironment as 'standalone' or 'storeClient' but with appOwnership as 'expo'
  // Expo Go has appOwnership as 'expo' and executionEnvironment as 'storeClient'
  const appOwnership = Constants.appOwnership;
  const executionEnvironment = Constants.executionEnvironment;

  // If appOwnership is null, it's a standalone build (EAS build)
  // If appOwnership is 'expo', it's Expo Go
  return appOwnership === "expo" && executionEnvironment === "storeClient";
};

/**
 * Request notification permissions
 * @returns {Promise<boolean>} true if granted, false otherwise
 */
const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // If permission not already granted, ask user
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.error("❌ Notification permission denied by user");
      return false;
    }

    return true;
  } catch (error) {
    console.error("❌ Error requesting notification permissions:", error);
    return false;
  }
};

/**
 * Generate FCM device token for Android
 *
 * @returns {Promise<FCMTokenResult>} Object containing success status, token, or error
 *
 * @example
 * ```typescript
 * const result = await generateFCMToken();
 * if (result.success) {
 *   console.log("FCM Token:", result.token);
 *   // Send token to your backend
 * } else {
 *   console.error("Error:", result.error);
 * }
 * ```
 */
export const generateFCMToken = async (): Promise<FCMTokenResult> => {
  try {
    // Step 1: Check platform
    if (Platform.OS !== "android") {
      return {
        success: false,
        error: "FCM token generation is only supported on Android",
      };
    }

    // Step 2: Check if running on physical device
    if (!isPhysicalDevice()) {
      return {
        success: false,
        error:
          "FCM token can only be generated on a physical Android device (not emulator)",
      };
    }

    // Step 3: Check if running in Expo Go
    if (isExpoGo()) {
      return {
        success: false,
        error:
          "FCM token requires a standalone build (not Expo Go). Use EAS Build.",
      };
    }

    // Step 4: Request notification permissions
    console.log("📱 Requesting notification permissions...");
    const hasPermission = await requestNotificationPermissions();

    if (!hasPermission) {
      return {
        success: false,
        error:
          "Notification permissions denied. Please enable notifications in device settings.",
      };
    }

    // Step 5: Get FCM device token
    console.log("🔑 Generating FCM token...");
    const tokenData = await Notifications.getDevicePushTokenAsync();

    // On Android, tokenData.data contains the FCM token
    const fcmToken = tokenData.data;

    if (!fcmToken) {
      return {
        success: false,
        error: "Failed to retrieve FCM token from device",
      };
    }

    console.log("✅ FCM Token generated successfully");
    console.log("📋 Token:", fcmToken);

    return {
      success: true,
      token: fcmToken,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Error generating FCM token:", errorMessage);

    return {
      success: false,
      error: `Failed to generate FCM token: ${errorMessage}`,
    };
  }
};

/**
 * Configure notification handler (optional, but recommended)
 * Call this once when app starts
 */
export const setupNotificationHandler = () => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
};

/**
 * Get current notification permissions status
 */
export const getNotificationPermissionStatus = async (): Promise<string> => {
  const { status } = await Notifications.getPermissionsAsync();
  return status;
};
