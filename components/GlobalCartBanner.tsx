import React, { useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useSharedCartData } from "@/store/CartContext";
import { useRouter, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MotiView, AnimatePresence } from "moti";
import { Colors } from "@/constants/Theme";
const { width } = Dimensions.get("window");

export function GlobalCartBanner() {
  const { cartData, showCartBanner, dismissCartBanner, isCartBannerDismissed } =
    useSharedCartData();
  const router = useRouter();
  const pathname = usePathname();

  const count = cartData?.CartItemList?.length || 0;
  const isProductDetailsScreen = pathname.includes("product-details");

  if (count === 0) return null;

  return (
    <AnimatePresence>
      {/* CASE 1: The Toast Notification Active Banner */}
      {showCartBanner && (
        <MotiView
          // Smooth layout slide animation configuration based on current active screen Matrix
          from={{
            opacity: 0,
            translateY: isProductDetailsScreen ? -50 : 100,
            translateX: isProductDetailsScreen ? width * 0.4 : 0,
          }}
          animate={{
            opacity: 1,
            translateY: 0,
            translateX: 0,
          }}
          exit={{
            opacity: 0,
            translateY: isProductDetailsScreen ? -30 : 100,
            translateX: isProductDetailsScreen ? width * 0.2 : 0,
          }}
          transition={{ type: "spring" }}
          style={[
            styles.floatingContainer,
            isProductDetailsScreen
              ? styles.topRightToastContainer
              : styles.bottomStandardContainer,
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            style={[
              styles.interactiveCard,
              isProductDetailsScreen
                ? styles.productDetailsCardVariant
                : styles.standardCardVariant,
            ]}
            onPress={() => router.push("/(cart)/cart")}
          >
            <View style={styles.contentLeftRow}>
              <View style={styles.iconPillFrame}>
                <Ionicons name="cart" size={18} color="#FFFFFF" />
                <View style={styles.badgeIndicatorCircle}>
                  <Text style={styles.badgeIndicatorText}>{count}</Text>
                </View>
              </View>

              <View style={styles.textStackFrame}>
                <Text style={styles.bannerHeadline}>
                  {count === 1 ? "Added to Cart" : `${count} Items in Cart`}
                </Text>
                <Text style={styles.bannerActionPrompt}>
                  Tap to view checkout
                </Text>
              </View>
            </View>

            <View style={styles.rightActionControl}>
              <Ionicons
                name="arrow-forward"
                size={16}
                color="#FFFFFF"
                style={{ marginRight: 8 }}
              />

              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.closeTouchTarget}
                onPress={(e) => {
                  e.stopPropagation();
                  dismissCartBanner();
                }}
              >
                <Ionicons
                  name="close"
                  size={16}
                  color="rgba(255,255,255,0.6)"
                />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </MotiView>
      )}

      {/* CASE 2: The Morphing Professional Floating Cart Button Layout */}
      {/* Shows exclusively on Product Details when the top notification banner is closed */}
      {!showCartBanner && isProductDetailsScreen && isCartBannerDismissed && (
        <MotiView
          from={{ opacity: 0, scale: 0.5, translateY: 20 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ type: "timing" }}
          style={styles.compactFloatingCartButtonContainer}
        >
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.compactCartButton}
            onPress={() => router.push("/(cart)/cart")}
          >
            <Ionicons name="cart" size={24} color="#FFFFFF" />
            <View style={styles.compactBadgeIndicator}>
              <Text style={styles.badgeIndicatorText}>{count}</Text>
            </View>
          </TouchableOpacity>
        </MotiView>
      )}
    </AnimatePresence>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: "absolute",
    zIndex: 999,
  },
  bottomStandardContainer: {
    bottom: 90,
    left: 16,
    right: 16,
  },
  topRightToastContainer: {
    bottom: 100, // Safely anchors right below typical status bar levels
    right: 16,
    width: width * 0.75, // Keeps it compact and clean as a modern notification card
  },
  interactiveCard: {
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  standardCardVariant: {
    backgroundColor: "#0F172A",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  productDetailsCardVariant: {
    backgroundColor: Colors.accent, // Sleek, professional Royal Blue styling requested by client
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  contentLeftRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconPillFrame: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    marginRight: 10,
  },
  badgeIndicatorCircle: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#EF4444",
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 2,
  },
  badgeIndicatorText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "900",
  },
  textStackFrame: {
    flex: 1,
    justifyContent: "center",
  },
  bannerHeadline: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  bannerActionPrompt: {
    color: "rgba(255, 255, 255, 0.75)",
    fontSize: 10,
    fontWeight: "500",
  },
  rightActionControl: {
    flexDirection: "row",
    alignItems: "center",
  },
  closeTouchTarget: {
    padding: 6,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 8,
  },
  // Compact Floating Action Button Stylesheet Allocation
  compactFloatingCartButtonContainer: {
    position: "absolute",
    bottom: 100,
    right: 20,
    zIndex: 999,
  },
  compactCartButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent, // Matches the professional blue theme setup
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  compactBadgeIndicator: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "#EF4444",
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
