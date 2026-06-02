import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { Colors } from "@/constants/Theme";

interface EmptyStateProps {
  iconName: keyof typeof Ionicons.images | string;
  title: string;
  description: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

export const EmptyState = ({
  iconName,
  title,
  description,
  actionLabel,
  onActionPress,
}: EmptyStateProps) => {
  return (
    <View style={styles.centerCanvas}>
      {/* Smooth scaling entrance animation for the illustration block */}
      <MotiView
        from={{ opacity: 0, scale: 0.9, translateY: 15 }}
        animate={{ opacity: 1, scale: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 500 }}
        style={styles.container}
      >
        {/* Modern Glassmorphic Soft Circle Background for Icon */}
        <View style={styles.iconCircle}>
          <Ionicons name={iconName as any} size={42} color="#64748B" />
        </View>

        {/* Informational Copy Hierarchy */}
        <Text style={styles.titleText}>{title}</Text>
        <Text style={styles.descriptionText}>{description}</Text>

        {/* Action Button (Shows only if onActionPress is passed) */}
        {actionLabel && onActionPress && (
          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.8}
            onPress={onActionPress}
          >
            <Ionicons
              name="refresh-outline"
              size={16}
              color="#FFFFFF"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.actionText}>{actionLabel}</Text>
          </TouchableOpacity>
        )}
      </MotiView>
    </View>
  );
};

const styles = StyleSheet.create({
  centerCanvas: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
    paddingVertical: 60,
    width: "100%",
  },
  container: {
    alignItems: "center",
    width: "100%",
  },
  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "rgba(148, 163, 184, 0.12)", // Premium subtle glass look
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.08)",
  },
  titleText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B", // Deep charcoal slate
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  descriptionText: {
    fontSize: 14,
    color: "#64748B", // Soft cool muted gray
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  actionButton: {
    flexDirection: "row",
    backgroundColor: Colors.accent, // Brand primary color
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 24, // Pill shape button
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  actionText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
