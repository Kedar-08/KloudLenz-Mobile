import { MaterialIcons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet } from "react-native";

export default function DashboardLayout() {
  const router = useRouter();

  const handleLogout = () => {
    // Navigate to login screen and reset the navigation stack
    router.replace("/(auth)/login");
  };

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
          headerBackVisible: false,
          headerRight: () => (
            <Pressable onPress={handleLogout} style={styles.logoutButton}>
              <MaterialIcons name="logout" size={24} color="#c41230" />
            </Pressable>
          ),
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

const styles = StyleSheet.create({
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
});
