import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/Theme";

interface AuthGuardModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  iconName: keyof typeof Ionicons.銘; // Ensures valid ionicon names
}

export function AuthGuardModal({
  visible,
  onClose,
  title,
  subtitle,
  iconName,
}: AuthGuardModalProps) {
  const router = useRouter();

  const handleSignIn = () => {
    onClose();
    // 🌟 ROUTE FIX: Route directly to the explicit terminal layout path string
    router.push("/(unauthorized)/login");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.modalContent}>
          {/* Close Window Top Corner Handle */}
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={22} color="#94A3B8" />
          </Pressable>

          {/* Icon Context Ring */}
          <View style={styles.iconCircle}>
            <Ionicons name={iconName as any} size={38} color={Colors.accent} />
          </View>

          {/* Detail Labels */}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          {/* Action Row */}
          <View style={styles.buttonContainer}>
            <Pressable style={[styles.btn, styles.cancelBtn]} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Later</Text>
            </Pressable>

            <Pressable
              style={[styles.btn, styles.actionBtn]}
              onPress={handleSignIn}
            >
              <Text style={styles.actionBtnText}>Sign In</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)", // Luxury premium blur shade
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalContent: {
    width: width > 500 ? 400 : "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    position: "relative",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 4,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "rgba(0, 180, 216, 0.08)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1E293B",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  btn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelBtn: {
    backgroundColor: "#F1F5F9",
  },
  cancelBtnText: {
    color: "#64748B",
    fontWeight: "600",
    fontSize: 14,
  },
  actionBtn: {
    backgroundColor: Colors.accent,
  },
  actionBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
});
