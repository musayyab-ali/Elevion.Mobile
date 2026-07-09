import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { authEvents } from "../utils/authEvents";
import { sanitizeRawPhoneNumber } from "@/utils/sanatizeNumber";
interface UserProfile {
  UserName: string | null;
  Name: string | null;
  Email: string | null;
  PhoneCode: string | null;
  Phone: string | null;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isAppReady: boolean;
  isAuthSettled: boolean;
  globalLoginSuccess: boolean;
  globalLogoutSuccess: boolean;
  globalDeleteSuccess: boolean;
  globalOtpSuccess: boolean;
  setGlobalLoginSuccess: (val: boolean) => void;
  setGlobalLogoutSuccess: (val: boolean) => void;
  setGlobalDeleteSuccess: (val: boolean) => void;
  setGlobalOtpSuccess: (val: boolean) => void;
  user: UserProfile | null;
  login: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  forceLogoutTriggered: "session_expired" | "manual" | null;
  clearForceLogoutFlag: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthSettled, setIsAuthSettled] = useState(false);
  const [isAppReady, setIsAppReady] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  const [globalLoginSuccess, setGlobalLoginSuccess] = useState(false);
  const [globalLogoutSuccess, setGlobalLogoutSuccess] = useState(false);
  const [globalDeleteSuccess, setGlobalDeleteSuccess] = useState(false);
  const [globalOtpSuccess, setGlobalOtpSuccess] = useState(false);
  // Track if a logout event requires a specific UI banner alert
  const [forceLogoutTriggered, setForceLogoutTriggered] = useState<
    "session_expired" | "manual" | null
  >(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = await SecureStore.getItemAsync("accessToken");
        console.log("Access Token :", token);
        if (token) {
          const UserName = await SecureStore.getItemAsync("user_name");
          const name = await SecureStore.getItemAsync("full_name");
          const email = await SecureStore.getItemAsync("user_email");
          const phoneCode = await SecureStore.getItemAsync("phone_code");
          const phone = await SecureStore.getItemAsync("user_phone");

          setUser({
            UserName,
            Name: name,
            Email: email,
            PhoneCode: phoneCode,
            Phone: sanitizeRawPhoneNumber(phone, phoneCode),
          });
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (e) {
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsAuthSettled(true);
        setIsAppReady(true); // Replaced arbitrary 4-second timeout with atomic readiness
      }
    };

    initializeAuth();

    const handleForceLogout = () => {
      console.log("AuthContext: Force Logout Event Received");
      setIsAuthenticated(false);
      setUser(null);
      setForceLogoutTriggered("session_expired");
    };

    authEvents.on("forceLogout", handleForceLogout);
    return () => {
      authEvents.off("forceLogout", handleForceLogout);
    };
  }, []);

  const login = async (userData: any) => {
    try {
      await SecureStore.setItemAsync("accessToken", userData.AccessToken);
      await SecureStore.setItemAsync("refreshToken", userData.RefreshToken);
      await SecureStore.setItemAsync("user_name", userData.UserName || "");
      await SecureStore.setItemAsync("full_name", userData.FullName || "");
      await SecureStore.setItemAsync("user_email", userData.Email || "");
      await SecureStore.setItemAsync("phone_code", userData.PhoneCode || "");
      await SecureStore.setItemAsync("user_phone", userData.PhoneNumber || "");

      // FIX: accurately targeted capital N matching incoming backend payload format
      setUser({
        UserName: userData.UserName,
        Name: userData.FullName,
        Email: userData.Email,
        PhoneCode: userData.PhoneCode,
        Phone: sanitizeRawPhoneNumber(userData.PhoneNumber, userData.PhoneCode),
      });
      setIsAuthenticated(true);
      setForceLogoutTriggered(null);
    } catch (error) {
      console.log("Login Store Error:", error);
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync("accessToken");
      await SecureStore.deleteItemAsync("refreshToken");
      await SecureStore.deleteItemAsync("user_name");
      await SecureStore.deleteItemAsync("full_name");
      await SecureStore.deleteItemAsync("user_email");
      await SecureStore.deleteItemAsync("phone_code");
      await SecureStore.deleteItemAsync("user_phone");

      setUser(null);
      setIsAuthenticated(false);
      setForceLogoutTriggered("manual");
    } catch (error) {
      console.log("Logout Error:", error);
    }
  };

  const clearForceLogoutFlag = () => setForceLogoutTriggered(null);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isAppReady,
        isAuthSettled,
        user,
        login,
        logout,
        forceLogoutTriggered,
        clearForceLogoutFlag,
        globalLoginSuccess,
        globalLogoutSuccess,
        setGlobalLoginSuccess,
        setGlobalLogoutSuccess,
        globalDeleteSuccess,
        globalOtpSuccess,
        setGlobalDeleteSuccess,
        setGlobalOtpSuccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
