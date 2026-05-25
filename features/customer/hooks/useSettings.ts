import { useState, useEffect } from "react";
import { customerApi } from "../services/customerApi";
import { useAuth } from "../../../store/AuthContext";
import { Alert } from "react-native";

export const useSettings = () => {
  const [loading, setLoading] = useState(false);
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => await logout(),
      },
    ]);
  };

  return { loading, handleLogout };
};
