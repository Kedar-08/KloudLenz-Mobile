import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as Yup from "yup";
import {
  getStoredFCMToken,
  isReadyForRegistration,
  setUserId,
} from "../../services/fcmTokenManager";
import { mockApi } from "../../services/mockApi";

export default function LoginScreen() {
  const router = useRouter();
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  // loading state for submission
  const [isLoading, setIsLoading] = useState(false);
  // Formik will hold email/password values

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid email")
      .required("Enterprise email is required"),
    password: Yup.string().required("Password is required"),
  });

  // Note: submission is handled by Formik's onSubmit below

  return (
    <View style={styles.container}>
      <View style={styles.loginBox}>
        <Image
          source={require("../../assets/images/kloudlenz_white_logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.subtitle}>Approval Management</Text>

        <View style={styles.form}>
          <Formik
            initialValues={{ email: "", password: "" }}
            validationSchema={validationSchema}
            onSubmit={async (values: any, { setSubmitting }: any) => {
              setIsLoading(true);
              try {
                await mockApi.login(values.email, values.password);

                // Use email as user ID for FCM token registration
                setUserId(values.email);

                // Register FCM token if available
                const storedToken = getStoredFCMToken();
                if (storedToken && isReadyForRegistration()) {
                  try {
                    console.log("📱 Registering device token with backend...");
                    await mockApi.registerDeviceToken(
                      values.email,
                      storedToken,
                    );
                    console.log("✅ Device token registered successfully");
                  } catch (tokenError) {
                    console.warn(
                      "⚠️ Failed to register device token:",
                      tokenError,
                    );
                    // Don't block login if token registration fails
                  }
                }

                // Navigate to dashboard
                router.push("/(dashboard)");
              } catch (err) {
                Alert.alert("Login Failed", "Invalid credentials");
                console.error("Login error:", err);
              } finally {
                setIsLoading(false);
                setSubmitting(false);
              }
            }}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              isValid,
              dirty,
            }: any) => (
              <>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Enterprise email</Text>
                  <View
                    style={[
                      styles.inputRow,
                      emailFocused && styles.inputFocused,
                    ]}
                  >
                    <MaterialIcons
                      name="mail-outline"
                      size={20}
                      color="#666"
                      style={styles.icon}
                    />
                    <TextInput
                      style={styles.inputWithIcon}
                      placeholder="Enter your enterprise email"
                      value={values.email}
                      onChangeText={handleChange("email")}
                      editable={!isLoading}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => {
                        handleBlur("email");
                        setEmailFocused(false);
                      }}
                    />
                  </View>
                  {touched.email && errors.email ? (
                    <Text style={styles.errorText}>{errors.email}</Text>
                  ) : null}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Password</Text>
                  <View
                    style={[
                      styles.inputRow,
                      passwordFocused && styles.inputFocused,
                    ]}
                  >
                    <MaterialIcons
                      name="lock-outline"
                      size={20}
                      color="#666"
                      style={styles.icon}
                    />
                    <TextInput
                      style={styles.inputWithIcon}
                      placeholder="Enter your password"
                      value={values.password}
                      onChangeText={handleChange("password")}
                      editable={!isLoading}
                      secureTextEntry={true}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => {
                        handleBlur("password");
                        setPasswordFocused(false);
                      }}
                    />
                  </View>
                  {touched.password && errors.password ? (
                    <Text style={styles.errorText}>{errors.password}</Text>
                  ) : null}
                  <View style={styles.forgotContainer}>
                    <TouchableOpacity onPress={() => {}} disabled={true}>
                      <Text style={styles.forgotText}>Forgot password?</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.button,
                    (isLoading || !isValid || !dirty) && styles.buttonDisabled,
                  ]}
                  onPress={handleSubmit as any}
                  disabled={isLoading || !isValid || !dirty}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Login</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </Formik>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loginBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 30,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1976d2",
    textAlign: "center",
    marginBottom: 8,
  },
  logo: {
    width: 180,
    height: 40,
    alignSelf: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#c41230",
  },
  input: {
    borderWidth: 1,
    borderColor: "#c41230",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: "#333",
    backgroundColor: "#f9f9f9",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#c41230",
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: "#f9f9f9",
  },
  icon: {
    marginHorizontal: 6,
  },
  inputWithIcon: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 6,
    fontSize: 14,
    color: "#333",
  },
  inputFocused: {
    borderWidth: 2,
    borderColor: "#c41230",
  },
  button: {
    backgroundColor: "#c41230",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  hint: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
  },
  forgotContainer: {
    alignItems: "flex-end",
    marginTop: 8,
  },
  forgotText: {
    fontSize: 12,
    color: "#c41230",
    fontWeight: "600",
  },
  errorText: {
    color: "#d32f2f",
    fontSize: 12,
    marginTop: 6,
  },
});
