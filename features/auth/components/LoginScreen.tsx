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
import { CelebrationOverlay } from "@/components/CelebrationOverlay";
const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");
const isTablet = SCREEN_WIDTH > 600;

export default function LoginScreen() {
  const router = useRouter();
  const {
    handleLogin,
    checkUserExists,
    loading,
    showPassword,
    apiMessage,
    isSuccess,
  } = useLogin();

  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); // Eye toggle state
  const onPrimaryAction = () => {
    if (!showPassword) {
      checkUserExists(userName);
    } else {
      handleLogin(userName, password);
    }
  };

  // if (!isSuccess) {
  //   return (
  //     <View style={styles.responsiveWrapper}>
  //       <View style={styles.successWrapper}>
  //         <Ionicons name="checkmark-circle" size={80} color="#10B981" />
  //         <Text style={styles.successTitle}>Login Successful!</Text>
  //         <Text style={styles.successSub}>
  //           We are redirecting you to our Homepage
  //         </Text>
  //         <ActivityIndicator
  //           size="small"
  //           color="#0077b6"
  //           style={{ marginTop: 20 }}
  //         />
  //       </View>
  //     </View>
  //   );
  // }
  console.log("success status :", isSuccess);
  return (
    <AuthContainer
      title="Login to Account"
      apiMessage={apiMessage}
      // celebration={isCelebration}
    >
      <View style={styles.responsiveWrapper}>
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

            {/* Step 1: Username Input */}
            {!showPassword && (
              <MotiView
                from={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <AppInput
                  label="Username"
                  placeholder="Enter your username"
                  value={userName}
                  onChangeText={setUserName}
                  editable={!showPassword}
                />
              </MotiView>
            )}

            {/* Step 2: Password Input (Appears after checkUserExists) */}
            {showPassword && (
              <MotiView
                from={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
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
                  <Text style={styles.forgotPasswordText}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </MotiView>
            )}

            <AppButton
              title={
                loading ? "Processing..." : showPassword ? "LOGIN" : "NEXT"
              }
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
    paddingVertical: 40,
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
