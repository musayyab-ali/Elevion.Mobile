import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";
import { Colors } from "../../constants/Theme";
export default function UnauthorizedLayout() {
  return (
    <SafeAreaView style={styles.safeContainer} edges={["top", "bottom"]}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="welcome" />
        <Stack.Screen
          name="login"
          options={{ headerShown: true, title: "Login" }}
        />
        <Stack.Screen
          name="register"
          options={{ headerShown: true, title: "Create Account" }}
        />
      </Stack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    // 🌟 Set your primary background color here so your layout views never change color or flash white
    backgroundColor: Colors.headerOne[0],
  },
});
