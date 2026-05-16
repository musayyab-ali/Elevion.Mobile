import { Stack } from "expo-router";

export default function UnauthorizedLayout() {
  return (
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
  );
}
