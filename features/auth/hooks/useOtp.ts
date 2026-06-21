import { useState } from "react";
import { useRouter } from "expo-router";
import { authApi } from "../services/authApi";
import { useAuth } from "@/store/AuthContext";
export const useOtp = () => {
  const router = useRouter();
  const { login: saveAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isCelebration, setIsCelebration] = useState(false);
  // Inside useOtp.ts

  const verifyOtp = async (
    otp: string,
    phoneNumber?: string,
    userName?: string,
    phoneCode: number = 92,
  ) => {
    // Logic: Ensure we have at least ONE identifier
    if (!phoneNumber && !userName) {
      setApiMessage("Error: No user identification found.");
      return { success: false };
    }

    setLoading(true);
    setApiMessage(null);

    try {
      const result = await authApi.verifyOtp({
        otp,
        userName,
        phoneCode,
      });

      const tokenData = {
        AccessToken: result.Data.AccessToken,
        UserName: userName,
      };

      // 1. Save to SecureStore and update global state
      await saveAuth(tokenData);
      setIsCelebration(true);
      setIsSuccess(true);

      setTimeout(() => {
        setIsCelebration(false);
        router.replace("/(tabs)");
      }, 4000);

      return { success: true };
    } catch (error: any) {
      setApiMessage(error?.Message || "Verification failed. Please try again.");
      return { success: false };
    } finally {
      setTimeout(() => setApiMessage(null), 3000);
      setLoading(false);
    }
  };

  const resendOtp = async (userName: string) => {
    setResetLoading(true);
    setApiMessage(null);
    try {
      await authApi.resendOtp(userName);
      setApiMessage("A new code has been sent!"); // Positive feedback
      return { success: true };
    } catch (error: any) {
      setApiMessage(error?.Message || "Failed to resend code.");
      return { success: false };
    } finally {
      setTimeout(() => setApiMessage(null), 3000);
      setResetLoading(false);
    }
  };

  return {
    verifyOtp,
    resendOtp,
    loading,
    apiMessage,
    isSuccess,
    isCelebration,
    resetLoading,
  };
};
