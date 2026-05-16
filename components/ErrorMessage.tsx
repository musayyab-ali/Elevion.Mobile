import { View, Text, StyleSheet } from "react-native";
import { Colors } from "../constants/Theme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
export const ErrorMessage = ({ children, style }) => (
  <View style={styles.errorOverlay}>
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
