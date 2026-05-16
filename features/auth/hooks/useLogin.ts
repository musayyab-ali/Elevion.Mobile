import { useState } from "react";
import { useRouter } from "expo-router";
import { authApi } from "../services/authApi";
import { useAuth } from "@/store/AuthContext";

export const useLogin = () => {
  const router = useRouter();
  const { login: saveAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [apiMessage, setApiMessage] = useState<string | null>(null);

  const checkUserExists = async (username: string) => {
    if (!username) return false;
    setLoading(true);
    setApiMessage(null);
    try {
      const result = await authApi.isUserNameUnique(username);
      // Backend returns true if the name is NOT taken.
      // So if result.Data.IsUnique is true, the user DOES NOT exist.
      if (result.Data.IsUnique === true) {
        setApiMessage("Username not found");
        return false;
      }
      setShowPassword(true);
      return true;
    } catch (error: any) {
      setApiMessage(error.Message || "Connection Error");
      return false;
    } finally {
      setTimeout(() => setApiMessage(null), 2000);
      setLoading(false);
    }
  };

  const handleLogin = async (userName: string, password: string) => {
    if (!userName || !password) {
      setApiMessage("Please enter both username and password");
      return;
    }

    setLoading(true);
    setApiMessage(null);

    try {
      const result = await authApi.login({
        UserName: userName,
        Password: password,
      });
      console.log("Login result object:", JSON.stringify(result));
      if (result.Data && result.Data.IsPhoneNumberConfirmed !== false) {
        await saveAuth(result.Data);
        router.replace("/(tabs)");
        return;
      }
      setApiMessage("Account verification required.");
      setTimeout(() => {
        router.push({
          pathname: "/(unauthorized)/otp-verification",
          params: {
            userName: userName,
            phoneNumber: result.Data?.PhoneNumber || "",
            message: "Almost there! Please verify your account.",
          },
        });
      }, 1500);
    } catch (error: any) {
      console.log("Login error object:", JSON.stringify(error));

      // Case: 400 Error - User strictly needs OTP
      if (error.ExceptionType === "UserPhoneNumberNotConfirmedException") {
        setApiMessage("Account pending verification. Redirecting...");

        setTimeout(() => {
          router.push({
            pathname: "/(unauthorized)/otp-verification",
            params: {
              userName: userName,
              phoneNumber: error.PhoneNumber || "",
              message: "Please verify your account first!.",
            },
          });
        }, 1500);
      } else {
        // Case: Wrong password / validation errors
        const errorMessage =
          error.Errors?.[0]?.Message || error.Message || "Login failed";
        setApiMessage(errorMessage);
      }
    } finally {
      setLoading(false);
      setTimeout(() => setApiMessage(null), 3000);
    }
  };
  return { handleLogin, checkUserExists, loading, showPassword, apiMessage };
};
