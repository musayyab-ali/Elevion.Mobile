import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useSharedCartData } from "@/store/CartContext";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { MotiView, AnimatePresence } from "moti";

export function GlobalCartBanner() {
  const { cartData, showCartBanner, dismissCartBanner } = useSharedCartData();
  const router = useRouter();

  const count = cartData?.CartItemList?.length || 0;
  if (count === 0) return null;

  return (
    <AnimatePresence>
      {showCartBanner && (
        <MotiView
          from={{ opacity: 0, translateY: 100 }}
          animate={{ opacity: 1, translateY: 0 }}
          exit={{ opacity: 0, translateY: 100 }}
          transition={{ type: "spring" }}
          style={styles.floatingContainer}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.interactiveCard}
            onPress={() => router.push("/(cart)/cart")} // Routes cleanly straight into your cart layout view
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
                  {count === 1
                    ? "1 item added to the cart"
                    : `${count} items inside your cart`}
                </Text>
                <Text style={styles.bannerActionPrompt}>
                  Tap here to visit shopping cart and checkout
                </Text>
              </View>
            </View>

            <View style={styles.rightActionControl}>
              <Ionicons
                name="arrow-forward"
                size={16}
                color="#60A5FA"
                style={{ marginRight: 12 }}
              />

              {/* Manual Close Action Trigger */}
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.closeTouchTarget}
                onPress={(e) => {
                  e.stopPropagation(); // Stop the touch event from navigating to the Cart screen
                  dismissCartBanner();
                }}
              >
                <Ionicons name="close" size={18} color="#94A3B8" />
              </TouchableOpacity>
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
    bottom: 90, // Positions it directly above your floating bottom tab navigation routes
    left: 16,
    right: 16,
    zIndex: 999,
  },
  interactiveCard: {
    backgroundColor: "#0F172A", // Deep obsidian dark-mode card canvas contrast layout
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  contentLeftRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconPillFrame: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    marginRight: 12,
  },
  badgeIndicatorCircle: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#EF4444", // Alert badge identifier color accent
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeIndicatorText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900",
  },
  textStackFrame: {
    flex: 1,
    justifyContent: "center",
  },
  bannerHeadline: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 2,
  },
  bannerActionPrompt: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "500",
  },
  rightActionControl: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 8,
  },
  closeTouchTarget: {
    padding: 6,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 10,
  },
});
