import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "expo-router";
import { orderApi, CreateOrderPayload } from "../services/orderApi";
import { useSharedCartData } from "@/store/CartContext";
import { useAuth } from "@/store/AuthContext";
import { useGlobalAddress } from "../../../store/AddressContext";
import apiClient from "../../../services/api/apiClient";
import * as SecureStore from "expo-secure-store";
import { sanitizeRawPhoneNumber } from "@/utils/sanatizeNumber";
interface GeoItem {
  Disabled: boolean;
  Group: any;
  Selected: boolean;
  Text: string;
  Value: string;
}

interface AddressForm {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  countryId: number;
  stateId: number;
  cityId: number;
  areaId: number;
  cityName: string;
  areaName: string;
  isoCode: string;
  phoneCode: string;
  addressBookId: number;
}

export interface DeliveryOption {
  DeliveryTypeId: number;
  Name: string;
  DisplayName: string;
  EstimatedDays: number;
  Charge: number;
}

export function useCheckoutSummary(checkoutData: any) {
  const router = useRouter();
  const { user, login: saveAuth } = useAuth();
  const { guestSessionId } = useSharedCartData();

  const {
    addresses,
    countries: rawCountries,
    states: contextStates,
    cities: contextCities,
    areas: contextAreas,
    loadCountries,
    loadStates,
    loadCities,
    loadAreasAndBranches,
    clearCascadingLocations,
  } = useGlobalAddress();

  // Determine if a genuine user account has accessible saved addresses
  const hasSavedAddresses = useMemo(
    () => Array.isArray(addresses) && addresses.length > 0,
    [addresses],
  );

  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);
  const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
  const [modalBody, setModalBody] = useState({ title: "", description: "" });
  const [showDeliveryOptions, setShowDeliveryOptions] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(!hasSavedAddresses);
  const [isEditingBilling, setIsEditingBilling] = useState(!hasSavedAddresses);
  const [originalAddressForm, setOriginalAddressForm] =
    useState<AddressForm | null>(null);

  const [addressForm, setAddressForm] = useState<AddressForm>({
    fullName: "",
    email: user?.Email || "",
    phone: "",
    address: "",
    countryId: 0,
    stateId: 0,
    cityId: 0,
    areaId: 0,
    cityName: "",
    isoCode: "",
    phoneCode: "",
    addressBookId: 0,
  });

  const [billingForm, setBillingForm] = useState({
    fullName: user?.Name || "",
    email: user?.Email || "",
    phone: user?.Phone || "",
    phoneCode: user?.PhoneCode || "",
  });

  const [formErrors, setFormErrors] = useState<any>({});

  useEffect(() => {
    if (hasSavedAddresses && addresses && addresses.length > 0) {
      const defaultAddr = addresses[0];
      console.log("tati is area :", defaultAddr.AreaId);
      const fallbackCountryId = defaultAddr?.CountryId
        ? Number(defaultAddr.CountryId)
        : 0;
      const matchedCountry = rawCountries?.find(
        (c) => Number(c.Value) === fallbackCountryId,
      );
      const targetPhoneCode =
        defaultAddr?.PhoneCode || matchedCountry?.Value === "169"
          ? "92"
          : "44" || "";
      const boundForm = {
        fullName: defaultAddr?.FullName || user?.Name || "",
        email: defaultAddr?.EmailAddress || user?.Email || "",
        // phone: defaultAddr?.PhoneNumber || user?.Phone || "",
        phone: sanitizeRawPhoneNumber(
          defaultAddr?.PhoneNumber || user?.Phone || "",
          targetPhoneCode,
        ),
        address: defaultAddr?.Address || "",
        countryId: fallbackCountryId,
        stateId: defaultAddr?.StateId ? Number(defaultAddr.StateId) : 0,
        cityId: defaultAddr?.CityId ? Number(defaultAddr.CityId) : 0,
        areaId: defaultAddr?.AreaId ? Number(defaultAddr.AreaId) : 0,
        cityName: defaultAddr?.City || "",

        isoCode:
          defaultAddr?.ISOCode || matchedCountry?.Value === "169"
            ? "PK"
            : "GB" || "",
        phoneCode: targetPhoneCode,
        addressBookId: defaultAddr?.AddressBookId || 0,
      };

      setAddressForm(boundForm);
      setOriginalAddressForm(boundForm);
      setIsEditingAddress(false);
      setIsEditingBilling(false);
    } else {
      setIsEditingAddress(true);
      setIsEditingBilling(true);
    }
    // Make sure to add 'countries' to the dependency array so it updates if the master list loads late
  }, [hasSavedAddresses, addresses, user, rawCountries]);
  // 🌟 Logic Rule 4: Compute if the form values have been altered (isDirty)
  const isAddressFormDirty = useMemo(() => {
    if (!originalAddressForm) return true; // If no baseline exists, keep it open
    return (
      addressForm.fullName !== originalAddressForm.fullName ||
      addressForm.email !== originalAddressForm.email ||
      addressForm.phone !== originalAddressForm.phone ||
      addressForm.address !== originalAddressForm.address ||
      addressForm.countryId !== originalAddressForm.countryId ||
      addressForm.stateId !== originalAddressForm.stateId ||
      addressForm.cityId !== originalAddressForm.cityId ||
      addressForm.areaId !== originalAddressForm.areaId
    );
  }, [addressForm, originalAddressForm]);

  // --- Filter Country Between Pakistan and UK ---
  const filteredCountries = useMemo(() => {
    if (!rawCountries || !Array.isArray(rawCountries)) return [];
    return (rawCountries as GeoItem[]).filter((country: GeoItem) => {
      const name = country?.Text?.toLowerCase() || "";
      return name === "pakistan" || name === "united kingdom" || name === "uk";
    });
  }, [rawCountries]);

  // --- Location Selection Flow Handlers ---
  useEffect(() => {
    if (loadCountries) loadCountries();
  }, [loadCountries]);

  useEffect(() => {
    if (addressForm.countryId && loadStates) {
      loadStates(addressForm.countryId);
    }
  }, [addressForm.countryId, loadStates]);

  useEffect(() => {
    if (addressForm.stateId && loadCities) {
      loadCities(addressForm.stateId);
    }
  }, [addressForm.stateId, loadCities]);

  useEffect(() => {
    if (addressForm.cityId && loadAreasAndBranches) {
      loadAreasAndBranches(addressForm.cityId);
    }
  }, [addressForm.cityId, loadAreasAndBranches]);

  const [specialInstructions, setSpecialInstructions] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<DeliveryOption | null>(
    null,
  );
  const [loadingOptions, setLoadingOptions] = useState<boolean>(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);

  const fetchDeliveryOptions = useCallback(async () => {
    setLoadingOptions(true);
    try {
      const response = await apiClient.get(
        "/Setting/delivery/services/options",
      );
      if (response.data?.Data) {
        setDeliveryOptions(response.data.Data);
      }
    } catch (error) {
      console.log("Failed fetching live dispatch rates:", error);
    } finally {
      setLoadingOptions(false);
    }
  }, []);

  useEffect(() => {
    fetchDeliveryOptions();
  }, [fetchDeliveryOptions]);

  const handleCountryChange = (id: number) => {
    const country = filteredCountries.find((c) => Number(c.Value) === id);

    if (Number(addressForm.countryId) !== id) {
      if (clearCascadingLocations) clearCascadingLocations("country");
    }

    let extractedIso = "";
    let extractedPhoneCode = "";

    if (country) {
      const nameLower = country.Text.toLowerCase();
      if (nameLower === "pakistan") {
        extractedIso = "PK";
        extractedPhoneCode = "92";
      } else if (nameLower === "united kingdom" || nameLower === "uk") {
        extractedIso = "GB";
        extractedPhoneCode = "44";
      }
    }

    setAddressForm((prev) => ({
      ...prev,
      countryId: id,
      isoCode: extractedIso,
      phoneCode: extractedPhoneCode,
      stateId: 0,
      cityId: 0,
      areaId: 0,
      cityName: "",
    }));
  };

  const handleStateChange = (id: number) => {
    if (Number(addressForm.stateId) !== id) {
      if (clearCascadingLocations) clearCascadingLocations("state");
    }

    setAddressForm((prev) => ({
      ...prev,
      stateId: id,
      cityId: 0,
      areaId: 0,
      cityName: "",
    }));
  };

  const handleCityChange = (id: number) => {
    const city = (contextCities as GeoItem[])?.find(
      (c: GeoItem) => Number(c.Value) === id,
    );
    setAddressForm((prev) => ({
      ...prev,
      cityId: id,
      areaId: 0,
      cityName: city?.Text || "",
    }));
  };

  const handleAreaChange = (id: number) => {
    const city = (contextAreas as GeoItem[])?.find(
      (c: GeoItem) => Number(c.Value) === id,
    );
    setAddressForm((prev) => ({
      ...prev,
      areaId: id,
      cityName: city?.Text || "",
    }));
  };

  const handleSelectSavedAddress = (addr: any) => {
    if (!addr) return;
    const countryVal = addr?.CountryId || 0;
    const stateVal = addr?.StateId || 0;
    const cityVal = addr?.CityId || 0;
    const areaVal = addr?.AreaId || 0;
    const targetPhoneCode =
      addr?.PhoneCode || addr?.CountryId === 169 ? "92" : "44" || "";
    const chosenForm = {
      fullName: addr?.FullName || user?.Name || "",
      email: addr?.EmailAddress || user?.Email || "",
      // phone: addr?.PhoneNumber || user?.Phone || "",
      phone: sanitizeRawPhoneNumber(
        addr?.PhoneNumber || user?.Phone || "",
        targetPhoneCode,
      ),
      address: addr?.Address || "",
      countryId: countryVal ? Number(countryVal) : 0,
      stateId: stateVal ? Number(stateVal) : 0,
      cityId: cityVal ? Number(cityVal) : 0,
      areaId: areaVal ? Number(areaVal) : 0,
      cityName: addr?.City || "",
      isoCode: addr?.ISOCode || addr?.CountryId === 169 ? "PK" : "GB" || "",
      phoneCode: targetPhoneCode,
      addressBookId: addr?.AddressBookId || 0,
    };

    setAddressForm(chosenForm);
    setOriginalAddressForm(chosenForm); // Update baseline back to this new tracking entity
    setIsEditingAddress(false);
  };

  // Helper method allowing users to discard changes safely and snap back to clean original references
  const handleCancelAddressEditing = () => {
    if (originalAddressForm) {
      setAddressForm(originalAddressForm);
    }
    setIsEditingAddress(false);
  };

  const validateForm = () => {
    let errors: any = {};

    // Shipping validation
    if (!addressForm.fullName) errors.fullName = "Full name is required";
    if (!addressForm.email) errors.email = "Email address is required";
    if (!addressForm.phone) errors.phone = "Phone number is required";
    if (!addressForm.address) errors.address = "Street address is required";
    if (!addressForm.countryId) errors.countryId = "Country is required";
    if (!addressForm.stateId) errors.stateId = "State is required";
    if (!addressForm.cityId) errors.cityId = "City is required";
    if (!addressForm.areaId) errors.areaId = "Area is required";
    // Billing validation
    if (!billingForm.fullName)
      errors.billingFullName = "Billing full name is required";
    if (!billingForm.email) errors.billingEmail = "Billing email is required";
    if (!billingForm.phone) errors.billingPhone = "Billing phone is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProceedToPayment = async () => {
    if (!validateForm()) {
      setErrorModalVisible(true);
      return;
    }

    setIsSubmittingOrder(true);

    const orderPayload: CreateOrderPayload = {
      IsGiftOrder: true,
      ShippingDetail: {
        FullName: addressForm.fullName,
        EmailAddress: addressForm.email,
        Phone: addressForm.phone,
        CityId: addressForm.cityId,
        CountryId: addressForm.countryId,
        StateId: addressForm.stateId,
        Address: addressForm.address,
        ISOCode: addressForm.isoCode,
        City: addressForm.cityName,
        AddressBookId: addressForm.addressBookId,
        Longitude: "0.0",
        Latitude: "0.0",
      },
      BillingDetail: {
        FullName: billingForm.fullName,
        EmailAddress: billingForm.email,
        Phone: billingForm.phone,
      },
      SessionId: guestSessionId || "",
      BranchId: addressForm.areaId,
      DeliveryDate: new Date().toISOString(),
      ISOCode: addressForm.isoCode,
      PhoneCode: addressForm.phoneCode,
      IsAddNewAddress: addressForm.addressBookId === 0,
      DeliveryOption: selectedOption?.DeliveryTypeId || 0,
      SpecialInstructions: specialInstructions || "None",
      DeliveryInstructions: deliveryInstructions || "None",
      OrderSource: 1,
      CityId: addressForm.cityId,
      CountryId: addressForm.countryId,
    };

    try {
      const response = await orderApi.createOrder(orderPayload);
      if (response?.HttpStatusCode === 200 || response?.Data?.OrderId) {
        const generatedOrderId = response.Data.OrderId;
        const userInfo = response.Data.UserInfoDto;
        const tokenPayload = userInfo?.LoginTokenResponseModel;

        // 1. Authenticate the user immediately
        if (tokenPayload?.AccessToken) {
          await saveAuth(tokenPayload);

          // 2. Safeguard: Store wizard payload in SecureStore so it persists across screen lifecycles
          const wizardPayload = {
            fullName: tokenPayload.FullName || "",
            email: tokenPayload.Email || "",
            phone: tokenPayload.PhoneNumber || "",
          };
          await SecureStore.setItemAsync(
            "PENDING_WELCOME_WIZARD",
            JSON.stringify(wizardPayload),
          );
        }

        // 3. Clean navigation without cluttered params
        router.push({
          pathname: "/(cart)/payment-methods",
          params: { orderId: String(generatedOrderId) },
        });
      }
    } catch (error: any) {
      setCheckoutMessage(
        error?.response?.data?.Message || "Order execution pipeline failed.",
      );
    } finally {
      setIsSubmittingOrder(false);
      setTimeout(() => setCheckoutMessage(null), 3000);
    }
  };

  const subtotal = useMemo(
    () => checkoutData?.OrderTotalPrice || 0,
    [checkoutData],
  );
  const deliveryCharge = useMemo(
    () => selectedOption?.Charge || 0,
    [selectedOption],
  );
  const grandTotal = useMemo(
    () => subtotal + deliveryCharge,
    [subtotal, deliveryCharge],
  );

  return {
    hasSavedAddresses,
    isEditingAddress,
    setIsEditingAddress,
    isEditingBilling,
    setIsEditingBilling,
    isAddressFormDirty, // 🌟 UI hook to switch visibility of Save vs Hide buttons
    handleCancelAddressEditing, // 🌟 UI function to close form manually
    savedAddresses: addresses || [],

    addressForm,
    setAddressForm,
    billingForm,
    setBillingForm,
    countries: filteredCountries,
    states: contextStates || [],
    cities: contextCities || [],
    areas: contextAreas || [],
    formErrors,
    specialInstructions,
    setSpecialInstructions,
    deliveryInstructions,
    setDeliveryInstructions,
    deliveryOptions,
    selectedOption,
    setSelectedOption,
    showDeliveryOptions,
    setShowDeliveryOptions,
    isSubmittingOrder,
    checkoutMessage,
    loadingOptions,

    subtotal,
    deliveryCharge,
    grandTotal,
    errorModalVisible,
    setErrorModalVisible,
    handleCountryChange,
    handleStateChange,
    handleCityChange,
    handleAreaChange,
    handleSelectSavedAddress,
    handleProceedToPayment,
    isSuccessModalVisible,
    setIsSuccessModalVisible,
    modalBody,
  };
}
