import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { Ionicons } from "@expo/vector-icons";

interface WizardData {
  fullName: string;
  email: string;
  phone: string;
}

export const DirectLoginModal: React.FC<WizardData> = () => {
  const [wizardVisible, setWizardVisible] = useState(false);
  const [userData, setUserData] = useState<WizardData | null>(null);

  const [wantsPassword, setWantsPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Check SecureStore on mount
  useEffect(() => {
    const checkPendingWizard = async () => {
      try {
        const storedData = await SecureStore.getItemAsync(
          "PENDING_WELCOME_WIZARD",
        );
        if (storedData) {
          setUserData(JSON.parse(storedData));
          setWizardVisible(true);
        }
      } catch (error) {
        console.error("Error reading secure storage wizard data:", error);
      }
    };

    checkPendingWizard();
  }, []);

  // Centralized function to completely remove the wizard state
  const dismissWizardPermanently = async () => {
    try {
      await SecureStore.deleteItemAsync("PENDING_WELCOME_WIZARD");
      setWizardVisible(false);
    } catch (error) {
      console.error("Failed to delete secure store key:", error);
      setWizardVisible(false); // fallback close anyway
    }
  };

  const handlePasswordProvisioning = async () => {
    if (!password || !confirmPassword) {
      setStatusMessage({ type: "error", text: "Please populate both fields." });
      return;
    }
    if (password !== confirmPassword) {
      setStatusMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    setIsUpdatingPassword(true);
    setStatusMessage(null);

    try {
      // API call to update password goes here
      // await authApi.setPassword({ password });

      setStatusMessage({
        type: "success",
        text: "Account secured successfully!",
      });

      // Delay slightly so they see the success message, then dismiss permanently
      setTimeout(async () => {
        await dismissWizardPermanently();
      }, 1800);
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: "Failed to establish profile password.",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <Modal visible={wizardVisible} animationType="slide" transparent={true}>
      <View style={wizardStyles.overlay}>
        <View style={wizardStyles.wizardCard}>
          <View style={wizardStyles.iconBanner}>
            <Ionicons name="sparkles" size={32} color="#10B981" />
          </View>

          <Text style={wizardStyles.title}>
            Order Placed & Account Created!
          </Text>
          <Text style={wizardStyles.description}>
            An account has been generated for you to easily track your items.
            Here are your credentials:
          </Text>

          {/* Profile Credentials Information Matrix */}
          <View style={wizardStyles.infoBox}>
            <Text style={wizardStyles.infoText}>
              <Text style={{ fontWeight: "700" }}>Name: </Text>
              {userData?.fullName}
            </Text>
            <Text style={wizardStyles.infoText}>
              <Text style={{ fontWeight: "700" }}>Email: </Text>
              {userData?.email}
            </Text>
            <Text style={wizardStyles.infoText}>
              <Text style={{ fontWeight: "700" }}>Phone: </Text>
              {userData?.phone}
            </Text>
          </View>

          {statusMessage && (
            <View
              style={[
                wizardStyles.toast,
                statusMessage.type === "error"
                  ? wizardStyles.toastError
                  : wizardStyles.toastSuccess,
              ]}
            >
              <Text
                style={
                  statusMessage.type === "error"
                    ? wizardStyles.toastTextError
                    : wizardStyles.toastTextSuccess
                }
              >
                {statusMessage.text}
              </Text>
            </View>
          )}

          {!wantsPassword ? (
            <View style={wizardStyles.actionContainerVertical}>
              <TouchableOpacity
                style={wizardStyles.primaryActionButton}
                onPress={() => setWantsPassword(true)}
              >
                <Text style={wizardStyles.primaryActionButtonText}>
                  Secure Account with Password
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={wizardStyles.secondaryActionButton}
                onPress={dismissWizardPermanently} // Clean from SecureStore immediately if skipped
              >
                <Text style={wizardStyles.secondaryActionButtonText}>
                  I'll Do It Later
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={wizardStyles.passwordFormContainer}>
              <Text style={wizardStyles.formHeaderLabel}>
                Establish Access Credentials
              </Text>

              <TextInput
                placeholder="Enter secure password"
                placeholderTextColor="#94A3B8"
                style={wizardStyles.input}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              <TextInput
                placeholder="Confirm secure password"
                placeholderTextColor="#94A3B8"
                style={wizardStyles.input}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />

              <View style={wizardStyles.formActionsRow}>
                <TouchableOpacity
                  style={wizardStyles.formCancelButton}
                  onPress={() => {
                    setWantsPassword(false);
                    setStatusMessage(null);
                  }}
                  disabled={isUpdatingPassword}
                >
                  <Text style={wizardStyles.formCancelButtonText}>Back</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={wizardStyles.formSubmitButton}
                  onPress={handlePasswordProvisioning}
                  disabled={isUpdatingPassword}
                >
                  {isUpdatingPassword ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={wizardStyles.formSubmitButtonText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const wizardStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    justifyContent: "center",
    padding: 20,
  },
  wizardCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  iconBanner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#D1FAE5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 16,
  },
  infoBox: {
    width: "100%",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 14,
    gap: 6,
    marginBottom: 20,
  },
  infoText: { fontSize: 13, color: "#334155" },
  actionContainerVertical: { width: "100%", gap: 10 },
  primaryActionButton: {
    backgroundColor: "#10B981",
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justify: "center",
    width: "100%",
    justifyContent: "center",
  },
  primaryActionButtonText: { color: "#FFF", fontSize: 14, fontWeight: "600" },
  secondaryActionButton: {
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  secondaryActionButtonText: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "600",
  },
  passwordFormContainer: { width: "100%", gap: 10 },
  formHeaderLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    height: 44,
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#0F172A",
  },
  formActionsRow: { flexDirection: "row", gap: 12, marginTop: 6 },
  formCancelButton: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  formCancelButtonText: { color: "#475569", fontWeight: "600" },
  formSubmitButton: {
    flex: 2,
    backgroundColor: "#0F172A",
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  formSubmitButtonText: { color: "#FFF", fontWeight: "600" },
  toast: { width: "100%", padding: 10, borderRadius: 8, marginBottom: 12 },
  toastError: { backgroundColor: "#FEE2E2" },
  toastSuccess: { backgroundColor: "#D1FAE5" },
  toastTextError: {
    color: "#991B1B",
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  toastTextSuccess: {
    color: "#065F46",
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
});
