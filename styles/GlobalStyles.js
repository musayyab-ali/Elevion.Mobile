import { StyleSheet } from "react-native";

export const Theme = {
  primary: "#3490dc", // Your brand blue
  background: "#F8FAFC",
  text: "#1E293B",
  white: "#FFFFFF",
  radius: 12,
};

export const GlobalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.background,
    padding: 20,
  },
  card: {
    backgroundColor: Theme.white,
    borderRadius: Theme.radius,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 3,
  },
});
