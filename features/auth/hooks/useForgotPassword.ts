import { useState } from "react";
import { authApi } from "../services/authApi";

export const useForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"request" | "reset">("request");
  const [apiMessage, setApiMessage] = useState<string | null>(null);

  // Step 1: Request the reset token/OTP
  const sendResetEmail = async (username: string) => {
    if (!username.trim()) {
      setApiMessage("Please enter your username");
      return { success: false };
    }

    setLoading(true);
    setApiMessage(null);

    try {
      // Assuming your api service maps to the correct endpoint
      const result = await authApi.sendForgotPasswordEmail(username.trim());
      setApiMessage(result.Message || "Reset code sent to your email.");
      setStep("reset");
      return { success: true };
    } catch (error: any) {
      setApiMessage(
        error.Message || "User not found or a server error occurred.",
      );
      return { success: false };
    } finally {
      setLoading(false);
      setTimeout(() => setApiMessage(null), 3000);
    }
  };

  // Step 2: Submit the payload containing updated parameters
  const resetPassword = async (payload: any) => {
    setLoading(true);
    setApiMessage(null);

    try {
      const result = await authApi.forgotPassword(payload);
      setApiMessage(result.Message || "Password reset successfully!");
      return { success: true, message: result.Message };
    } catch (error: any) {
      console.log("Reset password error:", error);
      setApiMessage(
        error.Message || "Failed to reset password. Please try again.",
      );
      return { success: false, message: error.Message };
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
    setApiMessage,
  };
};
