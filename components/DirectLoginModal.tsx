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
import { useResetPassword } from "@/features/auth/hooks/useResetPassword";

interface WizardData {
  userName: string;
  email: string;
  phone: string;
}

export const DirectLoginModal: React.FC = () => {
  const { resetPassword } = useResetPassword();
  const [wizardVisible, setWizardVisible] = useState(false);
  const [userData, setUserData] = useState<WizardData | null>(null);

  const [wantsPassword, setWantsPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
        console.log("Error reading secure storage wizard data:", error);
      }
    };

    checkPendingWizard();
  }, []);

  const dismissWizardPermanently = async () => {
    try {
      await SecureStore.deleteItemAsync("PENDING_WELCOME_WIZARD");
      setWizardVisible(false);
    } catch (error) {
      console.log("Failed to delete secure store key:", error);
      setWizardVisible(false);
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
      const result = await resetPassword({
        UserName: userData?.userName || "",
        Password: password,
        ConfirmPassword: confirmPassword,
        Code: "",
        ResetType: 3,
      });

      if (result?.success) {
        setPassword("");
        setConfirmPassword("");
        setStatusMessage({
          type: "success",
          text: "Account secured successfully!",
        });
        setTimeout(async () => {
          await dismissWizardPermanently();
        }, 1800);
      } else {
        setStatusMessage({
          type: "error",
          text: result?.message || "Failed to establish profile password.",
        });
      }
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
    <Modal visible={wizardVisible} animationType="fade" transparent={true}>
      <View style={wizardStyles.overlay}>
        <View style={wizardStyles.wizardCard}>
          <View style={wizardStyles.iconBanner}>
            <Ionicons name="sparkles" size={28} color="#10B981" />
          </View>

          {wantsPassword ? (
            <Text style={wizardStyles.title}>Establish Access Credentials</Text>
          ) : (
            <Text style={wizardStyles.title}>
              Order Placed & Account Created!
            </Text>
          )}

          {!wantsPassword && userData && (
            <>
              <Text style={wizardStyles.description}>
                An account has been generated for you to easily track your
                items. Here are your temporary credentials:
              </Text>

              <View style={wizardStyles.infoBox}>
                <Text style={wizardStyles.infoText}>
                  <Text style={{ fontWeight: "700" }}>Username: </Text>
                  {userData?.userName}
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
            </>
          )}

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
                onPress={dismissWizardPermanently}
              >
                <Text style={wizardStyles.secondaryActionButtonText}>
                  I'll Do It Later
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={wizardStyles.passwordFormContainer}>
              <Text style={wizardStyles.formHeaderLabel}>New Password</Text>
              <View style={wizardStyles.passwordInputContainer}>
                <TextInput
                  placeholder="Enter secure password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showPassword}
                  editable={!isUpdatingPassword}
                  style={wizardStyles.input}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  style={wizardStyles.eyeIconWrapper}
                  disabled={isUpdatingPassword}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>

              <Text style={wizardStyles.formHeaderLabel}>Confirm Password</Text>
              <View style={wizardStyles.passwordInputContainer}>
                <TextInput
                  placeholder="Confirm secure password"
                  placeholderTextColor="#94A3B8"
                  secureTextEntry={!showConfirmPassword}
                  editable={!isUpdatingPassword}
                  style={wizardStyles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity
                  style={wizardStyles.eyeIconWrapper}
                  disabled={isUpdatingPassword}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={
                      showConfirmPassword ? "eye-off-outline" : "eye-outline"
                    }
                    size={20}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>

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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  iconBanner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#D1FAE5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
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
    paddingHorizontal: 6,
  },
  infoBox: {
    width: "100%",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 14,
    gap: 8,
    marginBottom: 20,
  },
  infoText: { fontSize: 13, color: "#334155" },
  actionContainerVertical: { width: "100%", gap: 10 },
  primaryActionButton: {
    backgroundColor: "#10B981",
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
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
  passwordFormContainer: { width: "100%" },
  formHeaderLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 6,
    marginTop: 4,
  },
  passwordInputContainer: {
    width: "100%",
    height: 48,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingRight: 14,
  },
  eyeIconWrapper: {
    justifyContent: "center",
    alignItems: "center",
    padding: 4,
  },
  input: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#0F172A",
  },
  formActionsRow: { flexDirection: "row", gap: 12, marginTop: 14 },
  formCancelButton: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  formCancelButtonText: { color: "#475569", fontWeight: "600" },
  formSubmitButton: {
    flex: 2,
    backgroundColor: "#0F172A",
    height: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  formSubmitButtonText: { color: "#FFF", fontWeight: "600" },
  toast: { width: "100%", padding: 12, borderRadius: 10, marginBottom: 12 },
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
