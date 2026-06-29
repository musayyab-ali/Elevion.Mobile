import { Stack, SplashScreen } from "expo-router";
import { AuthProvider, useAuth } from "../store/AuthContext";
import { AddressProvider } from "../store/AddressContext";
import { WishlistProvider } from "../store/WishlistContext";
import { CartProvider } from "../store/CartContext";
import { StyleSheet, View, Text, Modal, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Colors } from "../constants/Theme";
import * as SecureStore from "expo-secure-store";
import { GlobalCartBanner } from "@/components/GlobalCartBanner";
import { Ionicons } from "@expo/vector-icons";
import { DirectLoginModal } from "@/components/DirectLoginModal";
SplashScreen.preventAutoHideAsync();

function RootStack() {
  const {
    isAppReady,
    isAuthSettled,
    isAuthenticated,
    forceLogoutTriggered,
    clearForceLogoutFlag,
  } = useAuth();
  const [checkingLaunch, setCheckingLaunch] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  useEffect(() => {
    async function determineNavigationFlow() {
      if (!isAppReady || !isAuthSettled) return;
      try {
        const hasLaunched = await SecureStore.getItemAsync("HAS_LAUNCHED");
        setIsFirstLaunch(hasLaunched === null);
      } catch (error) {
        console.log("Failed to read launch storage keys:", error);
        setIsFirstLaunch(false);
      } finally {
        setCheckingLaunch(false);
      }
    }
    determineNavigationFlow();
  }, [isAppReady, isAuthSettled]);

  const handleLayoutReady = () => {
    if (!checkingLaunch && isFirstLaunch !== null && isAuthSettled) {
      SplashScreen.hideAsync();
    }
  };

  // Block rendering until data initialization is complete
  if (
    !isAppReady ||
    !isAuthSettled ||
    checkingLaunch ||
    isFirstLaunch === null
  ) {
    return null;
  }

  return (
    <SafeAreaProvider style={styles.providerContainer}>
      <View style={{ flex: 1 }} key={`app-state-sync-${isAuthenticated}`}>
        <AddressProvider>
          <WishlistProvider>
            <CartProvider>
              <Stack
                initialRouteName={isFirstLaunch ? "welcome" : "(tabs)"}
                screenOptions={{ headerShown: false }}
                screenListeners={{
                  state: () => {
                    handleLayoutReady();
                  },
                }}
              >
                <Stack.Screen name="welcome" options={{ animation: "fade" }} />
                <Stack.Screen name="(tabs)" options={{ animation: "fade" }} />
                <Stack.Screen
                  name="(unauthorized)"
                  options={{ animation: "slide_from_bottom" }}
                />
                <Stack.Screen
                  name="(product)"
                  options={{ animation: "simple_push" }}
                />

                <Stack.Screen
                  name="(cart)"
                  options={{ animation: "simple_push" }}
                />

                <Stack.Screen
                  name="(refNull)"
                  options={{ animation: "ios_from_right" }}
                />
              </Stack>

              <GlobalCartBanner />
              <DirectLoginModal />

              {/* Session Expired / Token Force Logout Global Banner alert Component */}
              <Modal
                visible={forceLogoutTriggered === "session_expired"}
                transparent
                animationType="fade"
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.alertBox}>
                    <Ionicons name="time-outline" size={44} color="#EF4444" />
                    <Text style={styles.alertTitle}>Session Expired</Text>
                    <Text style={styles.alertMessage}>
                      Please log back in to secure your data and continue
                      shopping.
                    </Text>
                    <TouchableOpacity
                      style={styles.alertBtn}
                      onPress={clearForceLogoutFlag}
                    >
                      <Text style={styles.alertBtnText}>Dismiss</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </CartProvider>
          </WishlistProvider>
        </AddressProvider>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  providerContainer: {
    flex: 1,
    backgroundColor: Colors.headerOne[0],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  alertBox: {
    width: "80%",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginTop: 12,
    marginBottom: 6,
  },
  alertMessage: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  alertBtn: {
    backgroundColor: "#0077b6",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  alertBtnText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },
});

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootStack />
    </AuthProvider>
  );
}
