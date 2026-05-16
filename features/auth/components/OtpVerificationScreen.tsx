import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { Colors } from "../../../constants/Theme";
import { AppButton } from "../../../components/AppButton";
import { AppInput } from "../../../components/AppInput";
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useOtp } from "../hooks/useOtp";
import { AuthContainer } from "@/components/AuthContainer";
import { CelebrationOverlay } from "@/components/CelebrationOverlay";
const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");
const isTablet = SCREEN_WIDTH > 600;

export default function OtpVerificationScreen() {
  const router = useRouter();
  const { phoneNumber, userName, message } = useLocalSearchParams<{
    phoneNumber: string;
    userName: string;
    message: string;
  }>();
  const { verifyOtp, resendOtp, loading, apiMessage, isSuccess } = useOtp();

  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(30);

  // Logic: Professional Countdown Timer
  useEffect(() => {
    let interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleVerify = async () => {
    // We pass both; the API and Hook will prioritize whichever is available
    await verifyOtp(otp, phoneNumber, userName);
  };

  const handleResend = async () => {
    if (!userName) return alert("Username missing");
    const result = await resendOtp(userName);
    if (result.success) setTimer(30);
  };

  return (
    <AuthContainer
      title="OTP Verification"
      apiMessage={apiMessage}
      celebration={isSuccess}
    >
      <View style={styles.responsiveWrapper}>
        <View style={styles.iconCircle}>
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={isTablet ? 55 : 40}
            color={Colors.accent}
          />
        </View>
        <Text style={styles.instructionText}>{message || "Verify Otp"}</Text>

        {/* OTP Input */}
        <AppInput
          label="Verification Code"
          placeholder="- - - - - -"
          keyboardType="number-pad"
          maxLength={6}
          value={otp}
          onChangeText={setOtp}
          style={styles.otpInput}
        />

        <AppButton
          title={loading ? "VERIFYING..." : "VERIFY & PROCEED"}
          onPress={handleVerify}
          style={styles.verifyBtn}
          disabled={otp.length < 4}
        />

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive the code? </Text>
          {timer > 0 ? (
            <View style={styles.timerBadge}>
              <Text style={styles.timerText}>Resend in {timer}s</Text>
            </View>
          ) : (
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendLink}>Resend Code</Text>
            </TouchableOpacity>
          )}
        </View>
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
  },

  instructionText: {
    textAlign: "center",
    color: Colors.tertiary,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 35,
  },
  phoneNumberText: {
    color: Colors.accent,
    fontWeight: "700",
  },

  // OTP Input Specifics
  otpInput: {
    textAlign: "center",
    fontSize: 28,
    letterSpacing: 8,
    fontWeight: "700",
    color: "#0077b6",
    height: 65,
  },

  // Resend Logic
  resendContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
    marginBottom: 30,
  },
  resendText: { color: "#64748b", fontSize: 15 },
  timerBadge: {
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timerText: { color: Colors.accent, fontWeight: "700", fontSize: 13 },
  resendLink: {
    color: Colors.accent,
    fontWeight: "800",
    textDecorationLine: "underline",
  },

  verifyBtn: {
    width: "100%",
    borderRadius: 30,
    height: 60,
    backgroundColor: Colors.accent,
    marginTop: 20,
  },
  changeNumber: {
    marginTop: 25,
    alignItems: "center",
  },
});
