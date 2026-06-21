// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Dimensions,
//   Platform,
// } from "react-native";
// import { Colors } from "../../../constants/Theme";
// import { AppButton } from "../../../components/AppButton";
// import { AppInput } from "../../../components/AppInput";
// import { useRouter, Stack, useLocalSearchParams } from "expo-router";
// import { Ionicons } from "@expo/vector-icons";
// import { useOtp } from "../hooks/useOtp";
// import { AuthContainer } from "@/components/AuthContainer";
// import { CelebrationOverlay } from "@/components/CelebrationOverlay";
// const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");
// const isTablet = SCREEN_WIDTH > 600;

// export default function OtpVerificationScreen() {
//   const router = useRouter();
//   const { phoneNumber, userName, message } = useLocalSearchParams<{
//     phoneNumber: string;
//     userName: string;
//     message: string;
//   }>();
//   const { verifyOtp, resendOtp, loading, apiMessage, isSuccess, resetLoading } =
//     useOtp();
//   const [fieldError, setFieldError] = useState("");
//   const [otp, setOtp] = useState("");
//   const [timer, setTimer] = useState(30);

//   // Logic: Professional Countdown Timer
//   useEffect(() => {
//     let interval = setInterval(() => {
//       setTimer((prev) => (prev > 0 ? prev - 1 : 0));
//     }, 1000);
//     return () => clearInterval(interval);
//   }, []);

//   const handleVerify = async () => {
//     if (!otp) {
//       setFieldError("Please enter the OTP");
//       return;
//     }
//     if (otp.length < 6) {
//       setFieldError("Please enter a valid 6-digit OTP");
//       return;
//     }
//     await verifyOtp(otp, phoneNumber, userName);
//   };

//   const handleResend = async () => {
//     setFieldError("");
//     setOtp("");
//     if (!userName) return alert("Username missing");
//     const result = await resendOtp(userName);
//     if (result.success) setTimer(30);
//   };

//   return (
//     <AuthContainer
//       title="OTP Verification"
//       apiMessage={apiMessage}
//       celebration={isSuccess}
//     >
//       <View style={styles.responsiveWrapper}>
//         <View style={styles.iconCircle}>
//           <Ionicons
//             name="chatbubble-ellipses-outline"
//             size={isTablet ? 55 : 40}
//             color={Colors.accent}
//           />
//         </View>
//         <Text style={styles.instructionText}>{message || "Verify Otp"}</Text>

//         {/* OTP Input */}
//         <AppInput
//           label="Verification Code"
//           placeholder="- - - - - -"
//           keyboardType="number-pad"
//           maxLength={6}
//           value={otp}
//           onChangeText={setOtp}
//           style={styles.otpInput}
//           error={fieldError}
//         />

//         <AppButton
//           title={
//             loading
//               ? "VERIFYING..."
//               : resetLoading
//                 ? "SENDING..."
//                 : "VERIFY & PROCEED"
//           }
//           onPress={handleVerify}
//           style={styles.verifyBtn}
//           disabled={otp.length < 6 || loading || resetLoading}
//         />

//         <View style={styles.resendContainer}>
//           <Text style={styles.resendText}>Didn't receive the code? </Text>
//           {timer > 0 ? (
//             <View style={styles.timerBadge}>
//               <Text style={styles.timerText}>Resend in {timer}s</Text>
//             </View>
//           ) : (
//             <TouchableOpacity onPress={handleResend}>
//               <Text style={styles.resendLink}>Resend Code</Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       </View>
//     </AuthContainer>
//   );
// }

// const styles = StyleSheet.create({
//   responsiveWrapper: {
//     width: "100%",
//     maxWidth: 500,
//     paddingHorizontal: 24,
//     paddingTop: 40,
//   },

//   // Icon Circle
//   iconCircle: {
//     width: isTablet ? 120 : 90,
//     height: isTablet ? 120 : 90,
//     borderRadius: 50,
//     backgroundColor: "#f1f5f9",
//     alignSelf: "center",
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 20,
//   },

//   instructionText: {
//     textAlign: "center",
//     color: Colors.tertiary,
//     fontSize: 16,
//     lineHeight: 24,
//     marginBottom: 35,
//   },
//   phoneNumberText: {
//     color: Colors.accent,
//     fontWeight: "700",
//   },

//   // OTP Input Specifics
//   otpInput: {
//     textAlign: "center",
//     fontSize: 28,
//     letterSpacing: 8,
//     fontWeight: "700",
//     color: "#0077b6",
//     height: 65,
//   },

//   // Resend Logic
//   resendContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     marginTop: 15,
//     marginBottom: 30,
//   },
//   resendText: { color: "#64748b", fontSize: 15 },
//   timerBadge: {
//     backgroundColor: "#e0f2fe",
//     paddingHorizontal: 10,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   timerText: { color: Colors.accent, fontWeight: "700", fontSize: 13 },
//   resendLink: {
//     color: Colors.accent,
//     fontWeight: "800",
//     textDecorationLine: "underline",
//   },

//   verifyBtn: {
//     width: "100%",
//     borderRadius: 30,
//     height: 60,
//     backgroundColor: Colors.accent,
//     marginTop: 20,
//   },
//   changeNumber: {
//     marginTop: 25,
//     alignItems: "center",
//   },
// });

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Colors } from "../../../constants/Theme";
import { AppButton } from "../../../components/AppButton";
import { AppInput } from "../../../components/AppInput";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useOtp } from "../hooks/useOtp";
import { AuthContainer } from "@/components/AuthContainer";
import * as SecureStore from "expo-secure-store";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const isTablet = SCREEN_WIDTH > 600;

export default function OtpVerificationScreen() {
  const router = useRouter();
  const { phoneNumber, userName, message, fromLogin } = useLocalSearchParams<{
    phoneNumber: string;
    userName: string;
    message: string;
    fromLogin: string;
  }>();

  const {
    verifyOtp,
    resendOtp,
    loading,
    apiMessage,
    isSuccess,
    isCelebration,
    resetLoading,
  } = useOtp();
  const [fieldError, setFieldError] = useState("");
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(30);
  const hasAutoSent = useRef(false);

  // 1. Contextual Verification Auto-Trigger Engine
  useEffect(() => {
    if (fromLogin === "true" && userName && !hasAutoSent.current) {
      hasAutoSent.current = true;
      resendOtp(userName);
    }
  }, [fromLogin, userName]);

  // CountDown Baseline
  useEffect(() => {
    let interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleVerify = async () => {
    if (!otp || otp.length < 6) {
      setFieldError("Please enter a valid 6-digit OTP");
      return;
    }
    const res = await verifyOtp(otp, phoneNumber, userName);
    if (res?.success) {
      // Set transactional verification welcome state
      await SecureStore.setItemAsync("SHOW_WELCOME_MODAL", "true");
    }
  };

  const handleResend = async () => {
    setFieldError("");
    setOtp("");
    if (!userName) return;
    const result = await resendOtp(userName);
    if (result.success) setTimer(30);
  };

  return (
    <AuthContainer
      title="OTP Verification"
      apiMessage={apiMessage}
      celebration={isCelebration}
    >
      <View style={styles.responsiveWrapper}>
        {/* Success Announcement UI Overlay Wrapper */}
        {isSuccess ? (
          <View style={styles.successWrapper}>
            <Ionicons name="checkmark-circle" size={80} color="#10B981" />
            <Text style={styles.successTitle}>Verification Successful!</Text>
            <Text style={styles.successSub}>
              Securing your profile and setting up your workspace...
            </Text>
            <ActivityIndicator
              size="small"
              color="#0077b6"
              style={{ marginTop: 20 }}
            />
          </View>
        ) : (
          <>
            <View style={styles.iconCircle}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={isTablet ? 55 : 40}
                color={Colors.accent}
              />
            </View>
            <Text style={styles.instructionText}>
              {fromLogin === "true"
                ? "We've sent a fresh confirmation code to your device."
                : message || "Verify OTP"}
            </Text>

            <AppInput
              label="Verification Code"
              placeholder="- - - - - -"
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={setOtp}
              style={styles.otpInput}
              error={fieldError}
            />

            <AppButton
              title={
                loading
                  ? "VERIFYING..."
                  : resetLoading
                    ? "SENDING..."
                    : "VERIFY & PROCEED"
              }
              onPress={handleVerify}
              style={styles.verifyBtn}
              disabled={otp.length < 6 || loading || resetLoading}
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
          </>
        )}
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
  iconCircle: {
    width: isTablet ? 120 : 90,
    height: isTablet ? 120 : 90,
    borderRadius: 60,
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
  otpInput: {
    textAlign: "center",
    fontSize: 28,
    letterSpacing: 8,
    fontWeight: "700",
    color: "#0077b6",
    height: 65,
  },
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
});
