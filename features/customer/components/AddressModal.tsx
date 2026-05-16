import React, { useState } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/Theme";
import { useAddress } from "../hooks/useAddress";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelectAddress: (address: any) => void;
}

export const AddressModal = ({ visible, onClose, onSelectAddress }: Props) => {
  const { addresses, loading, handleSave, handleDelete } = useAddress();
  const [view, setView] = useState<"list" | "form">("list");
  const [formData, setFormData] = useState({
    AddressBookId: 0,
    FullName: "",
    PhoneNumber: "",
    IsDefault: true,
    Address: "",
    Country: "Pakistan",
    CityId: 1, // Defaulting for example
    Longitude: "0",
    Latitude: "0",
  });

  const onSavePress = async () => {
    const res = await handleSave(formData);
    console.log("Save address response:", res);
    if (res?.success) setView("list");
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          {/* HEADER */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {view === "list" ? "Select Address" : "Add New Address"}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.textMain} />
            </TouchableOpacity>
          </View>

          {view === "list" ? (
            <>
              {loading ? (
                <ActivityIndicator
                  style={{ margin: 20 }}
                  color={Colors.primary}
                />
              ) : (
                <FlatList
                  data={addresses}
                  keyExtractor={(item: any) => item.AddressBookId.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.addressItem}
                      onPress={() => {
                        onSelectAddress(item);
                        onClose();
                      }}
                    >
                      <Ionicons
                        name="location-sharp"
                        size={20}
                        color={Colors.primary}
                      />
                      <View style={styles.addressTextWrapper}>
                        <Text style={styles.addressName}>{item.City}</Text>
                        <Text style={styles.addressDetail}>{item.Address}</Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleDelete(item.AddressBookId)}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={20}
                          color={Colors.error}
                        />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  )}
                />
              )}
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => setView("form")}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.addBtnText}>Add New Address</Text>
              </TouchableOpacity>
            </>
          ) : (
            /* FORM VIEW */
            <View style={styles.form}>
              <TextInput
                placeholder="Full Name"
                style={styles.input}
                onChangeText={(t) => setFormData({ ...formData, FullName: t })}
              />
              <TextInput
                placeholder="Phone Number"
                style={styles.input}
                keyboardType="phone-pad"
                onChangeText={(t) =>
                  setFormData({ ...formData, PhoneNumber: t })
                }
              />
              <TextInput
                placeholder="Complete Address"
                style={[styles.input, { height: 80 }]}
                multiline
                onChangeText={(t) => setFormData({ ...formData, Address: t })}
              />
              <View style={styles.formActions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setView("list")}
                >
                  <Text style={{ color: Colors.error }}>Back</Text>
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
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    paddingBottom: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  addressItem: {
    flexDirection: "row",
    padding: 15,
    borderBottomWidth: 1,
    borderColor: "#f9f9f9",
    alignItems: "center",
  },
  addressTextWrapper: { flex: 1, marginLeft: 10 },
  addressName: { fontWeight: "600", fontSize: 14 },
  addressDetail: { color: Colors.tertiary, fontSize: 12 },
  addBtn: {
    backgroundColor: Colors.primary,
    margin: 20,
    padding: 15,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  addBtnText: { color: "#fff", fontWeight: "700" },
  form: { padding: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  formActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    padding: 15,
    borderRadius: 10,
    width: "68%",
    alignItems: "center",
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: Colors.error,
    padding: 15,
    borderRadius: 10,
    width: "28%",
    alignItems: "center",
  },
});
