import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../constants/Theme";
import { MotiView } from "moti";
export const CustomErrorMessage = ({ children, style }) => (
  <MotiView
    from={{ opacity: 0, translateY: -20 }}
    animate={{ opacity: 1, translateY: 0 }}
    style={[styles.errorOverlay, style]}
  >
    <Text
      style={{
        color: "#FFFFFF",
        fontWeight: "600",
        fontSize: 14,
        flex: 1,
        textAlign: "center",
      }}
    >
      {children}
    </Text>
  </MotiView>
);

const styles = StyleSheet.create({
  errorOverlay: {
    position: "absolute",
    top: 20,
    // bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#EF4444",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: "center",
    zIndex: 999,
  },
});
