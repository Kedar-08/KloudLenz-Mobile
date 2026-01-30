import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

export default function WelcomeScreen() {
  const router = useRouter();

  useEffect(() => {
    // Navigate to dashboard after 1.5 seconds
    const timer = setTimeout(() => {
      router.replace("/(dashboard)");
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome to</Text>
      <Image
        source={require("../../assets/images/kloudlenz_white_logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.subtitleText}>Approvals Management</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "400",
    color: "#333",
    marginBottom: 16,
  },
  logo: {
    width: 250,
    height: 80,
    marginVertical: 12,
  },
  subtitleText: {
    fontSize: 20,
    fontWeight: "500",
    color: "#333",
    marginTop: 16,
  },
});
