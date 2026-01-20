import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { storeFCMToken } from "../services/fcmTokenManager";
import { generateFCMToken } from "../services/fcmTokenService";

export default function RootLayout() {
  // Generate FCM token on app startup and store temporarily
  useEffect(() => {
    const initializeFCMToken = async () => {
      try {
        console.log("🚀 App started - Initializing FCM token...");
        const fcmResult = await generateFCMToken();

        if (fcmResult.success && fcmResult.token) {
          console.log("✅ FCM Token generated on app startup:");
          console.log("📋 Token:", fcmResult.token);

          // Store token in memory (will be sent to backend after login)
          storeFCMToken(fcmResult.token);
          console.log("⏳ Token will be registered after user login");
        } else {
          console.warn("⚠️ FCM Token generation failed:", fcmResult.error);
        }
      } catch (error) {
        console.error("❌ Error during FCM token initialization:", error);
      }
    };

    // Call token generation without blocking rendering
    initializeFCMToken();
  }, []); // Empty dependency array - runs only once on mount

  return (
    <>
      <StatusBar />
      <Stack
        screenOptions={{
          headerShown: true,
          headerTintColor: "#c41230",
          headerTitleStyle: {
            fontWeight: "600",
            color: "#c41230",
          },
        }}
      >
        <Stack.Screen
          name="(auth)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="(dashboard)"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
}
