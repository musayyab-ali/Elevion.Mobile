import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from "react-native";
import { Colors } from "../constants/Theme";

interface Props {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline"; // Choose the style
  disabled?: boolean;
  style?: StyleProp<ViewStyle>; // Custom override
}

export const AppButton = ({
  title,
  onPress,
  disabled,
  variant = "primary",
  style,
}: Props) => {
  const isOutline = variant === "outline";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      style={[
        styles.button,
        isOutline ? styles.outlineButton : styles.primaryButton,
        style,
      ]}
    >
      <Text style={[styles.text, isOutline && styles.outlineText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
  },
  primaryButton: { backgroundColor: Colors.primary },
  outlineButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  text: { color: Colors.white, fontWeight: "700", fontSize: 16 },
  outlineText: { color: Colors.primary },
});
