import { useState } from "react";
import { useRouter } from "expo-router";
import { authApi } from "../services/authApi";
import { useAuth } from "@/store/AuthContext";
export const useOtp = () => {
  const router = useRouter();
  const { login: saveAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

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
        // phoneNumber,
        userName,
        phoneCode,
      });
      // CRITICAL: Extract the token from the response
      // Based on your API: result.Data.AccessToken
      const tokenData = { AccessToken: result.Data.AccessToken };

      // 1. Save to SecureStore and update global state
      await saveAuth(tokenData);
      setIsSuccess(true); // Triggers your beautiful new CelebrationOverlay

      setTimeout(() => {
        setIsSuccess(false);
        router.replace("/(tabs)");
      }, 4500);

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
    setLoading(true);
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
      setLoading(false);
    }
  };

  return { verifyOtp, resendOtp, loading, apiMessage, isSuccess };
};
