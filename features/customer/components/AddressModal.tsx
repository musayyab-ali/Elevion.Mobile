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
  ScrollView,
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

// Mock Database Lists - Replace with active API endpoints/data hooks as needed
const COUNTRIES_REGISTRY = [
  { id: 1, name: "Pakistan", phoneCode: "+92", isoCode: "PK" },
  { id: 2, name: "United Arab Emirates", phoneCode: "+971", isoCode: "AE" },
  { id: 3, name: "Saudi Arabia", phoneCode: "+966", isoCode: "SA" },
];

const CITIES_REGISTRY = [
  { id: 1, name: "Lahore", countryId: 1 },
  { id: 2, name: "Karachi", countryId: 1 },
  { id: 3, name: "Islamabad", countryId: 1 },
  { id: 4, name: "Dubai", countryId: 2 },
  { id: 5, name: "Riyadh", countryId: 3 },
];

const INITIAL_FORM_STATE = {
  AddressBookId: 0,
  FullName: "",
  RawPhoneNumber: "", // Captures phone digits without country flags
  PhoneNumber: "", // Assembled payload: CountryCode + RawPhoneNumber
  IsDefault: true,
  Address: "",
  Country: "",
  CountryId: 0, // Crucial structural database routing parameter
  City: "", // String Representation of target area city
  CityId: 0, // Checked relative to warehouse fulfillment branch entries
  Longitude: "0.0",
  Latitude: "0.0",
};

export const AddressModal = ({ visible, onClose, onSelectAddress }: Props) => {
  const { isAuthenticated } = useAuth();
  const { addresses, loading, handleSave, handleDelete } = useAddress();
  const [view, setView] = useState<"list" | "form">("list");
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [modalVisible, setModalVisible] = useState(false);

  // Selector Dropdown UI Overlay States
  const [selectedCountryCode, setSelectedCountryCode] = useState("+92");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  // Professional Inline Form Error Checking Blocks
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (!visible) {
      setView("list");
      setFormData(INITIAL_FORM_STATE);
      setSelectedCountryCode("+92");
      setFormErrors({});
      setShowCountryDropdown(false);
      setShowCityDropdown(false);
    }
  }, [visible]);

  // Real-time compound parsing of dial components
  const updatePhoneNumberPayload = (rawNum: string, currentCode: string) => {
    // Sanitize entry: remove any leading zeros added accidentally by users
    const sanitizedDigits = rawNum.replace(/^0+/, "");
    setFormData((prev) => ({
      ...prev,
      RawPhoneNumber: sanitizedDigits,
      PhoneNumber: `${currentCode}${sanitizedDigits}`,
    }));
  };

  const validateFormFields = (): boolean => {
    const errors: { [key: string]: string } = {};

    if (!formData.FullName.trim())
      errors.FullName = "Recipient full name is required.";
    if (!formData.RawPhoneNumber.trim()) {
      errors.PhoneNumber = "Phone contact number is required.";
    } else if (formData.RawPhoneNumber.length < 7) {
      errors.PhoneNumber = "Please enter a valid telephone line length.";
    }
    if (formData.CountryId === 0)
      errors.Country = "Please pick your destination country base.";
    if (formData.CityId === 0)
      errors.City = "Please assign a delivery region city node.";
    if (!formData.Address.trim())
      errors.Address =
        "Complete localized street address details are required.";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onSavePress = async () => {
    if (!validateFormFields()) return;
    // console.log("tati tati is", formData);
    const res = await handleSave(formData);
    if (res?.success) {
      setView("list");
      setFormData(INITIAL_FORM_STATE);
      setFormErrors({});
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
            <TouchableOpacity onPress={onClose} accessibilityRole="button">
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
                            {item.City ? `, ${item.City}` : ""}
                            {item.Country ? `, ${item.Country}` : ""}
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
            <ScrollView
              style={styles.form}
              showsVerticalScrollIndicator={false}
            >
              {/* Full Name Field */}
              <Text style={styles.fieldLabelText}>Full Name</Text>
              <TextInput
                placeholder="Enter Recipient Name"
                placeholderTextColor="#94A3B8"
                style={[
                  styles.input,
                  formErrors.FullName ? styles.inputErrorBorder : null,
                ]}
                value={formData.FullName}
                onChangeText={(t) => {
                  setFormData({ ...formData, FullName: t });
                  if (formErrors.FullName)
                    setFormErrors({ ...formErrors, FullName: "" });
                }}
              />
              {formErrors.FullName && (
                <Text style={styles.errorSubtext}>{formErrors.FullName}</Text>
              )}

              {/* Dynamic Phone Layout Wrapper */}
              <Text style={styles.fieldLabelText}>Phone Number</Text>
              <View style={styles.phoneInputCompoundRow}>
                <TouchableOpacity
                  style={[
                    styles.countryDropdownSelector,
                    formErrors.PhoneNumber ? styles.inputErrorBorder : null,
                  ]}
                  onPress={() => {
                    setShowCountryDropdown(!showCountryDropdown);
                    setShowCityDropdown(false);
                  }}
                >
                  <Text style={styles.countryCodeLabelText}>
                    {selectedCountryCode}
                  </Text>
                  <Ionicons name="chevron-down" size={14} color="#64748B" />
                </TouchableOpacity>

                <TextInput
                  placeholder="3076840971"
                  placeholderTextColor="#94A3B8"
                  style={[
                    styles.phoneInputFieldElement,
                    formErrors.PhoneNumber ? styles.inputErrorBorder : null,
                  ]}
                  keyboardType="phone-pad"
                  value={formData.RawPhoneNumber}
                  onChangeText={(t) => {
                    updatePhoneNumberPayload(t, selectedCountryCode);
                    if (formErrors.PhoneNumber)
                      setFormErrors({ ...formErrors, PhoneNumber: "" });
                  }}
                />
              </View>
              {formErrors.PhoneNumber && (
                <Text style={styles.errorSubtext}>
                  {formErrors.PhoneNumber}
                </Text>
              )}

              {/* Country Selection Dropdown List */}
              {showCountryDropdown && (
                <View style={styles.floatingInlineDropdownListDeck}>
                  {COUNTRIES_REGISTRY.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={styles.dropdownSelectionRowItem}
                      onPress={() => {
                        setSelectedCountryCode(c.phoneCode);
                        setFormData((prev) => ({
                          ...prev,
                          Country: c.name,
                          CountryId: c.id,
                          City: "", // Reset dependent city data fields safely
                          CityId: 0,
                        }));
                        updatePhoneNumberPayload(
                          formData.RawPhoneNumber,
                          c.phoneCode,
                        );
                        setShowCountryDropdown(false);
                        if (formErrors.Country)
                          setFormErrors({ ...formErrors, Country: "" });
                      }}
                    >
                      <Text style={styles.dropdownRowItemText}>
                        {c.name} ({c.phoneCode})
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Country Render Block Field */}
              <Text style={styles.fieldLabelText}>Country</Text>
              <TouchableOpacity
                style={[
                  styles.input,
                  styles.pseudoSelectorInput,
                  formErrors.Country ? styles.inputErrorBorder : null,
                ]}
                onPress={() => {
                  setShowCountryDropdown(!showCountryDropdown);
                  setShowCityDropdown(false);
                }}
              >
                <Text
                  style={
                    formData.Country
                      ? styles.selectorValueText
                      : styles.selectorPlaceholderText
                  }
                >
                  {formData.Country || "Select Country"}
                </Text>
                <Ionicons name="earth" size={18} color="#94A3B8" />
              </TouchableOpacity>
              {formErrors.Country && (
                <Text style={styles.errorSubtext}>{formErrors.Country}</Text>
              )}

              {/* Dynamic City Node Field Selector */}
              <Text style={styles.fieldLabelText}>City</Text>
              <TouchableOpacity
                style={[
                  styles.input,
                  styles.pseudoSelectorInput,
                  formErrors.City ? styles.inputErrorBorder : null,
                ]}
                onPress={() => {
                  if (formData.CountryId === 0) {
                    setFormErrors({
                      ...formErrors,
                      City: "Please select a country first.",
                    });
                    return;
                  }
                  setShowCityDropdown(!showCityDropdown);
                  setShowCountryDropdown(false);
                }}
              >
                <Text
                  style={
                    formData.City
                      ? styles.selectorValueText
                      : styles.selectorPlaceholderText
                  }
                >
                  {formData.City || "Select City"}
                </Text>
                <Ionicons name="business" size={18} color="#94A3B8" />
              </TouchableOpacity>
              {formErrors.City && (
                <Text style={styles.errorSubtext}>{formErrors.City}</Text>
              )}

              {/* City Selection Dropdown Inline Tray */}
              {showCityDropdown && (
                <View style={styles.floatingInlineDropdownListDeck}>
                  {CITIES_REGISTRY.filter(
                    (city) => city.countryId === formData.CountryId,
                  ).map((ct) => (
                    <TouchableOpacity
                      key={ct.id}
                      style={styles.dropdownSelectionRowItem}
                      onPress={() => {
                        setFormData({
                          ...formData,
                          City: ct.name,
                          CityId: ct.id,
                        });
                        setShowCityDropdown(false);
                        if (formErrors.City)
                          setFormErrors({ ...formErrors, City: "" });
                      }}
                    >
                      <Text style={styles.dropdownRowItemText}>{ct.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Full Address Fields */}
              <Text style={styles.fieldLabelText}>Delivery Address</Text>
              <TextInput
                placeholder="Complete Delivery Address, Street Name, House Number"
                placeholderTextColor="#94A3B8"
                style={[
                  styles.input,
                  styles.textArea,
                  formErrors.Address ? styles.inputErrorBorder : null,
                ]}
                multiline
                numberOfLines={3}
                value={formData.Address}
                onChangeText={(t) => {
                  setFormData({ ...formData, Address: t });
                  if (formErrors.Address)
                    setFormErrors({ ...formErrors, Address: "" });
                }}
              />
              {formErrors.Address && (
                <Text style={styles.errorSubtext}>{formErrors.Address}</Text>
              )}

              {/* Actions Box Footer Row */}
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
            </ScrollView>
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
    maxHeight: "90%",
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
    backgroundColor: Colors.darkError || "#BE123C",
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
  form: { padding: 20, marginBottom: 10 },
  fieldLabelText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 6,
    marginLeft: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    padding: 14,
    marginBottom: 4,
    fontSize: 14,
    color: "#1E293B",
    backgroundColor: "#F8FAFC",
  },
  inputErrorBorder: {
    borderColor: "#EF4444",
    backgroundColor: "#FFF5F5",
  },
  errorSubtext: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 14,
    marginLeft: 4,
  },
  phoneInputCompoundRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 4,
  },
  countryDropdownSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    paddingHorizontal: 12,
    width: "25%",
    height: 50,
  },
  phoneInputFieldElement: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: "#1E293B",
    height: 50,
  },
  pseudoSelectorInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 50,
    paddingVertical: 0,
  },
  selectorPlaceholderText: { color: "#94A3B8", fontSize: 14 },
  selectorValueText: { color: "#1E293B", fontSize: 14, fontWeight: "500" },
  floatingInlineDropdownListDeck: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    marginTop: -2,
    marginBottom: 12,
    maxHeight: 150,
    overflow: "scroll",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownSelectionRowItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  dropdownRowItemText: { fontSize: 14, color: "#334155", fontWeight: "500" },
  textArea: { height: 80, textAlignVertical: "top" },
  formActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
    marginBottom: 40,
  },
  saveBtn: {
    backgroundColor: Colors.accent || "#0F172A",
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
