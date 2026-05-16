import { useState } from "react";
import { authApi } from "../services/authApi";

export const useForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"request" | "reset">("request");
  const [apiMessage, setApiMessage] = useState<string | null>(null);

  // Step 1: Request the reset email
  const sendResetEmail = async (username: string) => {
    if (!username) {
      setApiMessage("Please enter your username");
      return { success: false };
    }

    setLoading(true);
    setApiMessage(null);

    try {
      const result = await authApi.sendForgotPasswordEmail(username);

      setApiMessage(result.Message || "Reset code sent to your email.");
      setStep("reset");
      return { success: true };
    } catch (error: any) {
      // The error is already logged internally by handleResponse
      setApiMessage(error.Message || "User not found or server error");
      return { success: false };
    } finally {
      setLoading(false);
      // Clear message after 3 seconds
      setTimeout(() => setApiMessage(null), 3000);
    }
  };

  // Step 2: Submit the new password with the OTP/Token
  const resetPassword = async (payload: any) => {
    setLoading(true);
    setApiMessage(null);

    try {
      const result = await authApi.resetPassword(payload);

      setApiMessage(result.Message || "Password reset successfully!");
      return { success: true };
    } catch (error: any) {
      console.log("Reset password error:", error);
      setApiMessage("Failed to reset password. Please try again.");
      return { success: false };
    } finally {
      setLoading(false);
      setTimeout(() => setApiMessage(null), 3000);
    }
  };

  return {
    sendResetEmail,
    resetPassword,
    loading,
    step,
    setStep,
    apiMessage,
  };
};
