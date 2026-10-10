import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { timeAgo } from "../services/cache/offlineCache";

/** Tells the customer that what they see is a saved copy, and how old it is. */
export const OfflineBanner = ({ since }: { since: number | null }) => {
  if (!since) return null;
  return (
    <View style={styles.box} accessibilityRole="alert">
      <Ionicons name="cloud-offline-outline" size={18} color="#92400E" />
      <Text style={styles.text}>
        You are offline. Showing information saved {timeAgo(since)}. Pull down to try again.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEF3C7",
    borderColor: "#FDE68A",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  text: { flex: 1, fontSize: 12.5, color: "#92400E", lineHeight: 18 },
});
