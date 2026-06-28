import { useState } from "react";
import { useAuth } from "../../../store/AuthContext";
import { useRouter } from "expo-router";
import { accountApi } from "../services/accountApi";

export const useSettings = () => {
  const [loading, setLoading] = useState(false);
  const {
    logout,
    setGlobalLogoutSuccess,
    globalLogoutSuccess,
    globalDeleteSuccess,
    setGlobalDeleteSuccess,
  } = useAuth();
  const router = useRouter();
  const executeConfirmedLogout = async () => {
    setLoading(true);
    try {
      setGlobalLogoutSuccess(true);
      await logout();
      router.replace("/(tabs)");
    } catch (err) {
      console.log("🚨 Error processing system logout sequence:", err);
    } finally {
      setLoading(false);
      setGlobalLogoutSuccess(false);
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
      setGlobalDeleteSuccess(true);
      await logout();
      router.replace("/(tabs)");
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
      setGlobalDeleteSuccess(false);
    }
  };
  return {
    loading,
    isSuccess: globalLogoutSuccess,
    isDeleteSuccess: globalDeleteSuccess,
    executeConfirmedLogout,
    handleChangePassword,
    handleChangeEmail,
    handleDeleteAccount,
  };
};
