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
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { AuthContainer } from "../../../components/AuthContainer";
import { useResetPassword } from "../hooks/useResetPassword";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const isTablet = SCREEN_WIDTH > 600;

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { userName } = useLocalSearchParams<any>();
  const { resetPassword, loading, apiMessage, setApiMessage } =
    useResetPassword();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleReset = async () => {
    // Basic structural guards validating values before dispatching network payloads
    if (!password || !confirmPassword) {
      setApiMessage("All authentication fields are strictly required.");
      return;
    }

    if (password !== confirmPassword) {
      setApiMessage("Passwords do not match. Please verify.");
      return;
    }

    // Payload mapped safely to fit client requirements
    const result = await resetPassword({
      UserName: userName,
      Password: password,
      ConfirmPassword: confirmPassword,
      Code: "",
      ResetType: 3, // Provided client specific schema enum value
    });

    if (result.success) {
      setPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        router.replace("/(unauthorized)/login");
      }, 1500);
    }
  };

  // 3. Requirement: Check if reset fields are filled to unlock form completion button
  const isResetButtonDisabled =
    !password.trim() || !confirmPassword.trim() || loading;

  return (
    <AuthContainer apiMessage={apiMessage} loading={loading}>
      <View style={[styles.responsiveWrapper, loading && { opacity: 0.5 }]}>
        <MotiView
          from={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={styles.iconCircle}
        >
          <Ionicons
            name="shield-checkmark-outline"
            size={isTablet ? 55 : 40}
            color={Colors.accent}
          />
        </MotiView>

        <Text style={styles.stepSubtitle}>
          Enter your password and confirm password to reset your account
          password.
        </Text>

        <MotiView from={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
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

        <TouchableOpacity
          style={styles.footer}
          onPress={() => router.push("/(unauthorized)/login")}
          disabled={loading}
        >
          <Text style={styles.footerText}>
            Dont Need? <Text style={styles.footerLink}>Back to Login</Text>
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
    width: isTablet ? 120 : 90,
    height: isTablet ? 120 : 90,
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
