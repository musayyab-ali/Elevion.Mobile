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
      // FLOW CONDITION C: Standard Account Registration OR Normal Missing OTP Flow
      // -> PERSIST DATA SAFELY -> FORWARD TO APP INNER HOME
      // ------------------------------------------------------------------------
      if (flowType === "registration") {
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
      console.log("[OTP Engine Loop Error]:", error);
      if (flowType === "restoration" && restorationStatus === "processing") {
        setRestorationStatus("failed");
      }
      setApiMessage(
        error?.Message || "Verification transaction failed to settle.",
      );
      return { success: false };
    } finally {
      setLoading(false);
      setTimeout(() => setApiMessage(null), 3000);
    }
  };

  const verifyPhoneNumber = async (userName?: string, otp: string) => {
    if (!otp && !userName) {
      setApiMessage("Error: Missing user registration identifier values.");
      return { success: false };
    }

    setLoading(true);

    try {
      // 1. Submit Core Endpoint Code Verification Signature
      const result = await authApi.verifyPhoneOtp({
        UserName: userName,
        Otp: otp,
      });

      if (!result || result.StatusCode !== 200 || !result.Data) {
        throw new Error(
          result?.Message ||
            "Invalid verification response structural contract.",
        );
      }

      if (result.Data) {
        setGlobalOtpSuccess(true);
        setTimeout(() => {
          router.replace("/(tabs)");
          setTimeout(() => setGlobalOtpSuccess(false), 500);
        }, 2000);

        return { success: true };
      }

      throw new Error("Unknown system state execution routing path exception.");
    } catch (error: any) {
      console.log("[OTP Engine Loop Error]:", error);
      setApiMessage(
        error?.Message || "Verification transaction failed to settle.",
      );
      return { success: false };
    } finally {
      setLoading(false);
      setTimeout(() => setApiMessage(null), 3000);
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
      setTimeout(() => setApiMessage(null), 3000);
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
    verifyPhoneNumber,
  };
};
