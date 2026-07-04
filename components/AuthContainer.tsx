import React from "react";
import {
  Text,
  StyleSheet,
  View,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { Colors } from "../constants/Theme";
import { useRouter, Stack } from "expo-router";
import { ErrorMessage } from "@/components/ErrorMessage";
import { MotiView } from "moti";
import { ScrollViewComponent } from "./ScrollViewComponent";
import { CelebrationOverlay } from "./CelebrationOverlay";

export const AuthContainer = ({
  apiMessage,
  children,
  celebration,
  loading,
}) => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isTablet = width > 600;

  return (
    <View style={styles.container}>
      {celebration && <CelebrationOverlay visible={celebration} />}

      {apiMessage && <ErrorMessage>{apiMessage}</ErrorMessage>}

      {/* Modern sliding card interface sheet */}
      <MotiView
        from={{ translateY: 40, opacity: 0 }}
        animate={{ translateY: 0, opacity: 1 }}
        transition={{ type: "timing", duration: 400 }}
        style={[
          styles.formCard,
          {
            borderTopLeftRadius: isTablet ? 48 : 36,
            borderTopRightRadius: isTablet ? 48 : 36,
          },
        ]}
      >
        <ScrollViewComponent
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled" // Immersive touch typing experience dismissals
        >
          {children}
        </ScrollViewComponent>
      </MotiView>
      {loading && (
        <View style={styles.globalLockOverlay}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.lockText}>Please wait...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.headerOne[1] },

  blueHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24, // Uses content metrics instead of rigid device fractions
  },

  headerContent: {
    flexDirection: "row",
    alignItems: "center",
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  headerTitleInline: {
    fontWeight: "800",
    color: Colors.white,
    flex: 1, // Ensures titles wrapping safely on small viewports
  },

  formCard: {
    flex: 1,
    backgroundColor: Colors.white,
  },

  scrollContent: {
    paddingBottom: 40,
    alignItems: "center",
  },

  globalLockOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  lockText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "600",
    color: "#0077b6",
  },
});
