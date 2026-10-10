import { View, Text, StyleSheet, StyleProp, ViewStyle } from "react-native";
import type { ReactNode } from "react";
import { Colors } from "../constants/Theme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
type Props = { children: ReactNode; style?: StyleProp<ViewStyle> };

export const ErrorMessage = ({ children, style }: Props) => (
  <View style={[styles.errorOverlay, style]} accessibilityRole="alert">
    <MaterialIcons name="error" size={24} color="white" />
    <Text style={styles.errorOverlayText}>{children}</Text>
  </View>
);

const styles = StyleSheet.create({
  errorOverlay: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: Colors.black,
    padding: 15,
    borderRadius: 12,
    zIndex: 1000,
    elevation: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  errorOverlayText: {
    color: "white",
    fontWeight: "600",
    textAlign: "center",
    flex: 1,
  },
});
