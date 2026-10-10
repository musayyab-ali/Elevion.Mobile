import React from "react";
import { View, StyleSheet, Dimensions, StyleProp, ViewStyle } from "react-native";
import { Colors } from "../../../constants/Theme";
import { MotiView } from "moti";

const { width } = Dimensions.get("window");
import { Skeleton } from "moti/skeleton";
export const CategorySkeleton = ({ style }: { style?: StyleProp<ViewStyle> }) => {
  return (
    <MotiView
      from={{ opacity: 0.6 }}
      animate={{ opacity: 1 }}
      transition={{
        type: "timing",
        duration: 1000,
        loop: true,
        repeatReverse: true,
      }}
      style={[styles.card, style]}
    >
      <View style={styles.imageFrame}>
        <Skeleton colorMode="light" width="100%" height={110} radius={12} />
      </View>
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
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },

  imageFrame: {
    width: "100%",
    height: 110,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#F8FAFC",
  },
  info: { padding: 12, gap: 8 },
  line: { height: 12, backgroundColor: "#CBD5E1", borderRadius: 4 },
});
