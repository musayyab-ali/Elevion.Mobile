import { Stack, SplashScreen, useRouter, useSegments } from "expo-router"; // Add useRouter and useSegments
import { AuthProvider, useAuth } from "../store/AuthContext";
import { AddressProvider } from "../store/AddressContext";
import { WishlistProvider } from "../store/WishlistContext";
import { CartProvider } from "../store/CartContext";
import { AnimatedSplash } from "../components/AnimatedSplash";
import { View, StyleSheet } from "react-native";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Colors } from "../constants/Theme";
SplashScreen.preventAutoHideAsync();

function RootStack() {
  const { isAuthenticated, isAppReady } = useAuth();
  const segments = useSegments(); // This tells us where the user is (e.g., "(tabs)")
  const router = useRouter();

  console.log("Auth State Changed: isAuthenticated =", isAuthenticated);

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    if (!isAppReady) return;

    const inAuthGroup = segments[0] === "(tabs)";

    if (isAuthenticated && !inAuthGroup) {
      console.log("Redirecting to (tabs) because user is authenticated");
      router.replace("/(tabs)");
    } else if (!isAuthenticated && inAuthGroup) {
      console.log(
        "Redirecting to (unauthorized)/welcome because user is not authenticated",
      );
      router.replace("/(unauthorized)/welcome");
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
    <SafeAreaProvider style={styles.providerContainer}>
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
          <Stack.Screen
            name="(unauthorized)"
            options={{ animation: "slide_from_right" }}
          />
        )}
      </Stack>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  providerContainer: {
    flex: 1,
    backgroundColor: Colors.headerOne[0],
  },
});

export default function RootLayout() {
  return (
    <AuthProvider>
      <AddressProvider>
        <WishlistProvider>
          <CartProvider>
            <RootStack />
          </CartProvider>
        </WishlistProvider>
      </AddressProvider>
    </AuthProvider>
  );
}
