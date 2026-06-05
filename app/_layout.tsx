import { Stack, SplashScreen } from "expo-router";
import { AuthProvider, useAuth } from "../store/AuthContext";
import { AddressProvider } from "../store/AddressContext";
import { WishlistProvider } from "../store/WishlistContext";
import { CartProvider } from "../store/CartContext";
import { StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Colors } from "../constants/Theme";
import * as SecureStore from "expo-secure-store";
import { GlobalCartBanner } from "@/components/GlobalCartBanner";

// 🔒 Hold the native app splash screen locked over the screen
SplashScreen.preventAutoHideAsync();

function RootStack() {
  const { isAppReady } = useAuth();
  const [checkingLaunch, setCheckingLaunch] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);

  // Determine the launch status while the native splash screen remains visible
  useEffect(() => {
    async function determineNavigationFlow() {
      if (!isAppReady) return;

      try {
        // await SecureStore.deleteItemAsync("HAS_LAUNCHED");
        const hasLaunched = await SecureStore.getItemAsync("HAS_LAUNCHED");
        if (hasLaunched === null) {
          setIsFirstLaunch(true);
        } else {
          setIsFirstLaunch(false);
        }
      } catch (error) {
        console.error("Failed to read launch storage keys:", error);
        setIsFirstLaunch(false);
      } finally {
        setCheckingLaunch(false);
      }
    }

    determineNavigationFlow();
  }, [isAppReady]);

  // 🏁 Drop the native splash veil ONLY after the layout engine mounts the initial route
  const handleLayoutReady = () => {
    if (!checkingLaunch && isFirstLaunch !== null) {
      SplashScreen.hideAsync();
    }
  };

  // Keep the native splash screen visible by returning nothing until states are ready
  if (!isAppReady || checkingLaunch || isFirstLaunch === null) {
    return null;
  }

  return (
    <SafeAreaProvider style={styles.providerContainer}>
      <Stack
        initialRouteName={isFirstLaunch ? "welcome" : "(tabs)"}
        screenOptions={{ headerShown: false }}
        screenListeners={{
          state: () => {
            // Trigger splash hide the millisecond the navigator completes its first rendering state step
            handleLayoutReady();
          },
        }}
      >
        {/* Onboarding Welcome Screen layout */}
        <Stack.Screen name="welcome" options={{ animation: "fade" }} />

        {/* Main Public/Private Application Interface */}
        <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
        <Stack.Screen
          name="(unauthorized)"
          options={{ animation: "slide_from_bottom" }}
        />
      </Stack>
      <GlobalCartBanner />
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
