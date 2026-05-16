import { Stack, SplashScreen, useRouter, useSegments } from "expo-router"; // Add useRouter and useSegments
import { AuthProvider, useAuth } from "../store/AuthContext";
import { AddressProvider } from "../store/AddressContext";
import { AnimatedSplash } from "../components/AnimatedSplash";
import { View, StyleSheet } from "react-native";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

function RootStack() {
  const { isAuthenticated, isAppReady } = useAuth();
  const segments = useSegments(); // This tells us where the user is (e.g., "(tabs)")
  const router = useRouter();

  console.log("Auth State Changed: isAuthenticated =", isAuthenticated);

  useEffect(() => {
    // Hide the native splash
    SplashScreen.hideAsync();
  }, []);

  // FORCE REDIRECT LOGIC
  useEffect(() => {
    if (!isAppReady) return;

    const inAuthGroup = segments[0] === "(tabs)";

    if (isAuthenticated && !inAuthGroup) {
      // If logged in but NOT in the tabs, go to tabs
      router.replace("/(tabs)");
    } else if (!isAuthenticated && inAuthGroup) {
      // If NOT logged in but currently IN the tabs, force them to login
      // replace ensures they can't go "back" to the authorized screens
      router.replace("/(unauthorized)/login");
    }
  }, [isAuthenticated, isAppReady, segments]);

  if (!isAppReady) {
    return (
      <View style={StyleSheet.absoluteFill}>
        <AnimatedSplash />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
          <Stack.Screen name="products" options={{ headerShown: true }} />
          <Stack.Screen
            name="product-details"
            options={{ headerShown: true }}
          />
        </>
      ) : (
        // Ensure this name matches your folder name exactly
        <Stack.Screen name="(unauthorized)" options={{ animation: "fade" }} />
      )}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AddressProvider>
        <RootStack />
      </AddressProvider>
    </AuthProvider>
  );
}
