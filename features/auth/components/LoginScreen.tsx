import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  ActivityIndicator,
} from "react-native";
import { Colors } from "@/constants/Theme";
import { AppButton } from "@/components/AppButton";
import { AppInput } from "@/components/AppInput";
import { useRouter, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useLogin } from "../hooks/useLogin";
import { MotiView } from "moti";
import { AuthContainer } from "../../../components/AuthContainer";
import { RestoreAccountModal } from "./RestoreAccountModal";
const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");
const isTablet = SCREEN_WIDTH > 600;

export default function LoginScreen() {
  const router = useRouter();
  const {
    handleLogin,
    loading,
    apiMessage,
    isSuccess,
    showDeletionModal,
    setShowDeletionModal,
    pendingDeletionData,
  } = useLogin();

  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); // Eye toggle state
  const onPrimaryAction = () => {
    console.log("fuck is clicked");
    handleLogin(userName, password);
  };
  return (
    <AuthContainer apiMessage={apiMessage} loading={loading}>
      <RestoreAccountModal
        visible={showDeletionModal}
        scheduledPurgeDate={pendingDeletionData?.ScheduledPurgeOn}
        onCreateNew={() => {
          setShowDeletionModal(false);
          router.push("/(unauthorized)/register");
        }}
        onRestore={() => {
          setShowDeletionModal(false);
          router.push({
            pathname: "/(unauthorized)/restore-profile",
            params: {
              userName: pendingDeletionData?.OriginalUserName,
              token: pendingDeletionData?.AccessToken,
              flowType: "restoration",
            },
          });
        }}
      />
      <View style={[styles.responsiveWrapper, loading && { opacity: 0.5 }]}>
        {isSuccess ? (
          <View style={styles.successWrapper}>
            <Ionicons name="checkmark-circle" size={80} color="#10B981" />
            <Text style={styles.successTitle}>Login Successful!</Text>
            <Text style={styles.successSub}>
              We are redirecting you to our Homepage
            </Text>
            <ActivityIndicator
              size="small"
              color="#0077b6"
              style={{ marginTop: 20 }}
            />
          </View>
        ) : (
          <>
            <MotiView
              from={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "timing", duration: 800 }}
              style={styles.logoContainer}
            >
              <Image
                source={require("../../../assets/images/gemini-logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </MotiView>
            <MotiView
              from={{ opacity: 0, translateX: 20 }}
              animate={{ opacity: 1, translateX: 0 }}
            >
              <AppInput
                label="UserName"
                placeholder="Enter UserName"
                value={userName}
                onChangeText={setUserName}
              />
              <View style={styles.inputWrapper}>
                <AppInput
                  label="Password"
                  placeholder="********"
                  secureTextEntry={!isPasswordVisible}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                >
                  <Ionicons
                    name={isPasswordVisible ? "eye-off" : "eye"}
                    size={20}
                    color="#64748b"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => router.push("/(unauthorized)/forgot-password")}
                style={styles.forgotPasswordContainer}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </MotiView>
            <AppButton
              title={loading ? "Processing..." : "LOGIN"}
              disabled={loading || !userName || !password}
              onPress={onPrimaryAction}
              style={styles.loginBtn}
            />

            <View style={styles.footer}>
              <TouchableOpacity
                onPress={() => router.push("/(unauthorized)/register")}
              >
                <Text style={styles.footerText}>
                  New here?{" "}
                  <Text style={styles.footerLink}>Create Account</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </AuthContainer>
  );
}

const styles = StyleSheet.create({
  responsiveWrapper: {
    width: "100%",
    maxWidth: 500, // Tablet optimization
    paddingHorizontal: 24,
    paddingTop: 30,
  },

  successWrapper: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1E293B",
    marginTop: 15,
    textAlign: "center",
  },
  successSub: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 20,
  },

  // Logo Styles
  logoContainer: {
    marginBottom: 40,
    backgroundColor: Colors.white,
    padding: 10,
    borderRadius: 50,
    width: isTablet ? 120 : 90,
    height: isTablet ? 120 : 90,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  logo: {
    width: "100%",
    height: "100%",
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

  loginBtn: {
    marginTop: 20,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.accent,
    shadowColor: "#00b4d8",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },

  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginTop: -5,
    marginBottom: 20,
    paddingRight: 5,
  },
  forgotPasswordText: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: "700",
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
