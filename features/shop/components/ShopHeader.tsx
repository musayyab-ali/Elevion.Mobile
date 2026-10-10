import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../../constants/Theme";
import { AddressModal } from "@/features/customer/components/AddressModal";
import { useAddress } from "@/features/customer/hooks/useAddress";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/store/AuthContext";
import { useSharedCartData } from "@/store/CartContext";
const { width } = Dimensions.get("window");

export const ShopHeader = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { cartCount } = useSharedCartData();
  const [userName, setUserName] = useState("Customer");
  const { activeAddress, saveActiveAddress, loading } = useAddress();
  const [showAddressModal, setShowAddressModal] = useState(false);
  const blinkAnim = useRef(new Animated.Value(0)).current;

  // 1. Safe Isolated Loop Animation Lifecycle Management
  useEffect(() => {
    const animationLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );

    animationLoop.start();

    // Clean up loop immediately if the user leaves or switches screens
    return () => animationLoop.stop();
  }, [blinkAnim]);

  useFocusEffect(
    React.useCallback(() => {
      const refreshVisibleUserData = async () => {
        try {
          // const name = await SecureStore.getItemAsync("user_name");
          const name = user?.UserName;
          if (name) setUserName(name);
        } catch (err) {
          console.log("Error loading username from SecureStore", err);
        }
      };

      refreshVisibleUserData();
    }, []),
  );

  return (
    <LinearGradient
      colors={[Colors.headerOne[0], Colors.headerOne[1]]}
      style={[styles.headerContainer, { paddingTop: insets.top + 10 }]}
    >
      {/* <View style={[styles.headerContainer, { paddingTop: insets.top + 10 }]}> */}
      <View style={styles.headerContent}>
        {/* LEFT VIEW: USER PROFILE & TARGET ADDRESS SELECTION */}
        <View style={styles.leftHeader}>
          <Text style={styles.userSmallText}>{userName}</Text>

          <View style={styles.addressRow}>
            <Animated.View
              style={[styles.blinkCircle, { opacity: blinkAnim }]}
            />

            {loading ? (
              <ActivityIndicator
                size="small"
                color="#FFF"
                style={{ marginLeft: 4 }}
              />
            ) : (
              <Text style={styles.addressText} numberOfLines={1}>
                {activeAddress?.Address || "No address added"}
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.addressBtn}
            onPress={() => setShowAddressModal(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.addressBtnText} numberOfLines={1}>
              {activeAddress ? "Change Address" : "Select Address"}
            </Text>
            <Ionicons
              name={activeAddress ? "repeat" : "chevron-forward"}
              size={12}
              color={Colors.white || "#FFF"}
            />
          </TouchableOpacity>
        </View>

        {/* RIGHT VIEW: NAVIGATION SHORTCUT ACTION BUTTONS */}
        <View style={styles.rightHeader}>
          <TouchableOpacity
            style={styles.iconCircle}
            onPress={() => router.push("/(product)/search")}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Search products"
          >
            <Ionicons name="search" size={22} color={Colors.white || "#FFF"} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconCircle}
            onPress={() => router.push("/(cart)/cart")}
            activeOpacity={0.8}
          >
            <Ionicons name="cart" size={22} color={Colors.white || "#FFF"} />
            {cartCount > 0 && (
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* GLOBAL MOUNTED DIALOG MODAL OBJECT */}
      <AddressModal
        visible={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSelectAddress={(addr) => saveActiveAddress(addr)}
      />
      {/* </View> */}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: Colors.headerOne?.[1],
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  leftHeader: { flex: 1 },
  userSmallText: {
    color: Colors.white || "#FFF",
    fontSize: 12,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    minHeight: 18,
  },
  blinkCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success || "#22C55E",
    marginRight: 6,
  },
  addressText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    fontWeight: "700",
    maxWidth: width * 0.55,
  },
  addressBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  addressBtnText: {
    color: Colors.white || "#FFF",
    fontSize: 11,
    fontWeight: "600",
    marginRight: 4,
  },
  rightHeader: { flexDirection: "row", alignItems: "center" },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  badgeContainer: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#FF3B30", // Professional iOS-style vibrant red
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
});
