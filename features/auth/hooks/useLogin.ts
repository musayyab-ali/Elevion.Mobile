import { useState } from "react";
import { useRouter } from "expo-router";
import { authApi } from "../services/authApi";
import { useAuth } from "@/store/AuthContext";
import * as SecureStore from "expo-secure-store";

export const useLogin = () => {
  const router = useRouter();
  const {
    login: saveAuth,
    setGlobalLoginSuccess,
    globalLoginSuccess,
  } = useAuth();

  const [loading, setLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState<string | null>(null);

  // Account Deletion Tracking Context States
  const [pendingDeletionData, setPendingDeletionData] = useState<any | null>(
    null,
  );
  const [showDeletionModal, setShowDeletionModal] = useState(false);

  const handleLogin = async (userName: string, password: string) => {
    if (!userName.trim() || !password) {
      setApiMessage("Please enter both username and password.");
      return;
    }

    setLoading(true);
    setApiMessage(null);

    try {
      const result = await authApi.login({
        UserName: userName,
        Password: password,
      });
      if (!result || result.StatusCode !== 200 || !result.Data) {
        throw new Error(
          result?.Message || "Invalid server response parameters received.",
        );
      }

      const userData = result.Data;

      // ------------------------------------------------------------------------
      // SCENARIO 4: Account Is Pending Deletion Intercept
      // ------------------------------------------------------------------------
      if (userData.IsPendingDeletion === true) {
        const temporaryToken = userData.AccessToken;
        const statusCheck = await authApi.getDeletionStatus(temporaryToken);

        if (statusCheck?.Data && statusCheck.Data.IsExpired === false) {
          setPendingDeletionData({
            ...statusCheck.Data,
            AccessToken: temporaryToken,
            OriginalUserName: userName,
          });
          setShowDeletionModal(true);
          return;
        }
      }

      // ------------------------------------------------------------------------
      // SCENARIO 3: Phone Verified but Password Reset is Explicitly Required
      // ------------------------------------------------------------------------
      if (
        userData.IsPhoneNumberConfirmed &&
        userData.IsPasswordChangeRequired
      ) {
        setApiMessage("Password reset required. Redirecting...");
        setTimeout(() => {
          router.push({
            pathname: "/(unauthorized)/reset-password",
            params: { userName },
          });
        }, 1200);
        return;
      }

      // ------------------------------------------------------------------------
      // SCENARIO 1: Pure Happy Path (Everything Verified & OK)
      // ------------------------------------------------------------------------
      if (
        userData.IsPhoneNumberConfirmed &&
        !userData.IsPendingDeletion &&
        !userData.IsPasswordChangeRequired
      ) {
        await saveAuth(userData);
        await SecureStore.setItemAsync("SHOW_WELCOME_MODAL", "true");

        setGlobalLoginSuccess(true);
        setTimeout(() => {
          router.replace("/(tabs)");
          setTimeout(() => setGlobalLoginSuccess(false), 500);
        }, 2000);
        return;
      }
    } catch (error: any) {
      console.log("[Login Engine Error]:", error);

      // Extract details from backend response payload if it failed via Axios/Fetch exception rules
      const backendResponse = error?.response?.data || error;
      const exceptionType = backendResponse?.ExceptionType || "";
      const customMessage = backendResponse?.Message;

      // ------------------------------------------------------------------------
      // SCENARIO 2 (MOVED TO CATCH): Phone Number Not Confirmed Intercept
      // ------------------------------------------------------------------------
      if (
        exceptionType === "UserPhoneNumberNotConfirmedException" ||
        customMessage === "User did not confirm his/her phone number"
      ) {
        setApiMessage("Account verification required. Redirecting...");

        setTimeout(() => {
          router.push({
            pathname: "/(unauthorized)/otp-verification",
            params: {
              userName: userName,
              phoneNumber: "", // Backend does not return it here for safety, use custom input in OTP screen if needed
              phoneCode: "",
              message: "Please enter your security code to proceed.",
              fromLogin: "true",
              flowType: "verification", // Tells useOtp logic to skip checking active profile variables
            },
          });
        }, 1500);
        return;
      }

      // Default error handling for everything else
      const errorMessage =
        error.Errors?.[0]?.Message ||
        customMessage ||
        error.Message ||
        "Login pipeline execution failed.";
      setApiMessage(errorMessage);
    } finally {
      setLoading(false);
      setTimeout(() => setApiMessage(null), 3000);
    }
  };

  return {
    handleLogin,
    loading,
    isSuccess: globalLoginSuccess,
    apiMessage,
    showDeletionModal,
    setShowDeletionModal,
    pendingDeletionData,
  };
};
