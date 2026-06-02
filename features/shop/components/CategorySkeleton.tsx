import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { Colors } from "../../../constants/Theme";
import { MotiView } from "moti";

const { width } = Dimensions.get("window");

export const CategorySkeleton = ({ style }) => {
  return (
    <MotiView
      from={{ opacity: 0.4 }}
      animate={{ opacity: 0.8 }}
      transition={{ type: "timing", duration: 800, loop: true }}
      style={[styles.card, style]}
    >
      <View style={styles.imagePlaceholder} />
      <View style={styles.info}>
        <View style={styles.line} />
        <View style={[styles.line, { width: "60%" }]} />
      </View>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  card: {
    width: (width - 45) / 2,
    height: 190,
    backgroundColor: "#E2E8F0",
    borderRadius: 16,
    marginBottom: 15,
    opacity: 0.6,
  },
  imagePlaceholder: {
    height: 130,
    backgroundColor: "#CBD5E1",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  info: { padding: 12, gap: 8 },
  line: { height: 12, backgroundColor: "#CBD5E1", borderRadius: 4 },
});
