// import { useState } from "react";
// import { useRouter } from "expo-router";
// import { authApi } from "../services/authApi";
// import { useAuth } from "@/store/AuthContext";

// export const useOtp = () => {
//   const router = useRouter();
//   const { login: saveAuth, globalOtpSuccess, setGlobalOtpSuccess } = useAuth();
//   const [loading, setLoading] = useState(false);
//   const [resetLoading, setResetLoading] = useState(false);
//   const [apiMessage, setApiMessage] = useState<string | null>(null);
//   const [isCelebration, setIsCelebration] = useState(false);

//   // Dedicated state for professional Restoration UI feedback status
//   const [restorationStatus, setRestorationStatus] = useState<
//     "idle" | "processing" | "success" | "failed"
//   >("idle");

//   const verifyOtp = async (
//     otp: string,
//     phoneNumber?: string,
//     userName?: string,
//     phoneCode: number = 92,
//     isRestorationFlow?: string,
//     restorationToken?: string,
//   ) => {
//     if (!phoneNumber && !userName) {
//       setApiMessage("Error: No user identification found.");
//       return { success: false };
//     }

//     setLoading(true);
//     setApiMessage(null);
//     setRestorationStatus("idle");

//     try {
//       console.log("sending data :", otp, userName, phoneCode, phoneNumber);
//       // 1. Hit the baseline verification endpoint first
//       const result = await authApi.verifyOtp({
//         otp,
//         userName,
//         phoneCode,
//         phoneNumber,
//       });
//       console.log("OTP Verification Result:", result);
//       // Guard statement: If verifyOtp itself fails or returns no payload, stop immediately
//       if (!result || result.StatusCode !== 200 || !result.Data) {
//         throw new Error(
//           result?.Message || "Invalid verification code provided.",
//         );
//       }

//       // 2. SCENARIO 1: Account Restoration Conditional Chain
//       if (isRestorationFlow === "true" && restorationToken) {
//         setRestorationStatus("processing");

//         // Execute and wait strictly for the restoration confirmation response
//         const restoreResponse =
//           await authApi.restoreDeletedAccount(restorationToken);

//         if (!restoreResponse || restoreResponse.StatusCode !== 200) {
//           setRestorationStatus("failed");
//           throw new Error(
//             restoreResponse?.Message ||
//               "Account validation succeeded, but restoration was rejected.",
//           );
//         }

//         // Restoration completed successfully on the backend
//         setRestorationStatus("success");
//         router.push("/(unauthorized)/login");
//         return;
//       }

//       // 3. SECURE COHESIVE PERSISTENCE (Runs for Flow B OR successfully validated Flow A)
//       console.log("Successfully Saving Auth Object:", result.Data);

//       // Save valid verification tokens to Secure Store context layer
//       await saveAuth(result.Data);

//       setGlobalOtpSuccess(true);
//       setIsCelebration(true);

//       setTimeout(() => {
//         setIsCelebration(false);
//         router.replace("/(tabs)");
//         setTimeout(() => setGlobalOtpSuccess(false), 500);
//       }, 4000);

//       return { success: true };
//     } catch (error: any) {
//       // If we were trying to restore when it failed, ensure state shows failed
//       if (isRestorationFlow === "true" && restorationStatus === "processing") {
//         setRestorationStatus("failed");
//       }

//       setApiMessage(
//         error?.Message || "Verification execution encountered an issue.",
//       );
//       return { success: false };
//     } finally {
//       setLoading(false);
//       setTimeout(() => setApiMessage(null), 3000);
//     }
//   };

//   const resendOtp = async (userName: string) => {
//     console.log("Resending OTP for user:", userName);
//     setResetLoading(true);
//     setApiMessage(null);
//     try {
//       await authApi.resendOtp(userName);
//       setApiMessage("A new code has been sent!");
//       return { success: true };
//     } catch (error: any) {
//       setApiMessage(error?.Message || "Failed to resend code.");
//       return { success: false };
//     } finally {
//       setTimeout(() => setApiMessage(null), 4000);
//       setResetLoading(false);
//     }
//   };

//   return {
//     verifyOtp,
//     resendOtp,
//     loading,
//     apiMessage,
//     globalOtpSuccess,
//     setGlobalOtpSuccess,
//     isCelebration,
//     resetLoading,
//     restorationStatus,
//   };
// };

import { useState } from "react";
import { useRouter } from "expo-router";
import { authApi } from "../services/authApi";
import { useAuth } from "@/store/AuthContext";

export const useOtp = () => {
  const router = useRouter();
  const { login: saveAuth, globalOtpSuccess, setGlobalOtpSuccess } = useAuth();

  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState<string | null>(null);
  const [isCelebration, setIsCelebration] = useState(false);

  const [restorationStatus, setRestorationStatus] = useState<
    "idle" | "processing" | "success" | "failed"
  >("idle");

  const verifyOtp = async (
    otp: string,
    phoneNumber?: string,
    userName?: string,
    phoneCode: number = 92,
    flowType:
      | "registration"
      | "verification"
      | "reset"
      | "restoration" = "verification",
    restorationToken?: string,
  ) => {
    if (!phoneNumber && !userName) {
      setApiMessage("Error: Missing user registration identifier values.");
      return { success: false };
    }

    setLoading(true);
    setApiMessage(null);
    setRestorationStatus("idle");

    try {
      // 1. Submit Core Endpoint Code Verification Signature
      const result = await authApi.verifyOtp({
        otp,
        userName,
        phoneCode,
        phoneNumber,
      });

      if (!result || result.StatusCode !== 200 || !result.Data) {
        throw new Error(
          result?.Message ||
            "Invalid verification response structural contract.",
        );
      }

      // ------------------------------------------------------------------------
      // FLOW CONDITION A: Restoring a Previously Deleted Account ("restoration")
      // -> DO NOT STORE DATA HERE -> FORWARD TO LOGIN
      // ------------------------------------------------------------------------
      if (flowType === "restoration" && restorationToken) {
        setRestorationStatus("processing");

        const restoreResponse =
          await authApi.restoreDeletedAccount(restorationToken);

        if (!restoreResponse || restoreResponse.StatusCode !== 200) {
          setRestorationStatus("failed");
          throw new Error(
            restoreResponse?.Message ||
              "Validation OK, but profile restoration rejected.",
          );
        }

        setRestorationStatus("success");
        setTimeout(() => {
          router.replace("/(unauthorized)/login");
        }, 2000);
        return { success: true };
      }

      // ------------------------------------------------------------------------
      // FLOW CONDITION B: User Needs an Immediate Forced Password Reset ("reset")
      // -> DO NOT STORE DATA HERE -> FORWARD TO RESET PASS SCREEN
      // ------------------------------------------------------------------------
      if (flowType === "reset") {
        setGlobalOtpSuccess(true);
        setApiMessage("Identity verified. Please secure your new credentials.");

        setTimeout(() => {
          setGlobalOtpSuccess(false);
          router.replace({
            pathname: "/(unauthorized)/reset-password",
            params: { userName },
          });
        }, 2000);
        return { success: true };
      }

      // ------------------------------------------------------------------------
      // FLOW CONDITION C: Standard Account Registration OR Normal Missing OTP Flow
      // -> PERSIST DATA SAFELY -> FORWARD TO APP INNER HOME
      // ------------------------------------------------------------------------
      if (flowType === "registration" || flowType === "verification") {
        await saveAuth(result.Data);

        setGlobalOtpSuccess(true);
        setIsCelebration(true);

        setTimeout(() => {
          setIsCelebration(false);
          router.replace("/(tabs)");
          setTimeout(() => setGlobalOtpSuccess(false), 500);
        }, 3500);

        return { success: true };
      }

      throw new Error("Unknown system state execution routing path exception.");
    } catch (error: any) {
      console.error("[OTP Engine Loop Error]:", error);
      if (flowType === "restoration" && restorationStatus === "processing") {
        setRestorationStatus("failed");
      }
      setApiMessage(
        error?.Message || "Verification transaction failed to settle.",
      );
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async (userName: string) => {
    if (!userName) return { success: false };
    setResetLoading(true);
    setApiMessage(null);
    try {
      await authApi.resendOtp(userName);
      setApiMessage(
        "A fresh verification code has been dispatched to your email.",
      );
      return { success: true };
    } catch (error: any) {
      setApiMessage(error?.Message || "Failed to resend authorization code.");
      return { success: false };
    } finally {
      setResetLoading(false);
    }
  };

  return {
    verifyOtp,
    resendOtp,
    loading,
    apiMessage,
    globalOtpSuccess,
    setGlobalOtpSuccess,
    isCelebration,
    resetLoading,
    restorationStatus,
  };
};
