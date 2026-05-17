import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../../constants/Theme";
import { AddressModal } from "@/features/customer/components/AddressModal";
import { useAddress } from "@/features/customer/hooks/useAddress";

const { width } = Dimensions.get("window");

export const ShopHeader = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [userName, setUserName] = useState("Customer");
  const { addresses, activeAddress, saveActiveAddress } = useAddress();
  const [showAddressModal, setShowAddressModal] = useState(false);
  const blinkAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    const getUserData = async () => {
      const name = await SecureStore.getItemAsync("user_name");
      if (name) setUserName(name);
    };
    getUserData();
  }, []);

  return (
    <View style={[styles.headerContainer, { paddingTop: insets.top + 10 }]}>
      <View style={styles.headerContent}>
        <View style={styles.leftHeader}>
          {/* <Text style={styles.userSmallText}>{userName}</Text> */}
          <Text style={styles.userSmallText}>Waseem Khan</Text>
          <View style={styles.addressRow}>
            <Animated.View
              style={[styles.blinkCircle, { opacity: blinkAnim }]}
            />
            <Text style={styles.addressText} numberOfLines={1}>
              {activeAddress?.Address || "No address added"}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addressBtn}
            onPress={() => setShowAddressModal(true)}
          >
            <Text style={styles.addressBtnText} numberOfLines={1}>
              {activeAddress ? "Change Address" : "Select Address"}
            </Text>
            <Ionicons
              name={activeAddress ? "repeat" : "chevron-forward"}
              size={12}
              color={Colors.primary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.rightHeader}>
          <TouchableOpacity
            style={styles.iconCircle}
            onPress={() => router.push("/search")}
          >
            <Ionicons name="search-outline" size={22} color={Colors.white} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconCircle}
            onPress={() => router.push("/profile")}
          >
            <Ionicons name="person-outline" size={22} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>
      <AddressModal
        visible={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSelectAddress={(addr) => saveActiveAddress(addr)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: Colors.headerOne[0],
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
    color: Colors.white,
    fontSize: 12,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  addressRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  blinkCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
    marginRight: 6,
  },
  addressText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    fontWeight: "700",
    maxWidth: width * 0.5,
  },
  addressBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  addressBtnText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: "600",
    marginRight: 2,
  },
  rightHeader: { flexDirection: "row", alignItems: "center" },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
});
