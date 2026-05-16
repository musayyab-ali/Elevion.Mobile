import { useState, useCallback } from "react";
import { authApi } from "../services/authApi";
import { useRouter } from "expo-router";
import debounce from "lodash.debounce";

export const useRegister = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(false);
  const [apiErrors, setApiErrors] = useState<any[]>([]);
  const [apiMessage, setApiMessage] = useState<string | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<{
    isUnique: boolean;
    message: string;
  } | null>(null);

  const checkUsernameUniqueness = async (username: string) => {
    if (username.length < 3) return setUsernameStatus(null);
    setIsCheckingUser(true);
    try {
      const result = await authApi.isUserNameUnique(username);
      const isUnique = result?.Data?.IsUnique;
      if (typeof isUnique === "boolean") {
        setUsernameStatus({
          isUnique,
          message: isUnique ? "available" : "not available",
        });
      }
    } catch (error: any) {
      console.log("Check failed", error);
      setApiMessage("Could not verify username. Please try again.");
      setTimeout(() => setApiMessage(null), 4000);
    } finally {
      setIsCheckingUser(false);
    }
  };

  const debouncedCheck = useCallback(
    debounce((nextValue: string) => checkUsernameUniqueness(nextValue), 500),
    [],
  );

  const handleRegister = async (formData: any) => {
    setLoading(true);
    setApiErrors([]);
    setApiMessage(null);

    const payload = {
      ...formData,
      ClientRole: 4,
    };

    try {
      const response = await authApi.register(payload);
      console.log("Registration response:", response);
      // Professional success handling
      if (response.StatusCode === 200) {
        router.push({
          pathname: "/(unauthorized)/otp-verification",
          params: {
            phoneNumber: payload.PhoneNumber,
            userName: payload.UserName,
            message: "We've sent a 6-digit verification code to your phone.",
          },
        });
      }
    } catch (error: any) {
      // Handle professional error display based on Status Code
      if (error.StatusCode === 400 && error.Errors) {
        setApiErrors(error.Errors);
        setApiMessage("Please correct the highlighted errors.");
      } else if (error.StatusCode === 404) {
        setApiMessage("Registration service currently unavailable.");
      } else {
        setApiMessage(
          error.Message || "A server error occurred. Please try again.",
        );
      }

      // Auto-hide the error message after 4 seconds
      setTimeout(() => setApiMessage(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  const getFieldError = (fieldName: string) => {
    return apiErrors.find((e) => e.Field === fieldName)?.Message;
  };

  return {
    handleRegister,
    loading,
    getFieldError,
    debouncedCheck,
    usernameStatus,
    isCheckingUser,
    apiMessage,
  };
};
