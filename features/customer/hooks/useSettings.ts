import { useState } from "react";
import { useAuth } from "../../../store/AuthContext";
import { useRouter } from "expo-router";
import { accountApi } from "../services/accountApi";

export const useSettings = () => {
  const [loading, setLoading] = useState(false);
  const { logout, setGlobalLogoutSuccess, globalLogoutSuccess } = useAuth();
  const router = useRouter();
  // const [isSuccess, setIsSuccess] = useState(false);
  const executeConfirmedLogout = async () => {
    setLoading(true);
    try {
      await logout();
      // setIsSuccess(true);
      setGlobalLogoutSuccess(true);
      setTimeout(() => {
        router.replace("/(tabs)");
        setTimeout(() => setGlobalLogoutSuccess(false), 500);
      }, 2000);
    } catch (err) {
      console.log("🚨 Error processing system logout sequence:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (oldPass: string, newPass: string) => {
    if (!oldPass || !newPass)
      return { success: false, message: "Both password fields are required." };
    if (newPass.length < 6)
      return {
        success: false,
        message: "New password must contain at least 6 characters.",
      };

    setLoading(true);
    try {
      const res = await accountApi.changePassword({
        OldPassword: oldPass,
        NewPassword: newPass,
      });
      return {
        success: true,
        message: res.Message || "Password Reset successfully",
      };
    } catch (err: any) {
      const apiErr =
        err?.Errors?.[0]?.Message ||
        err?.Message ||
        "Password modification failed.";
      return { success: false, message: apiErr };
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = async (newEmail: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newEmail || !emailRegex.test(newEmail)) {
      return {
        success: false,
        message: "Please supply a valid email address structure.",
      };
    }

    setLoading(true);
    try {
      const res = await accountApi.changeEmail({ NewEmail: newEmail });
      return {
        success: true,
        message: res.Message || "Email confirmed Successfully",
      };
    } catch (err: any) {
      const apiErr =
        err?.Errors?.[0]?.Message ||
        err?.Message ||
        "Email modification failed.";
      return { success: false, message: apiErr };
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      const res = await accountApi.deleteAccount();
      return {
        success: true,
        message: res.Message || `Account scheduled for deletion successfully.`,
        data: res.Data,
      };
    } catch (err: any) {
      const apiErr =
        err?.Detail || err?.Title || "Account delete request rejected.";
      return { success: false, message: apiErr };
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreAccount = async (userName: string, email: string) => {
    if (!userName || !email)
      return {
        success: false,
        message: "Username and Email are mandatory fields.",
      };

    setLoading(true);
    try {
      const res = await accountApi.restoreAccount({
        UserName: userName,
        Email: email,
      });
      return {
        success: true,
        message: res.Message || `Account record successfully recovered.`,
      };
    } catch (err: any) {
      const apiErr = err?.Message || "Failed to process account recovery.";
      return { success: false, message: apiErr };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    isSuccess: globalLogoutSuccess,
    executeConfirmedLogout,
    handleChangePassword,
    handleChangeEmail,
    handleDeleteAccount,
    handleRestoreAccount,
  };
};
