import type { ReactNode } from "react";
import { View, TextInput, Text, StyleSheet, TextInputProps } from "react-native";
import { Colors } from "../constants/Theme";

// components/AppInput.tsx
type AppInputProps = TextInputProps & {
  label: ReactNode;
  error?: string | null;
};

export const AppInput = ({ label, error, ...props }: AppInputProps) => (
  <View style={styles.container}>
    <Text style={styles.label}>{label}</Text>
    <View style={[styles.inputWrapper, error && styles.errorBorder]}>
      <TextInput
        style={styles.input}
        placeholderTextColor="#94a3b8"
        {...props}
      />
    </View>
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: { marginBottom: 15 },
  label: {
    fontSize: 14,
    color: "#334155",
    fontWeight: "600",
    marginBottom: 6,
    marginLeft: 10,
  },
  inputWrapper: {
    backgroundColor: "#F8FAFC",
    borderRadius: 30, // Highly rounded
    paddingHorizontal: 20,
    height: 52,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    justifyContent: "center",
  },
  input: { color: "#1e293b", fontSize: 15 },
  errorBorder: { borderColor: Colors.error },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 15,
  },
});
