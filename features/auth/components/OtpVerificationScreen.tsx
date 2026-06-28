// import React, { useState, useEffect, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Dimensions,
//   ActivityIndicator,
// } from "react-native";
// import { Colors } from "../../../constants/Theme";
// import { AppButton } from "../../../components/AppButton";
// import { AppInput } from "../../../components/AppInput";
// import { useRouter, useLocalSearchParams } from "expo-router";
// import { Ionicons } from "@expo/vector-icons";
// import { useOtp } from "../hooks/useOtp";
// import { AuthContainer } from "@/components/AuthContainer";
// import * as SecureStore from "expo-secure-store";

// const { width: SCREEN_WIDTH } = Dimensions.get("window");
// const isTablet = SCREEN_WIDTH > 600;

// export default function OtpVerificationScreen() {

//   const {
//     phoneNumber,
//     userName,
//     message,
//     fromLogin,
//     isRestorationFlow,
//     restorationToken,
//     phoneCode,
//   } = useLocalSearchParams<any>();

//   const {
//     verifyOtp,
//     resendOtp,
//     loading,
//     apiMessage,
//     globalOtpSuccess,
//     isCelebration,
//     resetLoading,
//   } = useOtp();
//   const [fieldError, setFieldError] = useState("");
//   const [otp, setOtp] = useState("");
//   const [timer, setTimer] = useState(30);
//   const hasAutoSent = useRef(false);
//   useEffect(() => {
//     if (fromLogin === "true" && userName && !hasAutoSent.current) {
//       hasAutoSent.current = true;
//       resendOtp(userName);
//     }
//   }, [fromLogin, userName]);

//   // CountDown Baseline
//   useEffect(() => {
//     let interval = setInterval(() => {
//       setTimer((prev) => (prev > 0 ? prev - 1 : 0));
//     }, 1000);
//     return () => clearInterval(interval);
//   }, []);

//   const handleVerify = async () => {
//     setFieldError("");
//     if (!otp || otp.length < 6) {
//       setFieldError("Please enter a valid 6-digit OTP");
//       return;
//     }

//     const parsedCode = phoneCode ? parseInt(phoneCode, 10) : 92;
//     const res = await verifyOtp(
//       otp,
//       phoneNumber,
//       userName,
//       parsedCode,
//       isRestorationFlow,
//       restorationToken,
//     );

//     if (res?.success) {
//       await SecureStore.setItemAsync("SHOW_WELCOME_MODAL", "true");
//     }
//   };

//   const handleResend = async () => {
//     setFieldError("");
//     setOtp("");
//     if (!userName) return;
//     const result = await resendOtp(userName);
//     if (result.success) setTimer(30);
//   };

//   return (
//     <AuthContainer
//       title="OTP Verification"
//       apiMessage={apiMessage}
//       celebration={isCelebration}
//     >
//       <View style={styles.responsiveWrapper}>
//         {/* Success Announcement UI Overlay Wrapper */}
//         {globalOtpSuccess ? (
//           <View style={styles.successWrapper}>
//             <Ionicons name="checkmark-circle" size={80} color="#10B981" />
//             <Text style={styles.successTitle}>Verification Successful!</Text>
//             <Text style={styles.successSub}>
//               Securing your profile and setting up your workspace...
//             </Text>
//             <ActivityIndicator
//               size="small"
//               color="#0077b6"
//               style={{ marginTop: 20 }}
//             />
//           </View>
//         ) : (
//           <>
//             <View style={styles.iconCircle}>
//               <Ionicons
//                 name="chatbubble-ellipses-outline"
//                 size={isTablet ? 55 : 40}
//                 color={Colors.accent}
//               />
//             </View>
//             <Text style={styles.instructionText}>
//               {fromLogin === "true"
//                 ? "We've sent a fresh confirmation code to your device."
//                 : message || "Verify OTP"}
//             </Text>

//             <AppInput
//               label="Verification Code"
//               placeholder="- - - - - -"
//               keyboardType="number-pad"
//               maxLength={6}
//               value={otp}
//               onChangeText={setOtp}
//               style={styles.otpInput}
//               error={fieldError}
//             />

//             <AppButton
//               title={
//                 loading
//                   ? "VERIFYING..."
//                   : resetLoading
//                     ? "SENDING..."
//                     : "VERIFY & PROCEED"
//               }
//               onPress={handleVerify}
//               style={styles.verifyBtn}
//               disabled={otp.length < 6 || loading || resetLoading}
//             />

//             <View style={styles.resendContainer}>
//               <Text style={styles.resendText}>Didn't receive the code? </Text>
//               {timer > 0 ? (
//                 <View style={styles.timerBadge}>
//                   <Text style={styles.timerText}>Resend in {timer}s</Text>
//                 </View>
//               ) : (
//                 <TouchableOpacity onPress={handleResend}>
//                   <Text style={styles.resendLink}>Resend Code</Text>
//                 </TouchableOpacity>
//               )}
//             </View>
//           </>
//         )}
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
//   successWrapper: {
//     alignItems: "center",
//     justifyContent: "center",
//     paddingVertical: 40,
//   },
//   successTitle: {
//     fontSize: 22,
//     fontWeight: "800",
//     color: "#1E293B",
//     marginTop: 15,
//     textAlign: "center",
//   },
//   successSub: {
//     fontSize: 14,
//     color: "#64748B",
//     textAlign: "center",
//     marginTop: 8,
//     paddingHorizontal: 20,
//   },
//   iconCircle: {
//     width: isTablet ? 120 : 90,
//     height: isTablet ? 120 : 90,
//     borderRadius: 60,
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
//   otpInput: {
//     textAlign: "center",
//     fontSize: 28,
//     letterSpacing: 8,
//     fontWeight: "700",
//     color: "#0077b6",
//     height: 65,
//   },
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
  const {
    phoneNumber,
    userName,
    message,
    fromLogin,
    isRestorationFlow,
    restorationToken,
    phoneCode,
  } = useLocalSearchParams<any>();

  const {
    verifyOtp,
    resendOtp,
    loading,
    apiMessage,
    globalOtpSuccess,
    isCelebration,
    resetLoading,
    restorationStatus,
  } = useOtp();

  const [fieldError, setFieldError] = useState("");
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(30);
  const hasAutoSent = useRef(false);

  useEffect(() => {
    if (fromLogin === "true" && userName && !hasAutoSent.current) {
      hasAutoSent.current = true;
      resendOtp(userName);
    }
  }, [fromLogin, userName]);

  // CountDown Baseline
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleVerify = async () => {
    setFieldError("");
    if (!otp || otp.length < 6) {
      setFieldError("Please enter a valid 6-digit OTP");
      return;
    }

    const parsedCode = phoneCode ? parseInt(phoneCode, 10) : 92;
    const res = await verifyOtp(
      otp,
      phoneNumber,
      userName,
      parsedCode,
      isRestorationFlow,
      restorationToken,
    );

    if (res?.success) {
      await SecureStore.setItemAsync("SHOW_WELCOME_MODAL", "true");
    }
  };

  const handleResend = async () => {
    setFieldError("");
    setOtp("");
    if (!userName) return;
    const result = await resendOtp(userName);
    if (result?.success) setTimer(30);
  };

  return (
    <AuthContainer
      title={
        isRestorationFlow === "true"
          ? "Account Restoration"
          : "OTP Verification"
      }
      apiMessage={apiMessage}
      celebration={isCelebration}
    >
      <View style={styles.responsiveWrapper}>
        {/* CASE 1: GLOBAL FINAL SUCCESS CARD (No Flicker) */}
        {globalOtpSuccess ? (
          <View style={styles.stateWrapper}>
            <Ionicons name="checkmark-circle" size={80} color="#10B981" />
            <Text style={styles.statusTitle}>Verification Successful!</Text>
            <Text style={styles.statusSub}>
              Securing your profile context and preparing your workspace
              layout...
            </Text>
            <ActivityIndicator
              size="small"
              color={Colors.accent}
              style={{ marginTop: 24 }}
            />
          </View>
        ) : restorationStatus === "processing" ||
          restorationStatus === "success" ? (
          /* CASE 2: HIGH TRUST INTERMEDIARY RESTORATION LOADER CARD */
          <View style={styles.stateWrapper}>
            <Ionicons
              name={
                restorationStatus === "success"
                  ? "cloud-done-outline"
                  : "sync-outline"
              }
              size={74}
              color={Colors.accent}
            />
            <Text style={styles.statusTitle}>
              {restorationStatus === "success"
                ? "Profile Restored!"
                : "Rebuilding Workspace..."}
            </Text>
            <Text style={styles.statusSub}>
              {restorationStatus === "success"
                ? "Your archived configurations and records have been successfully recovered."
                : "Retrieving user database parameters safely back to our systems..."}
            </Text>
            {restorationStatus === "processing" && (
              <ActivityIndicator
                size="small"
                color={Colors.accent}
                style={{ marginTop: 24 }}
              />
            )}
          </View>
        ) : (
          /* CASE 3: STANDARD OTP INTERACTION INTERFACE FORM */
          <>
            <View style={styles.iconCircle}>
              <Ionicons
                name={
                  isRestorationFlow === "true"
                    ? "shield-checkmark-outline"
                    : "chatbubble-ellipses-outline"
                }
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
  stateWrapper: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  statusTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1E293B",
    marginTop: 18,
    textAlign: "center",
  },
  statusSub: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginTop: 10,
    lineHeight: 22,
    paddingHorizontal: 16,
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
