import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface RestoreAccountModalProps {
  visible: boolean;
  scheduledPurgeDate?: string;
  onRestore: () => void;
  onCreateNew: () => void;
}

export const RestoreAccountModal = ({
  visible,
  scheduledPurgeDate,
  onRestore,
  onCreateNew,
}: RestoreAccountModalProps) => {
  const formattedDate = scheduledPurgeDate
    ? new Date(scheduledPurgeDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "30 days";

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.iconCircle}>
            <Ionicons name="refresh-circle" size={40} color="#0284C7" />
          </View>

          <Text style={styles.title}>Account Scheduled for Deletion</Text>
          <Text style={styles.subtitle}>
            This account is currently deactivated. You have until{" "}
            <Text style={styles.highlight}>{formattedDate}</Text> to restore
            your profile data, history, and active listings before it is
            permanently purged.
          </Text>

          <View style={styles.buttonStack}>
            <TouchableOpacity
              style={styles.restoreBtn}
              onPress={onRestore}
              activeOpacity={0.8}
            >
              <Text style={styles.restoreText}>Yes, Restore My Account</Text>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.createNewBtn}
              onPress={onCreateNew}
              activeOpacity={0.8}
            >
              <Text style={styles.createNewText}>
                Discard & Create New Account
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: { elevation: 12 },
    }),
  },
  iconCircle: {
    backgroundColor: "#F0F9FF",
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 19,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#475569",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  highlight: {
    color: "#0284C7",
    fontWeight: "600",
  },
  buttonStack: {
    width: "100%",
    gap: 12,
  },
  restoreBtn: {
    flexDirection: "row",
    backgroundColor: "#0284C7",
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    width: "100%",
  },
  restoreText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  createNewBtn: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  createNewText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "600",
  },
});
