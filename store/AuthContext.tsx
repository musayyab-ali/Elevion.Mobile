import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { authEvents } from "../utils/authEvents";
interface AuthContextType {
  isAuthenticated: boolean;
  isAppReady: boolean;
  isAuthSettled: boolean;
  login: (tokens: any) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthSettled, setIsAuthSettled] = useState(false);
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    // 1. Existing initialization logic
    const initializeAuth = async () => {
      try {
        const token = await SecureStore.getItemAsync("accessToken");
        console.log("AuthContext: Initial token check:", token);
        setIsAuthenticated(!!token);
      } catch (e) {
        setIsAuthenticated(false);
      } finally {
        setIsAuthSettled(true);
        setTimeout(() => setIsAppReady(true), 4000);
      }
    };

    initializeAuth();

    // 2. LISTEN FOR FORCE LOGOUT
    // This catches the event from the API Client when tokens fail
    const handleForceLogout = () => {
      console.log("AuthContext: Force Logout Event Received");
      setIsAuthenticated(false);
    };

    authEvents.on("forceLogout", handleForceLogout);

    // Cleanup listener on unmount
    return () => {
      authEvents.off("forceLogout", handleForceLogout);
    };
  }, []);

  const login = async (userData: any) => {
    try {
      await SecureStore.setItemAsync("accessToken", userData.AccessToken);
      await SecureStore.setItemAsync("refreshToken", userData.RefreshToken);
      await SecureStore.setItemAsync("user_name", userData.FullName);
      await SecureStore.setItemAsync("user_email", userData.Email);
      await SecureStore.setItemAsync("user_phone", userData.PhoneNumber);

      setIsAuthenticated(true);
    } catch (error) {
      console.log("Login Store Error:", error);
    }
  };

  const logout = async () => {
    try {
      // Clear all keys
      await SecureStore.deleteItemAsync("accessToken");
      await SecureStore.deleteItemAsync("refreshToken"); // Ensure this is cleared too
      await SecureStore.deleteItemAsync("user_name");
      await SecureStore.deleteItemAsync("user_email");
      await SecureStore.deleteItemAsync("user_phone");

      setIsAuthenticated(false);
    } catch (error) {
      console.log("Logout Error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isAppReady, login, logout, isAuthSettled }}
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
