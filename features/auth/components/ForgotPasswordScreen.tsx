import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Colors } from "../../../constants/Theme";
import { AppButton } from "../../../components/AppButton";
import { AppInput } from "../../../components/AppInput";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useForgotPassword } from "../hooks/useForgotPassword";
import { MotiView } from "moti";
import { AuthContainer } from "../../../components/AuthContainer";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const isTablet = SCREEN_WIDTH > 600;

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const {
    sendResetEmail,
    resetPassword,
    loading,
    step,
    apiMessage,
    setApiMessage,
  } = useForgotPassword();

  // Distinct field controllers
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRequest = async () => {
    if (!username.trim()) {
      setApiMessage("Please enter your username first.");
      return;
    }
    await sendResetEmail(username);
  };

  const handleReset = async () => {
    // Basic structural guards validating values before dispatching network payloads
    if (!code.trim() || !password || !confirmPassword) {
      setApiMessage("All authentication fields are strictly required.");
      return;
    }

    if (password !== confirmPassword) {
      setApiMessage("Passwords do not match. Please verify.");
      return;
    }

    // Payload mapped safely to fit client requirements
    const result = await resetPassword({
      UserName: username.trim(),
      Password: password,
      ConfirmPassword: confirmPassword,
      Code: code.trim(),
      ResetType: 1, // Provided client specific schema enum value
    });

    if (result.success) {
      // 4. Requirement: Empty all fields on success
      setUsername("");
      setCode("");
      setPassword("");
      setConfirmPassword("");

      // Delay navigation slightly so the user reads the success message toast in AuthContainer
      setTimeout(() => {
        router.replace("/(unauthorized)/login");
      }, 1500);
    }
  };

  // 3. Requirement: Check if reset fields are filled to unlock form completion button
  const isResetButtonDisabled =
    !code.trim() || !password.trim() || !confirmPassword.trim() || loading;

  return (
    <AuthContainer apiMessage={apiMessage} loading={loading}>
      <View style={[styles.responsiveWrapper, loading && { opacity: 0.5 }]}>
        <MotiView
          from={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          key={step}
          style={styles.iconCircle}
        >
          <Ionicons
            name={
              step === "request"
                ? "mail-unread-outline"
                : "shield-checkmark-outline"
            }
            size={isTablet ? 55 : 35}
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
              autoCapitalize="none"
            />
            <AppButton
              title={loading ? "Sending..." : "SEND RESET CODE"}
              onPress={handleRequest}
              disabled={loading || !username.trim()}
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

            {/* Separated Password Field */}
            <View style={styles.inputWrapper}>
              <AppInput
                label="New Password"
                placeholder="******"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
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

            {/* Separated Confirm Password Field */}
            <View style={styles.inputWrapper}>
              <AppInput
                label="Confirm Password"
                placeholder="******"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off" : "eye"}
                  size={20}
                  color="#64748b"
                />
              </TouchableOpacity>
            </View>

            <AppButton
              title={loading ? "Resetting..." : "UPDATE PASSWORD"}
              onPress={handleReset}
              disabled={isResetButtonDisabled}
              style={[
                styles.actionBtn,
                isResetButtonDisabled && { opacity: 0.6 },
              ]}
            />
          </MotiView>
        )}

        <TouchableOpacity
          style={styles.footer}
          onPress={() => router.push("/(unauthorized)/login")}
          disabled={loading}
        >
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
    paddingTop: 20,
  },
  iconCircle: {
    width: isTablet ? 120 : 80,
    height: isTablet ? 120 : 80,
    borderRadius: 60,
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
  stepSubtitle: {
    fontSize: 15,
    color: Colors.tertiary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
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
    paddingBottom: 20,
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
