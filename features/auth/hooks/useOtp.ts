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

  // Dedicated state for professional Restoration UI feedback status
  const [restorationStatus, setRestorationStatus] = useState<
    "idle" | "processing" | "success" | "failed"
  >("idle");

  const verifyOtp = async (
    otp: string,
    phoneNumber?: string,
    userName?: string,
    phoneCode: number = 92,
    isRestorationFlow?: string,
    restorationToken?: string,
  ) => {
    if (!phoneNumber && !userName) {
      setApiMessage("Error: No user identification found.");
      return { success: false };
    }

    setLoading(true);
    setApiMessage(null);
    setRestorationStatus("idle");

    try {
      // 1. Hit the baseline verification endpoint first
      const result = await authApi.verifyOtp({
        otp,
        userName,
        phoneCode,
        phoneNumber,
      });

      // Guard statement: If verifyOtp itself fails or returns no payload, stop immediately
      if (!result || result.StatusCode !== 200 || !result.Data) {
        throw new Error(
          result?.Message || "Invalid verification code provided.",
        );
      }

      // 2. SCENARIO 1: Account Restoration Conditional Chain
      if (isRestorationFlow === "true" && restorationToken) {
        setRestorationStatus("processing");

        // Execute and wait strictly for the restoration confirmation response
        const restoreResponse =
          await authApi.restoreDeletedAccount(restorationToken);

        if (!restoreResponse || restoreResponse.StatusCode !== 200) {
          setRestorationStatus("failed");
          throw new Error(
            restoreResponse?.Message ||
              "Account validation succeeded, but restoration was rejected.",
          );
        }

        // Restoration completed successfully on the backend
        setRestorationStatus("success");
      }

      // 3. SECURE COHESIVE PERSISTENCE (Runs for Flow B OR successfully validated Flow A)
      console.log("Successfully Saving Auth Object:", result.Data);

      // Save valid verification tokens to Secure Store context layer
      await saveAuth(result.Data);

      setGlobalOtpSuccess(true);
      setIsCelebration(true);

      setTimeout(() => {
        setIsCelebration(false);
        router.replace("/(tabs)");
        setTimeout(() => setGlobalOtpSuccess(false), 500);
      }, 4000);

      return { success: true };
    } catch (error: any) {
      // If we were trying to restore when it failed, ensure state shows failed
      if (isRestorationFlow === "true" && restorationStatus === "processing") {
        setRestorationStatus("failed");
      }

      setApiMessage(
        error?.Message || "Verification execution encountered an issue.",
      );
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async (userName: string) => {
    setResetLoading(true);
    setApiMessage(null);
    try {
      await authApi.resendOtp(userName);
      setApiMessage("A new code has been sent!");
      return { success: true };
    } catch (error: any) {
      setApiMessage(error?.Message || "Failed to resend code.");
      return { success: false };
    } finally {
      setTimeout(() => setApiMessage(null), 4000);
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
