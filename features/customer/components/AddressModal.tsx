import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { AuthGuardModal } from "@/components/AuthGuardModal";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/Theme";
import { useAddress } from "../hooks/useAddress";
import { useAuth } from "@/store/AuthContext";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelectAddress: (address: any) => void;
}

const INITIAL_FORM_STATE = {
  AddressBookId: 0,
  FullName: "",
  PhoneNumber: "",
  IsDefault: true,
  Address: "",
  CityId: 0,
  Longitude: "0.0",
  Latitude: "0.0",
};

export const AddressModal = ({ visible, onClose, onSelectAddress }: Props) => {
  const { isAuthenticated } = useAuth();
  const { addresses, loading, handleSave, handleDelete } = useAddress();
  const [view, setView] = useState<"list" | "form">("list");
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [modalVisible, setModalVisible] = useState(false);

  // Reset form whenever modal changes visibility context state parameters
  useEffect(() => {
    if (!visible) {
      setView("list");
      setFormData(INITIAL_FORM_STATE);
    }
  }, [visible]);

  const onSavePress = async () => {
    if (!formData.FullName || !formData.PhoneNumber || !formData.Address) {
      alert("Please fill in all requested fields safely.");
      return;
    }

    const res = await handleSave(formData);
    if (res?.success) {
      setView("list");
      setFormData(INITIAL_FORM_STATE); // Clear state traces completely
    }
  };

  const handleAddAddressPress = () => {
    if (!isAuthenticated) {
      setModalVisible(true);
      return;
    }
    setView("form");
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          {/* HEADER ROW */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {view === "list" ? "Select Address" : "Add New Address"}
            </Text>
            <TouchableOpacity onPress={onClose} padding-8>
              <Ionicons
                name="close"
                size={24}
                color={Colors.textMain || "#1E293B"}
              />
            </TouchableOpacity>
          </View>

          {view === "list" ? (
            <>
              {loading ? (
                <View style={styles.loaderBox}>
                  <ActivityIndicator
                    size="large"
                    color={Colors.primary || "#E11D48"}
                  />
                </View>
              ) : (
                <FlatList
                  data={addresses}
                  keyExtractor={(item) => item.AddressBookId.toString()}
                  contentContainerStyle={styles.listContainer}
                  ListEmptyComponent={
                    <Text style={styles.emptyText}>
                      No saved delivery destinations located.
                    </Text>
                  }
                  renderItem={({ item }) => (
                    <View style={styles.addressItemRow}>
                      <TouchableOpacity
                        style={styles.addressClickableArea}
                        onPress={() => {
                          onSelectAddress(item);
                          onClose();
                        }}
                      >
                        <Ionicons
                          name={
                            item.IsDefault ? "location" : "location-outline"
                          }
                          size={22}
                          color={Colors.primary || "#E11D48"}
                        />
                        <View style={styles.addressTextWrapper}>
                          <View style={styles.inlineHeader}>
                            <Text style={styles.addressName}>
                              {item.FullName || "Recipient Name"}
                            </Text>
                            {item.IsDefault && (
                              <Text style={styles.defaultBadge}>Default</Text>
                            )}
                          </View>
                          <Text style={styles.addressDetail}>
                            {item.Address}
                          </Text>
                          <Text style={styles.phoneText}>
                            📞 {item.PhoneNumber}
                          </Text>
                        </View>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.deleteBtn}
                        onPress={() => handleDelete(item.AddressBookId)}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={18}
                          color={Colors.error || "#EF4444"}
                        />
                      </TouchableOpacity>
                    </View>
                  )}
                />
              )}
              <TouchableOpacity
                style={styles.addBtn}
                onPress={handleAddAddressPress}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.addBtnText}>Create New Address</Text>
              </TouchableOpacity>
            </>
          ) : (
            /* FORM LOGIC CONTAINER SUBVIEW */
            <View style={styles.form}>
              <TextInput
                placeholder="Full Name"
                placeholderTextColor="#94A3B8"
                style={styles.input}
                value={formData.FullName}
                onChangeText={(t) => setFormData({ ...formData, FullName: t })}
              />
              <TextInput
                placeholder="Phone Number"
                placeholderTextColor="#94A3B8"
                style={styles.input}
                keyboardType="phone-pad"
                value={formData.PhoneNumber}
                onChangeText={(t) =>
                  setFormData({ ...formData, PhoneNumber: t })
                }
              />
              <TextInput
                placeholder="Complete Delivery Address, Street Name, House Number"
                placeholderTextColor="#94A3B8"
                style={[styles.input, styles.textArea]}
                multiline
                numberOfLines={3}
                value={formData.Address}
                onChangeText={(t) => setFormData({ ...formData, Address: t })}
              />

              <View style={styles.formActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setView("list")}
                >
                  <Text
                    style={{
                      color: Colors.error || "#EF4444",
                      fontWeight: "600",
                    }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={onSavePress}>
                  <Text style={{ color: "#fff", fontWeight: "700" }}>
                    Save Address
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </KeyboardAvoidingView>
      </View>
      <AuthGuardModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Account Required"
        subtitle="Create an account to securely save your address across all your devices."
        iconName="home-outline"
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderColor: "#F1F5F9",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#1E293B" },
  loaderBox: { padding: 40, alignItems: "center", justifyContent: "center" },
  listContainer: { paddingBottom: 16 },
  emptyText: {
    textAlign: "center",
    color: "#94A3B8",
    marginVertical: 32,
    fontSize: 14,
  },
  addressItemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "#F8FAFC",
  },
  addressClickableArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  addressTextWrapper: { flex: 1, marginLeft: 12, paddingRight: 8 },
  inlineHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  addressName: { fontWeight: "600", fontSize: 14, color: "#1E293B" },
  defaultBadge: {
    backgroundColor: "#FEF2F2",
    color: "#E11D48",
    fontSize: 10,
    fontWeight: "700",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
  },
  addressDetail: { color: "#475569", fontSize: 13, lineHeight: 18 },
  phoneText: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
  deleteBtn: { padding: 8, justifyContent: "center", alignItems: "center" },
  addBtn: {
    backgroundColor: Colors.darkError,
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  addBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  form: { padding: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    fontSize: 14,
    color: "#1E293B",
    backgroundColor: "#F8FAFC",
  },
  textArea: { height: 90, textAlignVertical: "top" },
  formActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  saveBtn: {
    backgroundColor: Colors.accent,
    padding: 16,
    borderRadius: 12,
    width: "68%",
    alignItems: "center",
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    padding: 16,
    borderRadius: 12,
    width: "28%",
    alignItems: "center",
    justifyContent: "center",
  },
});
