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
import { useGlobalAddress } from "@/store/AddressContext";
import { useAuth } from "@/store/AuthContext";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelectAddress: (address: any) => void;
  selectedAddressId?: number; // Pass the currently active address ID down to flag items elegantly
}

const INITIAL_FORM_STATE = {
  AddressBookId: 0,
  FullName: "",
  PhoneNumber: "",
  IsDefault: true,
  Address: "",
  Country: "",
  CountryId: 0, // Casted to number for final API payload structure
  State: "",
  StateId: 0,
  City: "",
  CityId: 0,
  Area: "",
  AreaId: 0,
  Longitude: "0.0",
  Latitude: "0.0",
};

export const AddressModal = ({
  visible,
  onClose,
  onSelectAddress,
  selectedAddressId,
}: Props) => {
  const { isAuthenticated, user } = useAuth();

  const {
    addresses,
    loading,
    handleSaveAddress,
    handleDeleteAddress,
    countries,
    states,
    cities,
    areas, // Assumed available via your context stream update
    dropdownLoading,
    loadStates,
    loadCities,
    loadAreasAndBranches, // Assumed available via your context stream update
    clearCascadingLocations,
  } = useGlobalAddress();

  const [view, setView] = useState<"list" | "form">("list");
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [modalVisible, setModalVisible] = useState(false);

  // Loading overrides for discrete interactions
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // High-end Custom Modal Toast Alert notification states
  const [toastConfig, setToastConfig] = useState<{
    visible: boolean;
    type: "success" | "error";
    message: string;
  }>({
    visible: false,
    type: "success",
    message: "",
  });

  const [selectedCountryCode, setSelectedCountryCode] = useState(
    user?.PhoneCode,
  );
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // Auto-hydration matching logic on form mount
  useEffect(() => {
    if (visible) {
      if (view === "form" && isAuthenticated) {
        hydrateUserProfileData();
      }
    } else {
      setView("list");
      setFormData(INITIAL_FORM_STATE);
      setSelectedCountryCode(user?.PhoneCode);
      setFormErrors({});
      closeAllDropdowns();
    }
  }, [visible, view, isAuthenticated]);

  const closeAllDropdowns = () => {
    setShowCountryDropdown(false);
    setShowStateDropdown(false);
    setShowCityDropdown(false);
    setShowAreaDropdown(false);
  };

  const triggerToast = (type: "success" | "error", message: string) => {
    setToastConfig({ visible: true, type, message });
    setTimeout(() => {
      setToastConfig((prev) => ({ ...prev, visible: false }));
    }, 3500);
  };

  const hydrateUserProfileData = async () => {
    try {
      const storedName = user?.Name;
      const storedPhone = user?.Phone;
      const storedPhoneCode = user?.PhoneCode;

      let countryLabel = "";
      let countryStringId = 0;

      if (storedPhoneCode) {
        if (storedPhoneCode === "92") {
          countryLabel = "Pakistan";
          countryStringId = 169;
        } else if (storedPhoneCode === "44") {
          countryLabel = "United Kingdom";
          countryStringId = 236;
        } else {
          countryLabel = "Pakistan";
          countryStringId = 169;
        }
      }

      setSelectedCountryCode(storedPhoneCode);
      setFormData((prev) => ({
        ...prev,
        FullName: storedName || prev.FullName,
        PhoneNumber: storedPhone || prev.PhoneNumber,
        Country: countryLabel || prev.Country,
        CountryId: countryStringId || prev.CountryId,
      }));

      if (countryStringId) {
        loadStates(countryStringId.toString());
      }
    } catch (err) {
      console.log("Failed tracking SecureStore runtime profile details:", err);
    }
  };

  const filteredCountries = countries.filter((c) => {
    const name = c.Text.toLowerCase();
    const code = c.Value.toLowerCase();
    return (
      name.includes("pakistan") ||
      name.includes("united kingdom") ||
      code === "169" ||
      code === "236"
    );
  });

  const updatePhoneNumberPayload = (rawNum: string, currentCode: string) => {
    let cleanedDigits = rawNum.replace(/\D/g, "");
    if (
      cleanedDigits.startsWith(currentCode) &&
      cleanedDigits.length >= currentCode.length
    ) {
      setFormErrors((prev) => ({
        ...prev,
        PhoneNumber: `Do not include the country code (+${currentCode}). Enter your raw number.`,
      }));
      return;
    }
    if (cleanedDigits.startsWith("0")) {
      setFormErrors((prev) => ({
        ...prev,
        PhoneNumber:
          "Phone number must not start with a 0. Enter your raw number.",
      }));
      return;
    }

    if (formErrors.PhoneNumber) {
      setFormErrors((prev) => ({ ...prev, PhoneNumber: "" }));
    }
    setFormData((prev) => ({
      ...prev,
      PhoneNumber: cleanedDigits,
    }));
  };

  const inferPhoneCodeByStringId = (countryValue: string): string => {
    if (countryValue === "236") return "44";
    return "92";
  };

  const validateFormFields = (): boolean => {
    const errors: { [key: string]: string } = {};
    const alphaSpaceRegex = /^[a-zA-Z\s]{2,50}$/;

    if (!formData.FullName.trim()) {
      errors.FullName = "Recipient full name is required.";
    } else if (!alphaSpaceRegex.test(formData.FullName.trim())) {
      errors.FullName =
        "Please enter a valid alphabetic name configuration string.";
    }

    if (!formData.PhoneNumber.trim()) {
      errors.PhoneNumber = "Phone contact number is required.";
    } else if (
      formData.PhoneNumber.length < 9 ||
      formData.PhoneNumber.length > 11
    ) {
      errors.PhoneNumber =
        "Enter a complete, valid mobile contact number line.";
    }

    if (!formData.CountryId)
      errors.Country = "Please select your target country.";
    if (!formData.StateId && states.length > 0)
      errors.State = "Please assign your destination state.";
    if (!formData.CityId && cities.length > 0)
      errors.City = "Please assign your delivery city container.";
    if (!formData.AreaId && areas && areas.length > 0)
      errors.Area = "Please select your regional delivery area sector.";

    if (!formData.Address.trim()) {
      errors.Address = "Complete street address details are required.";
    } else if (formData.Address.trim().length < 8) {
      errors.Address =
        "Please provide more descriptive address layout markers.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onSavePress = async () => {
    if (!validateFormFields()) return;
    const finalPayload = {
      AddressBookId: formData.AddressBookId,
      FullName: formData.FullName.trim(),
      PhoneNumber: formData.PhoneNumber,
      IsDefault: formData.IsDefault,
      Address: formData.Address.trim(),
      CountryId: Number(formData.CountryId),
      StateId: Number(formData.StateId),
      CityId: Number(formData.CityId),
      AreaId: Number(formData.AreaId),
      Longitude: formData.Longitude,
      Latitude: formData.Latitude,
    };
    console.log("sending payload :", finalPayload);
    try {
      setIsSaving(true);
      const res = await handleSaveAddress(finalPayload);

      if (res?.success) {
        setView("list");
        setFormData(INITIAL_FORM_STATE);
        setFormErrors({});
        return;
      }
    } catch (err) {
      console.log("error while saving addres :", err);
      triggerToast(
        "error",
        "There is something wrong! please check your connection.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const onDeletePress = async (id: number) => {
    setDeletingId(id);
    const res = await handleDeleteAddress(id);
    setDeletingId(null);

    if (res?.success) {
      setDeletingId(null);
      return;
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.modalOverlay}>
          {/* HIGH-END TOAST MODAL INLINE COMPONENT CONTAINER */}
          {toastConfig.visible && (
            <View
              style={[
                styles.premiumToastBox,
                toastConfig.type === "error"
                  ? styles.toastErrorBg
                  : styles.toastSuccessBg,
              ]}
            >
              <Ionicons
                name={
                  toastConfig.type === "error"
                    ? "alert-circle"
                    : "checkmark-circle"
                }
                size={20}
                color="#FFF"
              />
              <Text style={styles.toastTextContent}>{toastConfig.message}</Text>
            </View>
          )}

          <View style={styles.modalContainer}>
            {/* HEADER ROW */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>
                {view === "list" ? "Select Address" : "Add New Address"}
              </Text>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeButtonContainer}
              >
                <Ionicons name="close" size={22} color="#0F172A" />
              </TouchableOpacity>
            </View>

            {view === "list" ? (
              <>
                {loading ? (
                  <View style={styles.loaderBox}>
                    <ActivityIndicator size="large" color="#0284C7" />
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
                    renderItem={({ item }) => {
                      const isCurrentActiveSelection =
                        selectedAddressId === item.AddressBookId;
                      return (
                        <View
                          style={[
                            styles.addressItemRow,
                            isCurrentActiveSelection &&
                              styles.activeSelectedRowWrapper,
                          ]}
                        >
                          <TouchableOpacity
                            style={styles.addressClickableArea}
                            onPress={() => {
                              onSelectAddress(item);
                              onClose();
                            }}
                          >
                            <Ionicons
                              name={
                                isCurrentActiveSelection
                                  ? "radio-button-on"
                                  : "location-outline"
                              }
                              size={22}
                              color={
                                isCurrentActiveSelection ? "#0284C7" : "#64748B"
                              }
                            />
                            <View style={styles.addressTextWrapper}>
                              <View style={styles.inlineHeader}>
                                <Text
                                  style={styles.addressName}
                                  numberOfLines={1}
                                >
                                  {item.FullName || "Recipient Name"}
                                </Text>
                                <View style={styles.badgeCompoundCluster}>
                                  {isCurrentActiveSelection && (
                                    <Text style={styles.activeRouteBadge}>
                                      Active Selection
                                    </Text>
                                  )}
                                  {item.IsDefault && (
                                    <Text style={styles.defaultBadge}>
                                      Primary
                                    </Text>
                                  )}
                                </View>
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
                            onPress={() => onDeletePress(item.AddressBookId)}
                            disabled={deletingId !== null}
                          >
                            {deletingId === item.AddressBookId ? (
                              <ActivityIndicator size="small" color="#EF4444" />
                            ) : (
                              <Ionicons
                                name="trash-outline"
                                size={18}
                                color="#EF4444"
                              />
                            )}
                          </TouchableOpacity>
                        </View>
                      );
                    }}
                  />
                )}
                <TouchableOpacity
                  style={styles.addBtn}
                  onPress={() =>
                    isAuthenticated ? setView("form") : setModalVisible(true)
                  }
                >
                  <Ionicons name="add" size={20} color="#fff" />
                  <Text style={styles.addBtnText}>Create New Address</Text>
                </TouchableOpacity>
              </>
            ) : (
              /* FORM CONTROLLER VIEW SCREEN */
              <ScrollView
                style={styles.form}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="always"
              >
                {/* 1. Recipient Full Name */}
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

                {/* 2. Country Dropdown */}
                <Text style={styles.fieldLabelText}>Country</Text>
                <TouchableOpacity
                  style={[
                    styles.input,
                    styles.pseudoSelectorInput,
                    formErrors.Country ? styles.inputErrorBorder : null,
                  ]}
                  onPress={() => {
                    const toggle = !showCountryDropdown;
                    closeAllDropdowns();
                    setShowCountryDropdown(toggle);
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
                  <Ionicons name="earth-outline" size={18} color="#94A3B8" />
                </TouchableOpacity>
                {formErrors.Country && (
                  <Text style={styles.errorSubtext}>{formErrors.Country}</Text>
                )}

                {showCountryDropdown && (
                  <View style={styles.inlineDropdownContainer}>
                    {filteredCountries.length === 0 ? (
                      <Text style={styles.dropdownEmptyText}>
                        No countries supported
                      </Text>
                    ) : (
                      filteredCountries.map((c) => (
                        <TouchableOpacity
                          key={c.Value}
                          style={styles.dropdownSelectionRowItem}
                          onPress={() => {
                            const code = inferPhoneCodeByStringId(c.Value);
                            setSelectedCountryCode(code);
                            clearCascadingLocations("country");

                            setFormData((prev) => ({
                              ...prev,
                              Country: c.Text,
                              CountryId: parseInt(c.Value, 10),
                              State: "",
                              StateId: 0,
                              City: "",
                              CityId: 0,
                              Area: "",
                              AreaId: 0,
                            }));
                            updatePhoneNumberPayload(
                              formData.PhoneNumber,
                              code,
                            );
                            loadStates(c.Value);
                            setShowCountryDropdown(false);
                            if (formErrors.Country)
                              setFormErrors({ ...formErrors, Country: "" });
                          }}
                        >
                          <Text style={styles.dropdownRowItemText}>
                            {c.Text}
                          </Text>
                        </TouchableOpacity>
                      ))
                    )}
                  </View>
                )}

                {/* 3. State Dropdown */}
                <Text style={styles.fieldLabelText}>State / Province</Text>
                <TouchableOpacity
                  style={[
                    styles.input,
                    styles.pseudoSelectorInput,
                    formErrors.State ? styles.inputErrorBorder : null,
                  ]}
                  onPress={() => {
                    if (!formData.CountryId) {
                      setFormErrors({
                        ...formErrors,
                        State: "Please select a country first.",
                      });
                      return;
                    }
                    const toggle = !showStateDropdown;
                    closeAllDropdowns();
                    setShowStateDropdown(toggle);
                  }}
                >
                  <Text
                    style={
                      formData.State
                        ? styles.selectorValueText
                        : styles.selectorPlaceholderText
                    }
                  >
                    {formData.State || "Select State"}
                  </Text>
                  <Ionicons name="map-outline" size={18} color="#94A3B8" />
                </TouchableOpacity>
                {formErrors.State && (
                  <Text style={styles.errorSubtext}>{formErrors.State}</Text>
                )}

                {showStateDropdown && (
                  <View style={styles.inlineDropdownContainer}>
                    {dropdownLoading ? (
                      <ActivityIndicator
                        style={{ padding: 12 }}
                        size="small"
                        color="#0284C7"
                      />
                    ) : states.length === 0 ? (
                      <Text style={styles.dropdownEmptyText}>
                        No states/provinces located
                      </Text>
                    ) : (
                      states.map((s) => (
                        <TouchableOpacity
                          key={s.Value}
                          style={styles.dropdownSelectionRowItem}
                          onPress={() => {
                            clearCascadingLocations("state");
                            setFormData((prev) => ({
                              ...prev,
                              State: s.Text,
                              StateId: parseInt(s.Value, 10),
                              City: "",
                              CityId: 0,
                              Area: "",
                              AreaId: 0,
                            }));
                            loadCities(s.Value);
                            setShowStateDropdown(false);
                            if (formErrors.State)
                              setFormErrors({ ...formErrors, State: "" });
                          }}
                        >
                          <Text style={styles.dropdownRowItemText}>
                            {s.Text}
                          </Text>
                        </TouchableOpacity>
                      ))
                    )}
                  </View>
                )}

                {/* 4. City Dropdown */}
                <Text style={styles.fieldLabelText}>City</Text>
                <TouchableOpacity
                  style={[
                    styles.input,
                    styles.pseudoSelectorInput,
                    formErrors.City ? styles.inputErrorBorder : null,
                  ]}
                  onPress={() => {
                    if (!formData.StateId) {
                      setFormErrors({
                        ...formErrors,
                        City: "Please select a state first.",
                      });
                      return;
                    }
                    const toggle = !showCityDropdown;
                    closeAllDropdowns();
                    setShowCityDropdown(toggle);
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
                  <Ionicons name="business-outline" size={18} color="#94A3B8" />
                </TouchableOpacity>
                {formErrors.City && (
                  <Text style={styles.errorSubtext}>{formErrors.City}</Text>
                )}

                {showCityDropdown && (
                  <View style={styles.inlineDropdownContainer}>
                    {dropdownLoading ? (
                      <ActivityIndicator
                        style={{ padding: 12 }}
                        size="small"
                        color="#0284C7"
                      />
                    ) : cities.length === 0 ? (
                      <Text style={styles.dropdownEmptyText}>
                        No cities located in this state
                      </Text>
                    ) : (
                      cities.map((ct) => (
                        <TouchableOpacity
                          key={ct.Value}
                          style={styles.dropdownSelectionRowItem}
                          onPress={() => {
                            setFormData((prev) => ({
                              ...prev,
                              City: ct.Text,
                              CityId: parseInt(ct.Value, 10),
                              Area: "",
                              AreaId: 0,
                            }));
                            if (loadAreasAndBranches)
                              loadAreasAndBranches(ct.Value); // Hooking layout call explicitly
                            setShowCityDropdown(false);
                            if (formErrors.City)
                              setFormErrors({ ...formErrors, City: "" });
                          }}
                        >
                          <Text style={styles.dropdownRowItemText}>
                            {ct.Text}
                          </Text>
                        </TouchableOpacity>
                      ))
                    )}
                  </View>
                )}

                {/* 5. Area Dropdown Field (New Addition requested) */}
                <Text style={styles.fieldLabelText}>Area / Neighborhood</Text>
                <TouchableOpacity
                  style={[
                    styles.input,
                    styles.pseudoSelectorInput,
                    formErrors.Area ? styles.inputErrorBorder : null,
                  ]}
                  onPress={() => {
                    if (!formData.CityId) {
                      setFormErrors({
                        ...formErrors,
                        Area: "Please select a city first.",
                      });
                      return;
                    }
                    const toggle = !showAreaDropdown;
                    closeAllDropdowns();
                    setShowAreaDropdown(toggle);
                  }}
                >
                  <Text
                    style={
                      formData.Area
                        ? styles.selectorValueText
                        : styles.selectorPlaceholderText
                    }
                  >
                    {formData.Area || "Select Area / Region"}
                  </Text>
                  <Ionicons name="navigate-outline" size={18} color="#94A3B8" />
                </TouchableOpacity>
                {formErrors.Area && (
                  <Text style={styles.errorSubtext}>{formErrors.Area}</Text>
                )}

                {showAreaDropdown && (
                  <View style={styles.inlineDropdownContainer}>
                    {dropdownLoading ? (
                      <ActivityIndicator
                        style={{ padding: 12 }}
                        size="small"
                        color="#0284C7"
                      />
                    ) : !areas || areas.length === 0 ? (
                      <Text style={styles.dropdownEmptyText}>
                        No specific delivery sectors located
                      </Text>
                    ) : (
                      areas.map((a: any) => (
                        <TouchableOpacity
                          key={a.Value}
                          style={styles.dropdownSelectionRowItem}
                          onPress={() => {
                            setFormData((prev) => ({
                              ...prev,
                              Area: a.Text,
                              AreaId: parseInt(a.Value, 10),
                            }));
                            setShowAreaDropdown(false);
                            if (formErrors.Area)
                              setFormErrors({ ...formErrors, Area: "" });
                          }}
                        >
                          <Text style={styles.dropdownRowItemText}>
                            {a.Text}
                          </Text>
                        </TouchableOpacity>
                      ))
                    )}
                  </View>
                )}

                {/* 6. Phone Number Compound Input Section */}
                {/* <Text style={styles.fieldLabelText}>Phone Number</Text>
                <View style={styles.phoneInputCompoundRow}>
                  <View
                    style={[
                      styles.staticCountryCodeDeck,
                      formErrors.PhoneNumber ? styles.inputErrorBorder : null,
                    ]}
                  >
                    <Text style={styles.countryCodeLabelText}>
                      +{selectedCountryCode}
                    </Text>
                  </View>
                  <TextInput
                    placeholder="**********"
                    placeholderTextColor="#94A3B8"
                    style={[
                      styles.phoneInputFieldElement,
                      formErrors.PhoneNumber ? styles.inputErrorBorder : null,
                    ]}
                    keyboardType="number-pad"
                    maxLength={11}
                    value={formData.PhoneNumber}
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
                )} */}

                {/* 6. Phone Number Compound Input Section */}
                <Text style={styles.fieldLabelText}>Phone Number</Text>
                <View style={styles.phoneInputCompoundRow}>
                  <View
                    style={[
                      styles.staticCountryCodeDeck,
                      formErrors.PhoneNumber ? styles.inputErrorBorder : null,
                    ]}
                  >
                    <Text style={styles.countryCodeLabelText}>
                      +{selectedCountryCode}
                    </Text>
                  </View>
                  <TextInput
                    placeholder={
                      selectedCountryCode === "92" ? "3001234567" : "7123456789"
                    }
                    placeholderTextColor="#94A3B8"
                    style={[
                      styles.phoneInputFieldElement,
                      formErrors.PhoneNumber ? styles.inputErrorBorder : null,
                    ]}
                    keyboardType="number-pad"
                    maxLength={10} // Adjusted down to 10 for raw numbers
                    value={formData.PhoneNumber} // Displays only the raw numbers beautifully
                    onChangeText={(t) =>
                      updatePhoneNumberPayload(t, selectedCountryCode)
                    }
                  />
                </View>
                {formErrors.PhoneNumber && (
                  <Text style={styles.errorSubtext}>
                    {formErrors.PhoneNumber}
                  </Text>
                )}

                {/* 7. Complete Street Address Box */}
                <Text style={styles.fieldLabelText}>
                  Delivery Address Details
                </Text>
                <TextInput
                  placeholder="Street Name, Building, Flat or Apartment Number"
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

                {/* Form Action Controls */}
                <View style={styles.formActions}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => setView("list")}
                    disabled={isSaving}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.saveBtn}
                    onPress={onSavePress}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Text style={styles.saveBtnText}>Save Address</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>

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
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    justifyContent: "flex-end",
  },
  premiumToastBox: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 30,
    left: 24,
    right: 24,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    zIndex: 9999,
    elevation: 10,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  toastSuccessBg: { backgroundColor: "#059669" },
  toastErrorBg: { backgroundColor: "#DC2626" },
  toastTextContent: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
    flex: 1,
  },
  modalContainer: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "85%",
    paddingBottom: Platform.OS === "ios" ? 36 : 24,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderColor: "#F1F5F9",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.2,
  },
  closeButtonContainer: {
    padding: 6,
    borderRadius: 50,
    backgroundColor: "#F8FAFC",
  },
  loaderBox: { padding: 60, alignItems: "center", justifyContent: "center" },
  listContainer: { paddingHorizontal: 4, paddingBottom: 16 },
  emptyText: {
    textAlign: "center",
    color: "#94A3B8",
    marginVertical: 40,
    fontSize: 14,
  },
  addressItemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: "#F1F5F9",
    backgroundColor: "#FFFFFF",
  },
  activeSelectedRowWrapper: {
    backgroundColor: "#F0F9FF",
    borderColor: "#BAE6FD",
    borderLeftWidth: 4,
    paddingHorizontal: 20,
  },
  addressClickableArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  addressTextWrapper: { flex: 1, marginLeft: 14, paddingRight: 8 },
  inlineHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
    flexWrap: "wrap",
  },
  addressName: { fontWeight: "600", fontSize: 15, color: "#1E293B" },
  badgeCompoundCluster: { flexDirection: "row", gap: 6, alignItems: "center" },
  defaultBadge: {
    backgroundColor: "#F0FDF4",
    color: "#16A34A",
    fontSize: 10,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: "hidden",
  },
  activeRouteBadge: {
    backgroundColor: "#E0F2FE",
    color: "#0369A1",
    fontSize: 10,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: "hidden",
  },
  addressDetail: { color: "#475569", fontSize: 13, lineHeight: 19 },
  phoneText: {
    color: "#64748B",
    fontSize: 13,
    marginTop: 6,
    fontWeight: "500",
  },
  deleteBtn: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 32,
  },
  addBtn: {
    backgroundColor: "#0284C7",
    marginHorizontal: 24,
    marginVertical: 16,
    padding: 16,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  addBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  form: { paddingHorizontal: 24, paddingTop: 16, marginBottom: 8 },
  fieldLabelText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 6,
    marginLeft: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 4,
    fontSize: 14,
    color: "#0F172A",
    backgroundColor: "#F8FAFC",
    height: 50,
  },
  inputErrorBorder: { borderColor: "#EF4444", backgroundColor: "#FEF2F2" },
  errorSubtext: {
    color: "#EF4444",
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 14,
    marginLeft: 4,
  },
  phoneInputCompoundRow: { flexDirection: "row", gap: 10, marginBottom: 4 },
  staticCountryCodeDeck: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    width: "24%",
    height: 50,
  },
  countryCodeLabelText: { fontSize: 14, fontWeight: "700", color: "#334155" },
  phoneInputFieldElement: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    color: "#0F172A",
    height: 50,
  },
  pseudoSelectorInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignEments: "center",
  },
  selectorPlaceholderText: { color: "#94A3B8", fontSize: 14 },
  selectorValueText: { color: "#0F172A", fontSize: 14, fontWeight: "500" },
  inlineDropdownContainer: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    marginTop: -2,
    marginBottom: 14,
    maxHeight: 180,
    elevation: 5,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  dropdownSelectionRowItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  dropdownRowItemText: { fontSize: 14, color: "#334155", fontWeight: "500" },
  dropdownEmptyText: {
    padding: 16,
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
    fontWeight: "500",
    fontStyle: "italic",
  },
  textArea: {
    height: 90,
    textAlignVertical: "top",
    paddingTop: 12,
    paddingBottom: 12,
  },
  formActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
  },
  saveBtn: {
    backgroundColor: "#0F172A",
    padding: 16,
    borderRadius: 14,
    width: "68%",
    alignItems: "center",
    height: 52,
    justifyContent: "center",
  },
  saveBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  cancelBtn: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 14,
    width: "28%",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
  },
  cancelBtnText: { color: "#64748B", fontWeight: "600", fontSize: 15 },
});
