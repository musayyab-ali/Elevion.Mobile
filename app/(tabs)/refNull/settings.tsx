import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/Theme";
import { useAccountSettings } from "../../../features/customer/hooks/useAccountSettings";
import { useAddress } from "../../../features/customer/hooks/useAddress";
import { useSettings } from "../../../features/customer/hooks/useSettings";
import { AddressModal } from "../../../features/customer/components/AddressModal";
import { useRouter } from "expo-router";

const SettingsScreen = () => {
  const router = useRouter();
  const { confirmDeactivation, loading: deactivating } = useAccountSettings();
  const { activeAddress, saveActiveAddress } = useAddress();
  const { loading: settingsLoading, handleLogout } = useSettings();
  const [showAddressModal, setShowAddressModal] = useState(false);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* SECTION 1: ADDRESS MANAGEMENT */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <View style={styles.addressCard}>
            <View style={styles.addressInfo}>
              <Ionicons name="location" size={22} color={Colors.primary} />
              <Text style={styles.addressText} numberOfLines={2}>
                {activeAddress?.Address || "No address selected"}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.changeBtn}
              onPress={() => setShowAddressModal(true)}
            >
              <Text style={styles.changeBtnText}>
                {activeAddress ? "Change" : "Add Address"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons
              name="log-out-outline"
              size={20}
              color={Colors.textMain}
            />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* SECTION 4: DANGER ZONE */}
        <View style={styles.dangerZone}>
          <Text style={styles.dangerTitle}>Danger Zone</Text>
          <TouchableOpacity
            style={styles.deactivateBtn}
            onPress={confirmDeactivation}
            disabled={deactivating}
          >
            {deactivating ? (
              <ActivityIndicator color={Colors.error} />
            ) : (
              <>
                <Ionicons name="trash-outline" size={20} color={Colors.error} />
                <Text style={styles.deactivateText}>Deactivate My Account</Text>
              </>
            )}
          </TouchableOpacity>
          <Text style={styles.infoText}>
            Deactivating your account will hide your profile. You can reactivate
            anytime by logging in.
          </Text>
        </View>
      </ScrollView>

      <AddressModal
        visible={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSelectAddress={(addr) => saveActiveAddress(addr)}
      />
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: Colors.headerOne[0],
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: Colors.white },
  scrollContent: { padding: 20, paddingBottom: 120 },

  section: { marginBottom: 25 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 12,
  },

  addressCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  addressInfo: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  addressText: { fontSize: 14, color: "#475569", fontWeight: "500" },
  changeBtn: {
    backgroundColor: "#F1F5F9",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  changeBtnText: { color: Colors.primary, fontSize: 12, fontWeight: "700" },

  optionCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionName: { fontSize: 15, fontWeight: "600", color: Colors.textMain },
  optionDays: { fontSize: 12, color: "#94A3B8", marginTop: 2 },
  optionPrice: { fontSize: 15, fontWeight: "700", color: Colors.primary },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
  },
  logoutText: { fontSize: 15, fontWeight: "600", color: Colors.textMain },

  dangerZone: {
    marginTop: 20,
    borderTopWidth: 1,
    borderColor: "#E2E8F0",
    paddingTop: 20,
  },
  dangerTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748B",
    marginBottom: 15,
    textTransform: "uppercase",
  },
  deactivateBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 15,
    borderRadius: 12,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  deactivateText: { color: Colors.error, fontWeight: "600", fontSize: 15 },
  infoText: { marginTop: 12, fontSize: 12, color: "#94A3B8", lineHeight: 18 },
});
