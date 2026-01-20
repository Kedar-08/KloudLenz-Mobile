import { Stack } from "expo-router";
import React from "react";

export default function DashboardLayout() {
  return (
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
        name="index"
        options={{
          title: "Approvals",
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          title: "Approval Details",
        }}
      />
    </Stack>
  );
}
