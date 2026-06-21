import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MotiView } from "moti";
import { Colors } from "@/constants/Theme";

// Define the component properties
interface PremiumGuestGateProps {
  screenType: "wishlist" | "orders" | "profile";
}

// Centralized configuration data for each screen type
const SCREEN_CONFIG = {
  wishlist: {
    icon: "heart" as const,
    iconColor: Colors.darkError,
    badgeText: "MEMBER PRIVILEGE",
    title: "Elevate Your Experience",
    subtitle:
      "Join our premium shopping community to curate personalized collections.",
  },
  orders: {
    icon: "list" as const,
    iconColor: Colors.headerOne[0], // Elegant brand blue accent for profile context
    badgeText: "GO TO AUTHORIZED ACCESS",
    title: "Track Your Orders",
    subtitle:
      "Sign in to track real-time order history, manage payment profiles, and order details with ease.",
  },
  profile: {
    icon: "person" as const,
    iconColor: Colors.primary, // Elegant brand blue accent for profile context
    badgeText: "EXCLUSIVE ACCESS",
    title: "Unlock Your Profile",
    subtitle:
      "Sign in to securely manage your profile and customize app configurations.",
  },
};

export function PremiumGuestGate({ screenType }: PremiumGuestGateProps) {
  const router = useRouter();
  const config = SCREEN_CONFIG[screenType];

  return (
    <View style={styles.premiumGuestCanvas}>
      {/* Dynamic Background Ambient Glow Elements */}
      <View style={[styles.ambientBlurOrb, styles.orbOne]} />
      <View style={[styles.ambientBlurOrb, styles.orbTwo]} />

      <MotiView
        from={{ opacity: 0, scale: 0.94, translateY: 20 }}
        animate={{ opacity: 1, scale: 1, translateY: 0 }}
        transition={{ type: "spring", damping: 15, stiffness: 100 }}
        style={styles.guestGlassCard}
      >
        {/* Luxury Micro-Badge Header */}
        <View
          style={[
            styles.exclusiveBadge,
            {
              backgroundColor:
                screenType === "wishlist" ? "#FEF2F2" : "#EFF6FF",
              borderColor: screenType === "wishlist" ? "#FEE2E2" : "#DBEAFE",
            },
          ]}
        >
          <Ionicons
            name="sparkles"
            size={12}
            color={config.iconColor}
            style={{ marginRight: 4 }}
          />
          <Text
            style={[styles.exclusiveBadgeText, { color: config.iconColor }]}
          >
            {config.badgeText}
          </Text>
        </View>

        {/* Layered Neumorphic Glow Icon Module */}
        <View
          style={[
            styles.premiumIconRing,
            {
              backgroundColor:
                screenType === "wishlist" ? "#FFF1F2" : "#EFF6FF",
              shadowColor: config.iconColor,
            },
          ]}
        >
          <View style={styles.innerIconCore}>
            <Ionicons name={config.icon} size={28} color={config.iconColor} />
          </View>
        </View>

        {/* Editorial Layout Typography */}
        <Text style={styles.premiumGuestTitle}>{config.title}</Text>

        <Text style={styles.premiumGuestSubtitle}>{config.subtitle}</Text>

        {/* High-Contrast Interactive CTA Pill */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push("/(unauthorized)/login")}
          style={[
            styles.premiumAuthPill,
            screenType === "wishlist" && { backgroundColor: Colors.darkError },
            screenType === "orders" && { backgroundColor: Colors.headerOne[0] },
            screenType === "profile" && { backgroundColor: Colors.primary },
          ]}
        >
          <Text style={styles.premiumAuthPillText}>
            Sign In / Create Account
          </Text>
          <View style={styles.pillArrowCircle}>
            <Ionicons name="arrow-forward" size={14} color="#0F172A" />
          </View>
        </TouchableOpacity>

        {/* Trust Infrastructure Signature */}
        <View style={styles.trustFooterRow}>
          <Ionicons
            name="shield-checkmark"
            size={12}
            color="#94A3B8"
            style={{ marginRight: 4 }}
          />
          <Text style={styles.secureBadgeText}>
            Secure end-to-end authentication infrastructure
          </Text>
        </View>
      </MotiView>
    </View>
  );
}

const styles = StyleSheet.create({
  premiumGuestCanvas: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    position: "relative",
  },
  ambientBlurOrb: {
    position: "absolute",
    borderRadius: 150,
    opacity: 0.4,
  },
  orbOne: {
    width: 260,
    height: 260,
    backgroundColor: "#DBEAFE",
    top: "15%",
    left: "-10%",
  },
  orbTwo: {
    width: 220,
    height: 220,
    backgroundColor: "#FEE2E2",
    bottom: "20%",
    right: "-5%",
  },
  guestGlassCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
    paddingVertical: 44,
    paddingHorizontal: 28,
    alignItems: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  exclusiveBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 1,
  },
  exclusiveBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  premiumIconRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
  },
  innerIconCore: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  premiumGuestTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: Colors.headerOne[0],
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  premiumGuestSubtitle: {
    fontSize: 14,
    color: "#475569",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 36,
    paddingHorizontal: 6,
  },
  premiumAuthPill: {
    flexDirection: "row",
    // backgroundColor: Colors.primary,
    width: "100%",
    paddingLeft: 24,
    paddingRight: 8,
    paddingVertical: 8,
    borderRadius: 30,
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 24,
  },
  premiumAuthPillText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  pillArrowCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  trustFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  secureBadgeText: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600",
  },
});
