import { useState } from "react";
import { authApi } from "../services/authApi";

export const useResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState<string | null>(null);

  // Step 2: Submit the payload containing updated parameters
  const resetPassword = async (payload: any) => {
    setLoading(true);
    setApiMessage(null);

    try {
      const result = await authApi.resetPassword(payload);
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
    resetPassword,
    loading,
    apiMessage,
    setApiMessage,
  };
};
