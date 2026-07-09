import React, { useEffect, useState, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  FlatList,
} from "react-native";
import { useAuth } from "@/store/AuthContext";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  useCheckoutSummary,
  DeliveryOption,
} from "@/features/cart/hooks/useCheckoutSummary";
import { CustomErrorMessage } from "@/components/CustomErrorMessage";
import { SearchableDropdownPicker } from "@/components/SearchableDropdownPicker";
interface PromoModalProps {
  visible: boolean;
  title: string;
  description: string;
}

export const PromotionSuccessModal: React.FC<PromoModalProps> = ({
  visible,
  title,
  description,
}) => {
  return (
    <Modal animationType="fade" transparent={true} visible={visible}>
      <View style={styles.modalOverlayContainer}>
        <View style={styles.alertCardContent}>
          <View style={styles.successIconOuterRing}>
            <Ionicons name="sparkles" size={32} color="#10B981" />
          </View>
          <Text style={styles.alertTitleLabel}>{title}</Text>
          <Text style={styles.alertDescLabel}>{description}</Text>

          <View style={styles.loadingPipelineArea}>
            <ActivityIndicator size="small" color="#10B981" />
            <Text style={styles.pipelineText}>
              Synchronizing secure credentials...
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

interface ErrorState {
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  countryId?: string;
  stateId?: string;
  cityId?: string;
  areaId?: string;
}

const COUNTRY_PHONE_CONFIGS: Record<
  string,
  { rawLength: number; prefix: string }
> = {
  PK: { rawLength: 10, prefix: "+92" },
  GB: { rawLength: 10, prefix: "+44" },
};

const PHONE_CODE_TO_ISO: Record<string, string> = {
  "+92": "PK",
  "92": "PK",
  "+44": "GB",
  "44": "GB",
};

const FIELD_LABELS: Record<string, string> = {
  fullName: "Shipping Full Name",
  email: "Shipping Email Address",
  phone: "Shipping Phone Number",
  address: "Street Address",
  countryId: "Country Selection",
  stateId: "State Selection",
  cityId: "City Selection",
  billingFullName: "Billing Full Name",
  billingEmail: "Billing Email Address",
  billingPhone: "Billing Phone Number",
};

export default function CheckoutSummaryScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const checkoutData = params.data ? JSON.parse(params.data as string) : null;

  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const hook = useCheckoutSummary(checkoutData);

  if (!checkoutData) {
    return (
      <View style={styles.centerWrapper}>
        <Text style={styles.errorText}>No checkout session found.</Text>
      </View>
    );
  }

  const hasInitialBilling = useMemo(
    () =>
      !!(
        checkoutData?.BillingDetail?.FullName &&
        checkoutData?.BillingDetail?.Phone
      ),
    [checkoutData],
  );

  const hasInitialShipping = useMemo(
    () =>
      !!(
        checkoutData?.ShippingDetail?.FullName &&
        checkoutData?.ShippingDetail?.Address
      ),
    [checkoutData],
  );

  const [isEditingBilling, setIsEditingBilling] = useState(!hasInitialBilling);
  const [isEditingShipping, setIsEditingShipping] =
    useState(!hasInitialShipping);

  const [billingErrors, setBillingErrors] = useState<ErrorState>({});
  const [shippingErrors, setShippingErrors] = useState<ErrorState>({});

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const keyboardDidShowListener = Keyboard.addListener(showEvent, () =>
      setIsKeyboardVisible(true),
    );
    const keyboardDidHideListener = Keyboard.addListener(hideEvent, () =>
      setIsKeyboardVisible(false),
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const isBillingModified = useMemo(() => {
    const originalName = checkoutData?.BillingDetail?.FullName || "";
    const originalEmail = checkoutData?.BillingDetail?.EmailAddress || "";
    const originalPhone = checkoutData?.BillingDetail?.Phone || "";
    return (
      (hook.billingForm?.fullName || "") !== originalName ||
      (hook.billingForm?.email || "") !== originalEmail ||
      (hook.billingForm?.phone || "") !== originalPhone
    );
  }, [hook.billingForm, checkoutData]);

  const isShippingModified = useMemo(() => {
    const originalName = checkoutData?.ShippingDetail?.FullName || "";

    // Fixed raw condition check structure
    const dbEmail = checkoutData?.ShippingDetail?.EmailAddress;
    const originalEmail =
      !dbEmail || dbEmail === "" || dbEmail === "Null"
        ? checkoutData?.BillingDetail?.EmailAddress || ""
        : dbEmail;

    const originalPhone = checkoutData?.ShippingDetail?.Phone || "";
    const originalAddress = checkoutData?.ShippingDetail?.Address || "";

    const originalCountry = checkoutData?.ShippingDetail?.CountryId
      ? Number(checkoutData.ShippingDetail.CountryId)
      : originalPhone.startsWith("+92") || originalPhone.startsWith("92")
        ? 169
        : 236;

    const originalState = checkoutData?.ShippingDetail?.StateId
      ? Number(checkoutData.ShippingDetail.StateId)
      : 0;
    const originalCity = checkoutData?.ShippingDetail?.CityId
      ? Number(checkoutData.ShippingDetail.CityId)
      : 0;

    const originalArea = checkoutData?.ShippingDetail?.AreaId
      ? Number(checkoutData.ShippingDetail.AreaId)
      : 0;

    return (
      (hook.addressForm?.fullName || "") !== originalName ||
      (hook.addressForm?.email || "") !== originalEmail ||
      (hook.addressForm?.phone || "") !== originalPhone ||
      (hook.addressForm?.address || "") !== originalAddress ||
      Number(hook.addressForm?.countryId || 0) !== originalCountry ||
      Number(hook.addressForm?.stateId || 0) !== originalState ||
      Number(hook.addressForm?.cityId || 0) !== originalCity ||
      Number(hook.addressForm?.areaId || 0) !== originalArea
    );
  }, [hook.addressForm, checkoutData, user]);

  const cleanRawPhoneNumber = (text: string, isoCode: string): string => {
    let cleaned = text.replace(/\D/g, "");
    const upperIso = isoCode?.toUpperCase() || "";

    if (upperIso === "PK") {
      if (cleaned.startsWith("92")) cleaned = cleaned.substring(2);
      else if (cleaned.startsWith("0")) cleaned = cleaned.substring(1);
    } else if (upperIso === "GB") {
      if (cleaned.startsWith("44")) cleaned = cleaned.substring(2);
      else if (cleaned.startsWith("0")) cleaned = cleaned.substring(1);
    }
    return cleaned;
  };

  const handleSaveBilling = (): boolean => {
    const errors: ErrorState = {};
    const currentIso = hook.addressForm?.isoCode || "PK";
    const phoneConfig = COUNTRY_PHONE_CONFIGS[currentIso.toUpperCase()];

    if (!hook.billingForm?.fullName?.trim())
      errors.fullName = "Full name is required.";
    if (!hook.billingForm?.email?.trim()) {
      errors.email = "Email address is required.";
    } else if (!/\S+@\S+\.\S+/.test(hook.billingForm.email)) {
      errors.email = "Please enter a valid email address.";
    }

    const billingPhone = hook.billingForm?.phone || "";
    if (!billingPhone.trim()) {
      errors.phone = "Phone number is required.";
    } else if (phoneConfig && billingPhone.length !== phoneConfig.rawLength) {
      errors.phone = `Phone number must be exactly ${phoneConfig.rawLength} digits long.`;
    }

    if (Object.keys(errors).length > 0) {
      setBillingErrors(errors);
      return false;
    }

    setBillingErrors({});
    setIsEditingBilling(false);
    return true;
  };

  const handleSaveShipping = (): boolean => {
    const errors: ErrorState = {};
    const currentIso = hook.addressForm?.isoCode || "PK";
    const phoneConfig = COUNTRY_PHONE_CONFIGS[currentIso.toUpperCase()];

    if (!hook.addressForm?.fullName?.trim())
      errors.fullName = "Receiver's name is required.";
    if (!hook.addressForm?.email?.trim()) {
      errors.email = "Email address is required.";
    } else if (!/\S+@\S+\.\S+/.test(hook.addressForm.email)) {
      errors.email = "Please enter a valid email address.";
    }

    const shippingPhone = hook.addressForm?.phone || "";
    if (!shippingPhone.trim()) {
      errors.phone = "Phone number is required.";
    } else if (phoneConfig && shippingPhone.length !== phoneConfig.rawLength) {
      errors.phone = `Phone number must be exactly ${phoneConfig.rawLength} digits long.`;
    }

    if (!hook.addressForm?.address?.trim())
      errors.address = "Street address location is required.";
    if (!hook.addressForm?.countryId)
      errors.countryId = "Please pick your country destination.";
    if (!hook.addressForm?.stateId)
      errors.stateId = "Please pick your state or region.";
    if (!hook.addressForm?.cityId)
      errors.cityId = "Please pick your city destination.";
    if (!hook.addressForm?.areaId)
      errors.areaId = "Please pick your area destination.";

    if (Object.keys(errors).length > 0) {
      setShippingErrors(errors);
      return false;
    }

    setShippingErrors({});
    setIsEditingShipping(false);
    return true;
  };

  const handleAddNewAddressTrigger = () => {
    hook.setAddressForm({
      fullName: "",
      email: "",
      phone: "",
      address: "",
      countryId: 0,
      stateId: 0,
      cityId: 0,
      areaId: 0,
      cityName: "",
      isoCode: "PK",
      phoneCode: "",
      addressBookId: 0,
    });
    setShippingErrors({});
    setIsEditingShipping(true);
  };

  const itemsList = checkoutData?.CartItemDtos?.CartItemList || [];

  return (
    <View style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.parent}>
          <ScrollView
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[
              styles.scrollContent,
              isKeyboardVisible && { paddingBottom: 40 },
            ]}
          >
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="card-outline" size={20} color="#E11D48" />
                <Text style={styles.cardTitle}>Billing Details</Text>
                {hasInitialBilling && (
                  <TouchableOpacity
                    style={{ marginLeft: "auto" }}
                    onPress={() => {
                      if (isEditingBilling) {
                        handleSaveBilling();
                      } else {
                        setIsEditingBilling(true);
                      }
                    }}
                  >
                    <Text style={styles.editLink}>
                      {isEditingBilling ? "Hide Details" : "Edit Details"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {!isEditingBilling ? (
                <View style={styles.addressDisplay}>
                  <Text style={styles.primaryText}>
                    {hook.billingForm?.fullName || "No Name Provided"}
                  </Text>
                  <Text style={styles.secondaryText}>
                    Contact: {hook.billingForm?.phone || "No Phone Provided"}
                  </Text>
                  <Text style={styles.secondaryText}>
                    Email: {hook.billingForm?.email || "No Email Provided"}
                  </Text>
                </View>
              ) : (
                <View style={styles.formContainer}>
                  <View style={styles.inputGroupContainer}>
                    <Text style={styles.fieldLabel}>Billing Full Name *</Text>
                    <TextInput
                      placeholder="Billing Payer Name"
                      placeholderTextColor="#94A3B8"
                      style={[
                        styles.input,
                        billingErrors.fullName && styles.inputErrorFrame,
                      ]}
                      value={hook.billingForm?.fullName}
                      onChangeText={(txt) => {
                        hook.setBillingForm?.((p: any) => ({
                          ...p,
                          fullName: txt,
                        }));
                        if (billingErrors.fullName)
                          setBillingErrors((p) => ({
                            ...p,
                            fullName: undefined,
                          }));
                      }}
                    />
                    {billingErrors.fullName && (
                      <Text style={styles.errorTextInline}>
                        {billingErrors.fullName}
                      </Text>
                    )}
                  </View>

                  <View style={styles.inputGroupContainer}>
                    <Text style={styles.fieldLabel}>
                      Billing Contact Phone *
                    </Text>

                    <View style={styles.phoneInputWrapper}>
                      {/* Interactively tap prefix to switch between PK and GB */}
                      <TouchableOpacity
                        style={styles.phonePrefixContainer}
                        activeOpacity={0.7}
                        onPress={() => {
                          const currentCode =
                            hook.billingForm?.phoneCode || "+92";
                          const nextCode = currentCode.includes("44")
                            ? "+92"
                            : "+44";

                          hook.setBillingForm?.((p: any) => ({
                            ...p,
                            phoneCode: nextCode,
                            // Re-clean existing phone numbers against the newly selected country config
                            phone: cleanRawPhoneNumber(
                              p.phone,
                              PHONE_CODE_TO_ISO[nextCode] || "PK",
                            ),
                          }));
                        }}
                      >
                        <Text style={styles.phonePrefixText}>
                          {hook.billingForm?.phoneCode || "+92"}
                        </Text>
                        {/* Subtle down indicator arrow showing it is interactively changeable */}
                        <Ionicons
                          name="chevron-down"
                          size={12}
                          color="#64748B"
                          style={{ marginLeft: 2 }}
                        />
                      </TouchableOpacity>

                      <TextInput
                        placeholder="**********"
                        placeholderTextColor="#94A3B8"
                        keyboardType="phone-pad"
                        style={[
                          styles.input,
                          styles.phoneInputFieldOverride,
                          billingErrors.phone && styles.inputErrorFrame,
                        ]}
                        value={hook.billingForm?.phone}
                        onChangeText={(txt) => {
                          const activeCode =
                            hook.billingForm?.phoneCode || "+92";
                          const targetIso =
                            PHONE_CODE_TO_ISO[activeCode] || "PK";

                          const cleaned = cleanRawPhoneNumber(txt, targetIso);

                          hook.setBillingForm?.((p: any) => ({
                            ...p,
                            phone: cleaned,
                          }));

                          if (billingErrors.phone) {
                            setBillingErrors((p) => ({
                              ...p,
                              phone: undefined,
                            }));
                          }
                        }}
                      />
                    </View>

                    {billingErrors.phone && (
                      <Text style={styles.errorTextInline}>
                        {billingErrors.phone}
                      </Text>
                    )}
                  </View>

                  <View style={styles.inputGroupContainer}>
                    <Text style={styles.fieldLabel}>
                      Billing Notification Email *
                    </Text>
                    <TextInput
                      placeholder="xyz@gmail.com"
                      placeholderTextColor="#94A3B8"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      style={[
                        styles.input,
                        billingErrors.email && styles.inputErrorFrame,
                      ]}
                      value={hook.billingForm?.email}
                      onChangeText={(txt) => {
                        hook.setBillingForm?.((p: any) => ({
                          ...p,
                          email: txt,
                        }));
                        if (billingErrors.email)
                          setBillingErrors((p) => ({ ...p, email: undefined }));
                      }}
                    />
                    {billingErrors.email && (
                      <Text style={styles.errorTextInline}>
                        {billingErrors.email}
                      </Text>
                    )}
                  </View>

                  {isBillingModified && (
                    <TouchableOpacity
                      style={styles.saveBtn}
                      onPress={handleSaveBilling}
                    >
                      <Text style={styles.saveBtnText}>
                        Save Billing Changes
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>

            {/* ==================== SHIPPING SECTION ==================== */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="location-outline" size={20} color="#E11D48" />
                <Text style={styles.cardTitle}>Shipping Details</Text>
                {hasInitialShipping && (
                  <TouchableOpacity
                    style={{ marginLeft: "auto" }}
                    onPress={() => {
                      if (isEditingShipping) {
                        handleSaveShipping();
                      } else {
                        setIsEditingShipping(true);
                      }
                    }}
                  >
                    <Text style={styles.editLink}>
                      {isEditingShipping ? "Hide Details" : "Edit Address"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {isEditingShipping ? (
                <View style={styles.formContainer}>
                  <View style={styles.addressActionRow}>
                    <TouchableOpacity
                      style={styles.addNewAddressBtnProfessional}
                      onPress={handleAddNewAddressTrigger}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="add-circle" size={18} color="#4F46E5" />
                      <Text style={styles.addNewAddressBtnTextProfessional}>
                        Set Up New Shipping Address
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {hook.savedAddresses?.length > 0 && (
                    <View style={styles.quickPickSection}>
                      <Text style={styles.subSectionLabel}>
                        Quick Select Destination:
                      </Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={{ marginTop: 8 }}
                      >
                        {hook.savedAddresses?.map(
                          (addr: any, index: number) => (
                            <TouchableOpacity
                              key={
                                addr.AddressId
                                  ? `addr-${addr.AddressId}`
                                  : `addr-idx-${index}`
                              }
                              style={styles.addressChip}
                              onPress={() => {
                                hook.handleSelectSavedAddress?.(addr);
                                setIsEditingShipping(false);
                              }}
                            >
                              <Ionicons
                                name="bookmark"
                                size={12}
                                color="#4F46E5"
                              />
                              <Text style={styles.chipText} numberOfLines={1}>
                                {addr.AddressLabel || addr.Address || "Address"}
                              </Text>
                            </TouchableOpacity>
                          ),
                        )}
                      </ScrollView>
                    </View>
                  )}

                  {/* Country Tabs */}
                  <View style={styles.inputGroupContainer}>
                    <SearchableDropdownPicker
                      label="Select Country *"
                      placeholder="Choose your country"
                      data={hook.countries}
                      selectedValue={hook.addressForm?.countryId}
                      error={shippingErrors.countryId}
                      onSelect={(val) => {
                        hook.handleCountryChange(val);
                        if (shippingErrors.countryId) {
                          setShippingErrors((p) => ({
                            ...p,
                            countryId: undefined,
                          }));
                        }
                      }}
                    />
                  </View>

                  {/* State Tabs */}
                  {Number(hook.addressForm?.countryId) > 0 && (
                    <View style={styles.inputGroupContainer}>
                      <SearchableDropdownPicker
                        label="Select State / Region *"
                        placeholder={
                          Number(hook.addressForm?.countryId) > 0
                            ? "Choose your state"
                            : "Select a country first"
                        }
                        data={hook.states}
                        selectedValue={hook.addressForm?.stateId}
                        error={shippingErrors.stateId}
                        disabled={
                          !hook.addressForm?.countryId ||
                          Number(hook.addressForm?.countryId) === 0
                        }
                        onSelect={(val) => {
                          hook.handleStateChange(val);
                          if (shippingErrors.stateId) {
                            setShippingErrors((p) => ({
                              ...p,
                              stateId: undefined,
                            }));
                          }
                        }}
                      />
                    </View>
                  )}

                  {/* City Tabs */}
                  {Number(hook.addressForm?.stateId) > 0 && (
                    <View style={styles.inputGroupContainer}>
                      <SearchableDropdownPicker
                        label="Select City *"
                        placeholder={
                          Number(hook.addressForm?.stateId) > 0
                            ? "Choose your city"
                            : "Select a state region first"
                        }
                        data={hook.cities}
                        selectedValue={hook.addressForm?.cityId}
                        error={shippingErrors.cityId}
                        disabled={
                          !hook.addressForm?.stateId ||
                          Number(hook.addressForm?.stateId) === 0
                        }
                        onSelect={(val) => {
                          hook.handleCityChange(val);
                          if (shippingErrors.cityId) {
                            setShippingErrors((p) => ({
                              ...p,
                              cityId: undefined,
                            }));
                          }
                        }}
                      />
                    </View>
                  )}

                  {Number(hook.addressForm?.cityId) > 0 && (
                    <View style={styles.inputGroupContainer}>
                      <SearchableDropdownPicker
                        label="Select Area *"
                        placeholder={
                          Number(hook.addressForm?.cityId) > 0
                            ? "Choose your area"
                            : "Select a city region first"
                        }
                        data={hook.areas}
                        selectedValue={hook.addressForm?.areaId}
                        error={shippingErrors.areaId}
                        disabled={
                          !hook.addressForm?.cityId ||
                          Number(hook.addressForm?.cityId) === 0
                        }
                        onSelect={(val) => {
                          hook.handleAreaChange(val);
                          if (shippingErrors.areaId) {
                            setShippingErrors((p) => ({
                              ...p,
                              areaId: undefined,
                            }));
                          }
                        }}
                      />
                    </View>
                  )}

                  {/* Form Fields */}
                  <View style={styles.inputGroupContainer}>
                    <Text style={styles.fieldLabel}>
                      Receiver's Full Name *
                    </Text>
                    <TextInput
                      placeholder="Your name"
                      placeholderTextColor="#94A3B8"
                      style={[
                        styles.input,
                        shippingErrors.fullName && styles.inputErrorFrame,
                      ]}
                      value={hook.addressForm?.fullName}
                      onChangeText={(txt) => {
                        hook.setAddressForm?.((p: any) => ({
                          ...p,
                          fullName: txt,
                        }));
                        if (shippingErrors.fullName)
                          setShippingErrors((p) => ({
                            ...p,
                            fullName: undefined,
                          }));
                      }}
                    />
                    {shippingErrors.fullName && (
                      <Text style={styles.errorTextInline}>
                        {shippingErrors.fullName}
                      </Text>
                    )}
                  </View>

                  <View style={styles.inputGroupContainer}>
                    <Text style={styles.fieldLabel}>
                      Receiver's Email Address *
                    </Text>
                    <TextInput
                      placeholder="xyz@gmail.com"
                      placeholderTextColor="#94A3B8"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      style={[
                        styles.input,
                        shippingErrors.email && styles.inputErrorFrame,
                      ]}
                      value={hook.addressForm?.email}
                      onChangeText={(txt) => {
                        hook.setAddressForm?.((p: any) => ({
                          ...p,
                          email: txt,
                        }));
                        if (shippingErrors.email)
                          setShippingErrors((p) => ({
                            ...p,
                            email: undefined,
                          }));
                      }}
                    />
                    {shippingErrors.email && (
                      <Text style={styles.errorTextInline}>
                        {shippingErrors.email}
                      </Text>
                    )}
                  </View>

                  <View style={styles.inputGroupContainer}>
                    <Text style={styles.fieldLabel}>Contact Number *</Text>
                    <View style={styles.phoneInputWrapper}>
                      <View style={styles.phonePrefixContainer}>
                        <Text style={styles.phonePrefixText}>
                          {COUNTRY_PHONE_CONFIGS[
                            (hook.addressForm?.isoCode || "PK").toUpperCase()
                          ]?.prefix || "+92"}
                        </Text>
                      </View>
                      <TextInput
                        placeholder="**********"
                        placeholderTextColor="#94A3B8"
                        keyboardType="phone-pad"
                        style={[
                          styles.input,
                          styles.phoneInputFieldOverride,
                          shippingErrors.phone && styles.inputErrorFrame,
                        ]}
                        value={hook.addressForm?.phone}
                        onChangeText={(txt) => {
                          const cleaned = cleanRawPhoneNumber(
                            txt,
                            hook.addressForm?.isoCode || "PK",
                          );
                          hook.setAddressForm?.((p: any) => ({
                            ...p,
                            phone: cleaned,
                          }));
                          if (shippingErrors.phone)
                            setShippingErrors((p) => ({
                              ...p,
                              phone: undefined,
                            }));
                        }}
                      />
                    </View>
                    {shippingErrors.phone && (
                      <Text style={styles.errorTextInline}>
                        {shippingErrors.phone}
                      </Text>
                    )}
                  </View>

                  <View style={styles.inputGroupContainer}>
                    <Text style={styles.fieldLabel}>
                      Street Address Location *
                    </Text>
                    <TextInput
                      placeholder="Apartment, suite, block, street address"
                      placeholderTextColor="#94A3B8"
                      style={[
                        styles.input,
                        shippingErrors.address && styles.inputErrorFrame,
                      ]}
                      value={hook.addressForm?.address}
                      onChangeText={(txt) => {
                        hook.setAddressForm?.((p: any) => ({
                          ...p,
                          address: txt,
                        }));
                        if (shippingErrors.address)
                          setShippingErrors((p) => ({
                            ...p,
                            address: undefined,
                          }));
                      }}
                    />
                    {shippingErrors.address && (
                      <Text style={styles.errorTextInline}>
                        {shippingErrors.address}
                      </Text>
                    )}
                  </View>

                  {isShippingModified && (
                    <TouchableOpacity
                      style={styles.saveBtn}
                      onPress={handleSaveShipping}
                    >
                      <Text style={styles.saveBtnText}>
                        Confirm Shipping Destination
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                <View style={styles.addressDisplay}>
                  <Text style={styles.primaryText}>
                    {hook.addressForm?.fullName || "No Name Configured"}
                  </Text>
                  <Text style={styles.secondaryText}>
                    Email: {hook.addressForm?.email || "N/A"}
                  </Text>
                  <Text style={styles.secondaryText}>
                    Address: {hook.addressForm?.address || "No Address Line"}
                  </Text>
                  <Text style={styles.secondaryText}>
                    City: {hook.addressForm?.cityName || "No City Selected"}
                  </Text>
                  <Text style={styles.secondaryText}>
                    ISO Code : {hook.addressForm?.isoCode || "N/A"}
                  </Text>
                  <Text style={styles.secondaryText}>
                    Phone Code : +{hook.addressForm?.phoneCode || "N/A"}
                  </Text>
                  <Text style={styles.secondaryText}>
                    Phone: {hook.addressForm?.phone || "N/A"}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.card}>
              <TouchableOpacity
                style={styles.cardHeaderToggle}
                onPress={() =>
                  hook.setShowDeliveryOptions?.(!hook.showDeliveryOptions)
                }
              >
                <Ionicons name="bicycle-outline" size={20} color="#E11D48" />
                <Text style={styles.cardTitle}>
                  Courier Delivery Selection Options
                </Text>
                <Ionicons
                  name={
                    hook.showDeliveryOptions ? "chevron-up" : "chevron-down"
                  }
                  size={18}
                  color="#64748B"
                  style={{ marginLeft: "auto" }}
                />
              </TouchableOpacity>

              {hook.showDeliveryOptions && (
                <View style={{ marginTop: 12, gap: 10 }}>
                  {hook.deliveryOptions?.map((opt: any, index: number) => {
                    const isSelected =
                      hook.selectedOption?.DeliveryTypeId ===
                      opt.DeliveryTypeId;
                    const deliveryKey = `delivery-${opt.DeliveryTypeId || index}`;
                    return (
                      <TouchableOpacity
                        key={deliveryKey}
                        style={[
                          styles.deliveryRowItem,
                          isSelected && styles.deliverySelectedRow,
                        ]}
                        onPress={() => {
                          // If it's already selected, clicking it again un-selects it (sets to null)
                          if (isSelected) {
                            hook.setSelectedOption?.(null);
                          } else {
                            hook.setSelectedOption?.(opt);
                          }
                        }}
                      >
                        <Ionicons
                          name={
                            isSelected ? "radio-button-on" : "radio-button-off"
                          }
                          size={18}
                          color={isSelected ? "#E11D48" : "#94A3B8"}
                        />
                        <View style={{ flex: 1, marginLeft: 10 }}>
                          <Text style={styles.deliveryName}>
                            {opt.DisplayName || opt.Name}
                          </Text>
                          <Text style={styles.deliveryMeta}>
                            Est Delivery: {opt.EstimatedDays || 3} Days
                          </Text>
                        </View>
                        <Text style={styles.deliveryCharge}>
                          Rs. {opt.Charge}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
            {/* 🛍️ 4. ORDER ITEMS SPECIFICATION LIST */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="basket-outline" size={20} color="#E11D48" />
                <Text style={styles.cardTitle}>
                  Order Items Summary ({checkoutData?.TotalItems || 0})
                </Text>
              </View>

              <View style={styles.itemsWrapperList}>
                {itemsList.map((item: any, idx: number) => {
                  const itemKey = `cart-item-${item.CartId || idx}`;
                  return (
                    <View key={itemKey} style={styles.itemRowNode}>
                      <Image
                        source={{ uri: item.ProductImage }}
                        style={styles.itemThumbnail}
                        resizeMode="cover"
                      />
                      <View style={styles.itemMetaBlock}>
                        <Text style={styles.itemNameText} numberOfLines={1}>
                          {item.ProductName}
                        </Text>

                        {/* High Fidelity Dynamic Variant Badges Parsing */}
                        {item.cartItemVariantList &&
                          item.cartItemVariantList.length > 0 && (
                            <View style={styles.variantBadgesContainer}>
                              {item.cartItemVariantList.map(
                                (v: any, vIdx: number) => (
                                  <View
                                    key={`v-${v.VariantId || vIdx}`}
                                    style={styles.variantBadge}
                                  >
                                    <Text style={styles.variantBadgeText}>
                                      {v.VariantGroup}: {v.VariantName}
                                    </Text>
                                  </View>
                                ),
                              )}
                            </View>
                          )}
                        <View style={styles.variantBadgesContainer}>
                          <Text style={styles.itemQuantityText}>
                            Qty: {item.Quantity}
                          </Text>
                          <Text style={styles.itemQuantityText}>
                            Disc: {item.DiscountedPrice}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.itemPriceText}>
                        Rs. {item.Price * item.Quantity}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
            {/* 📋 5. SPECIAL INSTRUCTIONS FLUID INPUTS */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color="#E11D48"
                />
                <Text style={styles.cardTitle}>Fulfillment Instructions</Text>
              </View>

              <View style={[styles.inputGroupContainer, { marginBottom: 14 }]}>
                <Text style={styles.fieldLabel}>
                  Delivery Drop-off Instructions
                </Text>
                <TextInput
                  placeholder="e.g. Leave with security, ring bell 2, leave near front gate..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={2}
                  textAlignVertical="top"
                  style={[styles.input, styles.textAreaInputOverride]}
                  value={hook.deliveryInstructions}
                  onChangeText={hook.setDeliveryInstructions}
                />
              </View>
              <View style={styles.inputGroupContainer}>
                <Text style={styles.fieldLabel}>
                  Special Order Customizations
                </Text>
                <TextInput
                  placeholder="e.g. Pack as fragile items, include extra safety padding..."
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={2}
                  textAlignVertical="top"
                  style={[styles.input, styles.textAreaInputOverride]}
                  value={hook.specialInstructions}
                  onChangeText={hook.setSpecialInstructions}
                />
              </View>
            </View>
            <View style={[styles.card, { marginBottom: 24 }]}>
              <View style={styles.cardHeader}>
                <Ionicons name="receipt-outline" size={20} color="#E11D48" />
                <Text style={styles.cardTitle}>Pricing Matrix Breakdown</Text>
              </View>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Items Subtotal</Text>
                <Text style={styles.priceValue}>
                  Rs. {hook.subtotal.toLocaleString()}
                </Text>
              </View>

              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Total Discount</Text>
                <Text style={styles.priceValue}>
                  Rs. {hook.discount.toLocaleString()}
                </Text>
              </View>

              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>
                  Delivery & Handling (
                  {hook.selectedOption?.DisplayName || "Standard"})
                </Text>
                <Text style={styles.priceValue}>
                  Rs. {hook.deliveryCharge.toLocaleString()}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.priceRow}>
                <Text style={styles.totalLabel}>Grand Total</Text>
                <Text style={styles.totalValue}>
                  Rs. {hook.grandTotal.toLocaleString()}
                </Text>
              </View>
            </View>

            {/* Professional Validation Warning Summary Modal */}
            <Modal
              visible={hook.errorModalVisible}
              animationType="fade"
              transparent={true}
            >
              <View style={styles.errorModalOverlay}>
                <View style={styles.errorCardContainer}>
                  <View style={styles.errorCardHeader}>
                    <Ionicons name="alert-circle" size={28} color="#EF4444" />
                    <Text style={styles.errorCardTitle}>
                      Missing Information
                    </Text>
                  </View>

                  <Text style={styles.errorCardSubtitle}>
                    Please complete the following required operational fields
                    before moving to payment:
                  </Text>

                  <View style={styles.errorListWrapper}>
                    <FlatList
                      data={Object.keys(hook.formErrors)}
                      keyExtractor={(item) => item}
                      renderItem={({ item }) => (
                        <View style={styles.errorItemRow}>
                          <Ionicons
                            name="arrow-forward"
                            size={14}
                            color="#F87171"
                            style={{ marginTop: 2 }}
                          />
                          <Text style={styles.errorItemText}>
                            {FIELD_LABELS[item] || item}
                          </Text>
                        </View>
                      )}
                    />
                  </View>

                  <TouchableOpacity
                    style={styles.errorDismissButton}
                    activeOpacity={0.8}
                    onPress={() => hook.setErrorModalVisible(false)}
                  >
                    <Text style={styles.errorDismissButtonText}>
                      Review Form
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
          </ScrollView>

          {!isKeyboardVisible && (
            <View style={styles.fixedBottomDock}>
              <View style={styles.dockTotalsColumn}>
                <Text style={styles.dockTotalLabel}>TOTAL AMOUNT</Text>
                <Text style={styles.dockTotalValue}>
                  Rs. {hook.grandTotal.toLocaleString()}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  hook.isSubmittingOrder && { opacity: 0.65 },
                ]}
                onPress={hook.handleProceedToPayment}
                disabled={hook.isSubmittingOrder}
              >
                {hook.isSubmittingOrder ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <>
                    <Text style={styles.actionButtonText}>Place Order</Text>
                    <Ionicons
                      name="chevron-forward-circle"
                      size={20}
                      color="#FFF"
                    />
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          <PromotionSuccessModal
            visible={hook.isSuccessModalVisible}
            title={hook.modalBody.title}
            description={hook.modalBody.description}
          />
          {hook.checkoutMessage && (
            <CustomErrorMessage>{hook.checkoutMessage}</CustomErrorMessage>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// Ensure you have these updated context styles in your StyleSheet object below:
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8FAFC" },
  parent: { flex: 1 },
  centerWrapper: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContainer: { flex: 1, backgroundColor: "#F8FAFC" },
  scrollContent: { padding: 16, paddingBottom: 120 },
  inputErrorFrame: {
    borderColor: "#EF4444",
    borderWidth: 1,
  },
  borderError: {
    borderColor: "#EF4444",
    borderWidth: 1,
  },
  errorTextLabel: {
    color: "#EF4444",
  },
  // Rest of your design specs...

  errorText: { fontSize: 15, color: "#EF4444" },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  cardHeaderToggle: { flexDirection: "row", alignItems: "center" },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E293B",
    marginLeft: 6,
  },
  editLink: { fontSize: 13, color: "#E11D48", fontWeight: "500" },
  addressDisplay: { gap: 4 },
  primaryText: { fontSize: 15, fontWeight: "600", color: "#334155" },
  secondaryText: { fontSize: 13, color: "#64748B" },
  formContainer: { gap: 14, marginTop: 4 },
  addressActionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 4,
  },
  addNewAddressBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
  },
  addNewAddressBtnText: { fontSize: 13, color: "#4F46E5", fontWeight: "600" },
  quickPickSection: { marginBottom: 4 },
  subSectionLabel: { fontSize: 13, fontWeight: "500", color: "#475569" },
  addressChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    gap: 4,
  },
  chipText: { fontSize: 12, color: "#334155", maxWidth: 120 },
  inputGroupContainer: { gap: 6 },
  fieldLabel: { fontSize: 12, fontWeight: "500", color: "#64748B" },

  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#0F172A",
    backgroundColor: "#FFF",
  },

  phoneInputWrapper: { flexDirection: "row", alignItems: "center" },

  phonePrefixContainer: {
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E2E8F0",
    borderRightWidth: 0,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    borderColor: "#CBD5E1",
    height: "100%",
  },
  phonePrefixText: { fontSize: 14, color: "#475569", fontWeight: "500" },
  phoneInputFieldOverride: {
    flex: 1,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  geoScrollRow: { flexDirection: "row", marginTop: 4 },
  geoTabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  geoTabActive: { backgroundColor: "#FFE4E6", borderColor: "#E11D48" },
  geoTabText: { fontSize: 13, color: "#64748B" },
  geoTabTextActive: { color: "#E11D48", fontWeight: "600" },
  saveBtn: {
    backgroundColor: "#1E293B",
    height: 44,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  saveBtnText: { color: "#FFF", fontSize: 14, fontWeight: "600" },
  deliveryRowItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    backgroundColor: "#FFF",
  },
  deliverySelectedRow: { borderColor: "#E11D48", backgroundColor: "#FFF1F2" },
  deliveryName: { fontSize: 14, fontWeight: "500", color: "#1E293B" },
  deliveryMeta: { fontSize: 12, color: "#64748B" },
  deliveryCharge: { fontSize: 14, fontWeight: "600", color: "#1E293B" },
  itemsWrapperList: { gap: 12 },
  itemRowNode: { flexDirection: "row", alignItems: "center" },
  itemThumbnail: {
    width: 52,
    height: 52,
    borderRadius: 6,
    backgroundColor: "#F1F5F9",
  },
  itemMetaBlock: { flex: 1, marginLeft: 12, justifyContent: "center" },
  itemNameText: { fontSize: 14, fontWeight: "500", color: "#1E293B" },
  variantBadgesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 2,
    marginBottom: 2,
  },
  variantBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  textAreaInputOverride: { minHeight: 64, paddingVertical: 10 },
  variantBadgeText: { fontSize: 11, color: "#475569", fontWeight: "500" },
  itemQuantityText: { fontSize: 12, color: "#64748B" },
  itemPriceText: { fontSize: 14, fontWeight: "600", color: "#1E293B" },
  textArea: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#1E293B",
    backgroundColor: "#F8FAFC",
    textAlignVertical: "top",
    marginTop: 8,
  },
  pricingStickyFooter: {
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    padding: 16,
    gap: 8,
  },
  breakdownRow: { flexDirection: "row", justifyContent: "space-between" },
  breakdownLabel: { fontSize: 13, color: "#64748B" },
  breakdownValue: { fontSize: 13, fontWeight: "500", color: "#1E293B" },
  totalDividerLine: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 4,
  },
  totalLabel: { fontSize: 15, fontWeight: "600", color: "#1E293B" },
  totalValue: { fontSize: 18, fontWeight: "700", color: "#E11D48" },
  errorBannerNotice: {
    fontSize: 12,
    color: "#EF4444",
    fontWeight: "500",
    textAlign: "center",
    marginTop: 4,
  },
  checkoutActionBtn: {
    backgroundColor: "#E11D48",
    height: 48,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  disabledBtn: { opacity: 0.6 },
  checkoutActionBtnText: { color: "#FFF", fontSize: 15, fontWeight: "600" },
  modalOverlayContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  alertCardContent: {
    width: "100%",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 12,
  },
  successIconOuterRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#D1FAE5",
    justifyContent: "center",
    alignItems: "center",
  },
  alertTitleLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#065F46",
    textAlign: "center",
  },
  alertDescLabel: {
    fontSize: 14,
    color: "#047857",
    textAlign: "center",
    lineHeight: 20,
  },
  loadingPipelineArea: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  pipelineText: { fontSize: 12, color: "#64748B", fontWeight: "500" },

  itemPrice: { fontSize: 14, fontWeight: "700", color: "#0F172A" },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  priceLabel: { fontSize: 14, color: "#64748B" },
  priceValue: { fontSize: 14, fontWeight: "600", color: "#1E293B" },
  divider: { height: 1, backgroundColor: "#E2E8F0", marginVertical: 10 },
  fixedBottomDock: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === "ios" ? 28 : 16,
    borderTopWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 20,
  },
  dockTotalsColumn: { flexDirection: "column", gap: 2 },
  dockTotalLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.5,
  },
  dockTotalValue: { fontSize: 20, fontWeight: "800", color: "#0F172A" },
  actionButton: {
    backgroundColor: "#E11D48",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#E11D48",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    minWidth: 160,
    justifyContent: "center",
  },
  actionButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
  },

  addNewAddressBtnProfessional: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF2F6", // Subtle soft gray background
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderStyle: "dashed", // Gives it an intentional interactive architectural look
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: "100%",
    marginVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  addNewAddressBtnTextProfessional: {
    color: "#4F46E5", // Professional tech indigo color
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },

  errorTextInline: {
    color: "#DC2626",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
    paddingLeft: 2,
  },

  errorModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorCardContainer: {
    width: "100%",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  errorCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  errorCardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  errorCardSubtitle: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
    marginBottom: 16,
  },
  errorListWrapper: {
    maxHeight: 180,
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  errorItemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginVertical: 4,
  },
  errorItemText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#991B1B",
  },
  errorDismissButton: {
    backgroundColor: "#0F172A",
    borderRadius: 12,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  errorDismissButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
