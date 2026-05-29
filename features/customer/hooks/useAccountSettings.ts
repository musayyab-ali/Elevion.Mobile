import { useState } from "react";
import { Alert } from "react-native";
import { customerApi } from "../services/customerApi";
import { useAuth } from "../../../store/AuthContext"; // Use your existing Auth context

export const useAccountSettings = () => {
  const [loading, setLoading] = useState(false);
  const { logout } = useAuth(); // Destructure your logout function

  const handleDeactivation = async () => {
    setLoading(true);
    try {
      const res = await customerApi.deactivateAccount();

      if (res?.HttpStatusCode === 100) {
        Alert.alert(
          "Account Deactivated",
          "Your account has been deactivated. To reactivate, verify your account via OTP during your next login.",
          [
            {
              text: "OK",
              onPress: async () => {
                await logout();
              },
            },
          ],
        );
      }
    } catch (err: any) {
      Alert.alert("Error", err.Message || "Failed to deactivate account.");
    } finally {
      setLoading(false);
    }
  };

  const confirmDeactivation = () => {
    Alert.alert(
      "Deactivate Account",
      "Are you sure? You will be logged out and your account will be hidden.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Deactivate",
          style: "destructive",
          onPress: handleDeactivation,
        },
      ],
    );
  };

  return { confirmDeactivation, loading };
};
