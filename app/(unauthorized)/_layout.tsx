import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";
import { Colors } from "../../constants/Theme";
import { ScreenHeader } from "@/components/ScreenHeader";
export default function UnauthorizedLayout() {
  return (
    <SafeAreaView style={styles.safeContainer} edges={["bottom"]}>
      <Stack
        screenOptions={{
          headerShown: true,
          header: ({ options, route }) => (
            <ScreenHeader title={options.title || route.name} />
          ),
        }}
      >
        <Stack.Screen name="login" options={{ title: "Login" }} />
        <Stack.Screen name="register" options={{ title: "Create Account" }} />
        <Stack.Screen
          name="forgot-password"
          options={{ title: "Reset Password" }}
        />
      </Stack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    // 🌟 Set your primary background color here so your layout views never change color or flash white
    backgroundColor: Colors.white,
  },
});
