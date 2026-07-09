import { Stack, SplashScreen } from "expo-router";
import { AuthProvider, useAuth } from "../store/AuthContext";
import { AddressProvider } from "../store/AddressContext";
import { WishlistProvider } from "../store/WishlistContext";
import { CartProvider } from "../store/CartContext";
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  Image,
  Animated,
} from "react-native";
import { useEffect, useState, useRef } from "react";
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

  // Custom Loading States
  const [progress, setProgress] = useState(0);
  const [animationComplete, setAnimationComplete] = useState(false);
  const progressBarWidth = useRef(new Animated.Value(0)).current;

  // Step A: Determine configuration flags
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

  // Step B: Drive the 0 to 100 simulation counter
  useEffect(() => {
    if (!checkingLaunch && isFirstLaunch !== null && isAuthSettled) {
      // Instantly drop the background native splash layout because our JS overlay matches it perfectly
      SplashScreen.hideAsync().catch(() => {});

      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += Math.floor(Math.random() * 8) + 4; // Organic loading simulation
        if (currentProgress >= 100) {
          currentProgress = 100;
          clearInterval(interval);

          // Smoothly finish bar transition
          Animated.timing(progressBarWidth, {
            toValue: 100,
            duration: 150,
            useNativeDriver: false,
          }).start(() => {
            setTimeout(() => setAnimationComplete(true), 200);
          });
        }

        setProgress(currentProgress);

        if (currentProgress < 100) {
          Animated.timing(progressBarWidth, {
            toValue: currentProgress,
            duration: 100,
            useNativeDriver: false,
          }).start();
        }
      }, 80);

      return () => clearInterval(interval);
    }
  }, [checkingLaunch, isFirstLaunch, isAuthSettled]);

  // Block rendering tree completely if authentication context isn't parsed
  if (
    !isAppReady ||
    !isAuthSettled ||
    checkingLaunch ||
    isFirstLaunch === null
  ) {
    return null;
  }

  // Show professional overlay screen until progress counter hits 100%
  if (!animationComplete) {
    const widthInterpolate = progressBarWidth.interpolate({
      inputRange: [0, 100],
      outputRange: ["0%", "100%"],
    });

    return (
      <View style={styles.splashOverlayContainer}>
        <View style={styles.splashMainContent}>
          <Image
            source={require("../assets/images/gemini-logo.png")}
            style={styles.splashLogoImage}
            resizeMode="contain"
          />
          <Text style={styles.splashAppNameText}>The Link</Text>
        </View>

        <View style={styles.loadingControlWrapper}>
          <View style={styles.progressBarBackground}>
            <Animated.View
              style={[styles.progressBarFill, { width: widthInterpolate }]}
            />
          </View>
          <Text style={styles.progressPercentageText}>{progress}%</Text>
        </View>
      </View>
    );
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

              {/* Session Expired Alert Modal */}
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
  splashOverlayContainer: {
    flex: 1,
    backgroundColor: "#0077b6", // Matches your app.json background precisely
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 80,
  },
  splashMainContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  splashLogoImage: {
    width: 170,
    height: 170,
  },
  splashAppNameText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  loadingControlWrapper: {
    width: "75%",
    alignItems: "center",
    gap: 10,
  },
  progressBarBackground: {
    width: "100%",
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.24)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 3,
  },
  progressPercentageText: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 14,
    fontWeight: "700",
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
