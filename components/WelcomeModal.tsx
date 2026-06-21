import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppButton } from "./AppButton";
import * as SecureStore from "expo-secure-store";

interface WelcomeModalProps {
  /** Optional callback to fire when the user closes the modal */
  onDismiss?: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ onDismiss }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    async function checkWelcomeRequirement() {
      try {
        const shouldShow = await SecureStore.getItemAsync("SHOW_WELCOME_MODAL");
        if (shouldShow === "true") {
          setVisible(true);
        }
      } catch (error) {
        console.log("Error checking welcome modal state:", error);
      }
    }
    checkWelcomeRequirement();
  }, []);

  const handleDismiss = async () => {
    setVisible(false);
    try {
      await SecureStore.deleteItemAsync("SHOW_WELCOME_MODAL");
    } catch (error) {
      console.log("Error clearing welcome modal state:", error);
    }
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.badgeWrapper}>
            <Ionicons name="sparkles" size={32} color="#0077b6" />
          </View>

          <Text style={styles.modalTitle}>Welcome to The Link</Text>

          <Text style={styles.modalDescription}>
            Your digital account workspace is fully verified and loaded.
            Discover product updates, manage secure cart settlements, and
            explore premium tracking profiles customized for you.
          </Text>

          <AppButton
            title="GET STARTED"
            onPress={handleDismiss}
            style={styles.actionBtn}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  badgeWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#E0F2FE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 14,
    color: "#475569",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 26,
  },
  actionBtn: {
    width: "100%",
    height: 52,
    borderRadius: 26,
    backgroundColor: "#0077b6",
  },
});
