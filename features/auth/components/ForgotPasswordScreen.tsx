import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  Alert,
} from "react-native";
import { Colors } from "../../../constants/Theme";
import { AppButton } from "../../../components/AppButton";
import { AppInput } from "../../../components/AppInput";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useForgotPassword } from "../hooks/useForgotPassword";
import { MotiView } from "moti";

import { AuthContainer } from "../../../components/AuthContainer";
const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");
const isTablet = SCREEN_WIDTH > 600;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { sendResetEmail, resetPassword, loading, step, apiMessage } =
    useForgotPassword();

  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleRequest = async () => {
    if (!username) return alert("Please enter username");
    await sendResetEmail(username);
  };

  const handleReset = async () => {
    if (!code || !newPassword) return alert("Please fill all fields");
    const result = await resetPassword({
      Username: username,
      Password: newPassword,
      Code: code,
    });
    if (result.success) {
      Alert.alert("Success", "Password reset successfully!", [
        {
          text: "Login Now",
          onPress: () => router.replace("/(unauthorized)/login"),
        },
      ]);
    } else {
      alert(result.message || "Invalid code or error occurred");
    }
  };

  return (
    <AuthContainer title="Forgot Password" apiMessage={apiMessage}>
      <View style={styles.responsiveWrapper}>
        {/* Dynamic Icon Circle */}
        <MotiView
          from={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          key={step} // Re-animate when step changes
          style={styles.iconCircle}
        >
          <Ionicons
            name={
              step === "request"
                ? "mail-unread-outline"
                : "shield-checkmark-outline"
            }
            size={isTablet ? 55 : 40}
            color={Colors.accent}
          />
        </MotiView>
        <Text style={styles.stepSubtitle}>
          {step === "request"
            ? "Enter your username and we'll send a code to your registered email."
            : "Enter the code you received and choose a strong new password."}
        </Text>

        {step === "request" ? (
          <MotiView
            from={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <AppInput
              label="Username"
              placeholder="Enter your username"
              value={username}
              onChangeText={setUsername}
            />
            <AppButton
              title={loading ? "Sending..." : "SEND RESET CODE"}
              onPress={handleRequest}
              style={styles.actionBtn}
            />
          </MotiView>
        ) : (
          <MotiView from={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <AppInput
              label="Reset Code"
              placeholder="Enter 6-digit code"
              keyboardType="number-pad"
              value={code}
              onChangeText={setCode}
            />

            <View style={styles.inputWrapper}>
              <AppInput
                label="New Password"
                placeholder="******"
                secureTextEntry={!showPassword}
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color="#64748b"
                />
              </TouchableOpacity>
            </View>

            <AppButton
              title={loading ? "Resetting..." : "UPDATE PASSWORD"}
              onPress={handleReset}
              style={styles.actionBtn}
            />
          </MotiView>
        )}

        <TouchableOpacity style={styles.footer} onPress={() => router.back()}>
          <Text style={styles.footerText}>
            Remembered? <Text style={styles.footerLink}>Back to Login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </AuthContainer>
  );
}

const styles = StyleSheet.create({
  responsiveWrapper: {
    width: "100%",
    maxWidth: 500,
    paddingHorizontal: 24,
    paddingTop: 40,
  },

  // Icon Circle
  iconCircle: {
    width: isTablet ? 120 : 90,
    height: isTablet ? 120 : 90,
    borderRadius: 50,
    backgroundColor: "#f1f5f9",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },

  // Text Styling
  stepTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.accent,
    textAlign: "center",
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 15,
    color: Colors.tertiary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 30,
    paddingHorizontal: 10,
  },

  // Password Visibility Logic
  inputWrapper: {
    position: "relative",
    width: "100%",
  },
  eyeIcon: {
    position: "absolute",
    right: 15,
    top: 35,
    padding: 5,
    zIndex: 10,
  },

  actionBtn: {
    marginTop: 20,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.accent,
  },
  footer: {
    marginTop: 25,
    alignItems: "center",
  },
  footerText: {
    color: Colors.tertiary,
    fontSize: 16,
  },
  footerLink: {
    color: Colors.accent,
    fontWeight: "700",
  },
});
