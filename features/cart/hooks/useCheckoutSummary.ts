// import { useState, useEffect, useCallback, useMemo } from "react";
// import { useRouter } from "expo-router";
// import apiClient from "../../../services/api/apiClient";
// import { orderApi, CreateOrderPayload } from "../services/orderApi";
// import { useAddress } from "@/features/customer/hooks/useAddress";
// import { useSharedCartData } from "@/store/CartContext";
// import * as SecureStore from "expo-secure-store";
// import { useAuth } from "@/store/AuthContext";

// interface AddressForm {
//   fullName: string;
//   country: "Pakistan" | "England";
//   phone: string;
//   address: string;
//   city: string;
//   email: string;
//   addressBookId: number;
// }

// export interface DeliveryOption {
//   DeliveryTypeId: number;
//   Name: string;
//   DisplayName: string;
//   EstimatedDays: number;
//   Charge: number;
// }

// export interface FormErrors {
//   fullName?: string;
//   phone?: string;
//   address?: string;
//   city?: string;
// }

// export function useCheckoutSummary(checkoutData: any) {
//   const { login: saveAuth } = useAuth();
//   const router = useRouter();
//   const { addresses } = useAddress();
//   const { guestSessionId } = useSharedCartData();

//   const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);
//   const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
//   const [modalBody, setModalBody] = useState({ title: "", description: "" });

//   // 1. Core Address Form State with Country Selector Logic
//   const [addressForm, setAddressForm] = useState<AddressForm>({
//     fullName: checkoutData?.ShippingDetail?.FullName || "",
//     country: "Pakistan", // Default selector assignment
//     phone: checkoutData?.ShippingDetail?.Phone || "",
//     address: checkoutData?.ShippingDetail?.Address || "",
//     city: checkoutData?.ShippingDetail?.City || "",
//     email: checkoutData?.ShippingDetail?.EmailAddress || "customer@store.com",
//     addressBookId: checkoutData?.ShippingDetail?.AddressBookId || 0,
//   });

//   // Dedicated state tracker for field-specific error feedback labels
//   const [formErrors, setFormErrors] = useState<FormErrors>({});

//   const [isAddressSaved, setIsAddressSaved] = useState<boolean>(
//     !!checkoutData?.ShippingDetail?.Address &&
//       !!checkoutData?.ShippingDetail?.FullName,
//   );

//   // 2. Dynamic Manual Form Input States for Instructions
//   const [specialInstructions, setSpecialInstructions] = useState("");
//   const [deliveryInstructions, setDeliveryInstructions] = useState("");

//   // Courier state management
//   const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
//   const [selectedOption, setSelectedOption] = useState<DeliveryOption | null>(
//     null,
//   );
//   const [loadingOptions, setLoadingOptions] = useState<boolean>(false);
//   const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);

//   // Fetch standard courier variants
//   const fetchDeliveryOptions = useCallback(async () => {
//     setLoadingOptions(true);
//     try {
//       const response = await apiClient.get(
//         "/Setting/delivery/services/options",
//       );
//       if (response.data?.Data) {
//         setDeliveryOptions(response.data.Data);
//         if (response.data.Data.length > 0) {
//           setSelectedOption(response.data.Data[0]);
//         }
//       }
//     } catch (error) {
//       console.log("Failed fetching live dispatch rates:", error);
//     } finally {
//       setLoadingOptions(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchDeliveryOptions();
//   }, [fetchDeliveryOptions]);

//   // Handle auto-binding saved addresses
//   const handleSelectSavedAddress = (addr: any) => {
//     setAddressForm({
//       fullName: addr?.FullName || "",
//       country: "Pakistan",
//       phone: addr?.PhoneNumber || "",
//       address: addr?.Address || "",
//       city: addr?.City || "",
//       email: addr?.EmailAddress || "customer@store.com",
//       addressBookId: addr?.AddressId || 0,
//     });
//     setFormErrors({});
//     setIsAddressSaved(true);
//   };

//   // 4. Client-Side Field Parameter Validations
//   const validateForm = (): boolean => {
//     const errors: FormErrors = {};

//     if (!addressForm.fullName.trim()) {
//       errors.fullName = "Full name is required";
//     } else if (/[0-9]/.test(addressForm.fullName)) {
//       errors.fullName = "Name cannot contain numerical digits";
//     }

//     if (!addressForm.phone.trim()) {
//       errors.phone = "Phone number is required";
//     } else {
//       // Validate complete format lengths based on country selection context
//       const digitsOnly = addressForm.phone.replace(/\D/g, "");
//       if (addressForm.country === "Pakistan" && digitsOnly.length < 10) {
//         errors.phone = "Please enter a valid Pakistani phone number";
//       } else if (addressForm.country === "England" && digitsOnly.length < 9) {
//         errors.phone = "Please enter a valid UK phone number";
//       }
//     }

//     if (!addressForm.address.trim()) {
//       errors.address =
//         "Complete street address delivery destination is required";
//     }

//     if (!addressForm.city.trim()) {
//       errors.city = "City destination parameter is required";
//     }

//     setFormErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   const handleSaveAddress = () => {
//     if (validateForm()) {
//       setIsAddressSaved(true);
//     }
//   };

//   // Live total price evaluation configurations
//   const subtotal = useMemo(() => {
//     return (
//       checkoutData?.OrderTotalPrice ||
//       checkoutData?.CartItemDtos?.TotalPrice ||
//       0
//     );
//   }, [checkoutData]);

//   const deliveryCharge = useMemo(() => {
//     return selectedOption
//       ? selectedOption.Charge
//       : checkoutData?.DeliveryCharges || 0;
//   }, [selectedOption, checkoutData]);

//   const grandTotal = useMemo(() => {
//     return subtotal + deliveryCharge;
//   }, [subtotal, deliveryCharge]);

//   // Derived target parameters mapping based on active country selection state variables
//   const computedCountryMeta = useMemo(() => {
//     if (addressForm.country === "England") {
//       return { countryName: "England", countryId: 76 }; // Target mapping code lookup
//     }
//     return { countryName: "Pakistan", countryId: 169 }; // Fallback system standard keys
//   }, [addressForm.country]);

//   // Master execution chain: Orders creation setup
//   const handleProceedToPayment = async () => {
//     // Prevent checkout routing flows if structural field profiles remain unconfirmed
//     if (!isAddressSaved) {
//       if (!validateForm()) {
//         setCheckoutMessage(
//           "Please resolve shipping address form errors first.",
//         );
//         setTimeout(() => setCheckoutMessage(null), 3000);
//         return;
//       }
//       setIsAddressSaved(true);
//     }

//     if (!selectedOption) {
//       setCheckoutMessage(
//         "Please select a valid delivery carrier method layout option.",
//       );
//       setTimeout(() => setCheckoutMessage(null), 3000);
//       return;
//     }

//     setIsSubmittingOrder(true);

//     // Build the request payload matching the Swagger specification precisely
//     const orderPayload: CreateOrderPayload = {
//       IsGiftOrder: true,
//       ShippingDetail: {
//         FullName: addressForm.fullName,
//         EmailAddress: addressForm.email,
//         Phone: addressForm.phone,
//         Country: computedCountryMeta.countryName,
//         CityId: checkoutData?.CityId || 1,
//         Address: addressForm.address,
//         City: addressForm.city,
//         AddressBookId: addressForm.addressBookId || 0,
//         Longitude: "34.33765",
//         Latitude: "74.33789",
//       },
//       BillingDetail: {
//         FullName: checkoutData?.BillingDetail?.FullName || addressForm.fullName,
//         Phone: checkoutData?.BillingDetail?.Phone || addressForm.phone,
//         EmailAddress:
//           checkoutData?.BillingDetail?.EmailAddress || addressForm.email,
//       },
//       SessionId: guestSessionId || "",
//       BranchId: checkoutData?.BranchId || 0,
//       DeliveryDate: new Date().toISOString(),
//       IsAddNewAddress: addressForm.addressBookId === 0,
//       DeliveryOption: selectedOption.DeliveryTypeId,
//       SpecialInstructions: specialInstructions.trim() || "None",
//       DeliveryInstructions: deliveryInstructions.trim() || "None",
//       OrderSource: 1,
//       CityId: checkoutData?.CityId || 1,
//       CountryId: computedCountryMeta.countryId,
//       // FIX: Binding the correct total value configurations down to processing paths
//       // OrderTotalPrice: grandTotal,
//     };

//     try {
//       console.log(
//         "Submitting Cleaned Order Payload:",
//         JSON.stringify(orderPayload, null, 2),
//       );
//       const response = await orderApi.createOrder(orderPayload);
//       console.log("Order Creation Response:", response);

//       if (response?.HttpStatusCode === 200 || response?.Data?.OrderId) {
//         const generatedOrderId = response.Data.OrderId;
//         const userInfo = response.Data.UserInfoDto;
//         const tokenPayload = userInfo?.LoginTokenResponseModel;
//         const currentLocalToken =
//           await SecureStore.getItemAsync("access_token");

//         if (tokenPayload?.AccessToken && !currentLocalToken) {
//           console.log(
//             "⚡ Seamless Guest-to-User Elevation Detected. Provisioning Account...",
//           );
//           await saveAuth(tokenPayload);

//           setModalBody({
//             title: "Welcome to the Family! 🎉",
//             description: `Account successfully provisioned for ${tokenPayload.FullName || "User"}.\nYour profile secure keys have been synced! Redirecting to payment parameters...`,
//           });
//           setIsSuccessModalVisible(true);

//           setTimeout(() => {
//             setIsSuccessModalVisible(false);
//             router.push({
//               pathname: "/(tabs)/cart/payment-methods",
//               params: { orderId: String(generatedOrderId) },
//             });
//           }, 3500);
//           return;
//         }

//         router.push({
//           pathname: "/(tabs)/cart/payment-methods",
//           params: { orderId: String(generatedOrderId) },
//         });
//       } else {
//         setCheckoutMessage(
//           response?.Message || "Unexpected response from order processing.",
//         );
//       }
//     } catch (error: any) {
//       console.log("Order Transaction Exception Block:", error);
//       setCheckoutMessage(
//         error?.response?.data?.Message ||
//           "Network failed processing checkout session.",
//       );
//     } finally {
//       setTimeout(() => setCheckoutMessage(null), 3000);
//       setIsSubmittingOrder(false);
//     }
//   };

//   return {
//     addressForm,
//     setAddressForm,
//     formErrors,
//     isAddressSaved,
//     setIsAddressSaved,
//     specialInstructions,
//     setSpecialInstructions,
//     deliveryInstructions,
//     setDeliveryInstructions,
//     deliveryOptions,
//     selectedOption,
//     setSelectedOption,
//     loadingOptions,
//     isSubmittingOrder,
//     savedAddresses: addresses || [],
//     subtotal,
//     deliveryCharge,
//     grandTotal,
//     handleSelectSavedAddress,
//     handleSaveAddress,
//     handleProceedToPayment,
//     checkoutMessage,
//     isSuccessModalVisible,
//     setIsSuccessModalVisible,
//     modalBody,
//   };
// }

// import { useState, useEffect, useCallback, useMemo } from "react";
// import { useRouter } from "expo-router";
// import { orderApi, CreateOrderPayload } from "../services/orderApi";
// import { useSharedCartData } from "@/store/CartContext";
// import { useAuth } from "@/store/AuthContext";
// import { useGlobalAddress } from "../../../store/AddressContext";
// import apiClient from "../../../services/api/apiClient";
// // Updated type mapping to reflect your exact backend lookup payload schema
// interface GeoItem {
//   Disabled: boolean;
//   Group: any;
//   Selected: boolean;
//   Text: string; // Represents country/state/city name strings (e.g. "Pakistan")
//   Value: string; // Represents stringified Primary ID integers (e.g. "1")
// }

// interface AddressForm {
//   fullName: string;
//   email: string;
//   phone: string;
//   address: string;
//   countryId: number;
//   stateId: number;
//   cityId: number;
//   cityName: string;
//   isoCode: string;
//   phoneCode: string;
//   addressBookId: number;
// }

// export interface DeliveryOption {
//   DeliveryTypeId: number;
//   Name: string;
//   DisplayName: string;
//   EstimatedDays: number;
//   Charge: number;
// }

// export function useCheckoutSummary(checkoutData: any) {
//   const { login: saveAuth, user } = useAuth();
//   const router = useRouter();
//   const { guestSessionId } = useSharedCartData();

//   const {
//     addresses,
//     countries: rawCountries,
//     states: contextStates,
//     cities: contextCities,
//     loadCountries,
//     loadStates,
//     loadCities,
//     clearCascadingLocations,
//   } = useGlobalAddress();

//   // const isAuthenticated = !!user;
//   const isAuthenticated =
//     !!checkoutData?.ShippingDetail?.Address &&
//     !!checkoutData?.ShippingDetail?.FullName;
//   // 1. UI Display Toggle States (Read-only by default for Auth users)
//   const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);
//   const [isSuccessModalVisible, setIsSuccessModalVisible] = useState(false);
//   const [modalBody, setModalBody] = useState({ title: "", description: "" });
//   const [showDeliveryOptions, setShowDeliveryOptions] = useState(false);

//   // Toggle flags for swapping between Form Field views and Professional Text summaries
//   const [isEditingAddress, setIsEditingAddress] = useState(!isAuthenticated);
//   const [isEditingBilling, setIsEditingBilling] = useState(!isAuthenticated);

//   const [addressForm, setAddressForm] = useState<AddressForm>(() => {
//     const rawPhone = checkoutData?.ShippingDetail?.Phone || "";
//     const cleanPhone = rawPhone.trim();

//     let inferredCountryId = 0;
//     let inferredIso = "";
//     let inferredPhoneCode = "";

//     if (checkoutData?.ShippingDetail?.CountryId) {
//       inferredCountryId = Number(checkoutData.ShippingDetail.CountryId);
//     } else if (cleanPhone) {
//       if (
//         cleanPhone.startsWith("+92") ||
//         cleanPhone.startsWith("92") ||
//         cleanPhone.startsWith("30")
//       ) {
//         inferredCountryId = 169;
//         inferredIso = "PK";
//         inferredPhoneCode = "92";
//       } else {
//         inferredCountryId = 236;
//         inferredIso = "GB";
//         inferredPhoneCode = "44";
//       }
//     }

//     return {
//       fullName: checkoutData?.ShippingDetail?.FullName || "",
//       // Fallback strictly to user?.Email if missing
//       email:
//         checkoutData?.ShippingDetail?.EmailAddress === "" || "Null"
//           ? user?.Email
//           : checkoutData?.ShippingDetail?.EmailAddress || "",
//       phone: rawPhone,
//       address: checkoutData?.ShippingDetail?.Address || "",
//       countryId: inferredCountryId,
//       stateId: checkoutData?.ShippingDetail?.StateId
//         ? Number(checkoutData.ShippingDetail.StateId)
//         : 0,
//       cityId: checkoutData?.ShippingDetail?.CityId
//         ? Number(checkoutData.ShippingDetail.CityId)
//         : 0,
//       cityName: checkoutData?.ShippingDetail?.City || "",
//       isoCode:
//         checkoutData?.ShippingDetail?.ISOCode === "" || "Null"
//           ? inferredIso
//           : checkoutData?.ShippingDetail?.ISOCode || "",
//       phoneCode: checkoutData?.PhoneCode || inferredPhoneCode,
//       addressBookId: checkoutData?.ShippingDetail?.AddressBookId
//         ? Number(checkoutData.ShippingDetail.AddressBookId)
//         : 0,
//     };
//   });

//   // --- 2. Change Handlers (Keep unchanged) ---

//   const [billingForm, setBillingForm] = useState({
//     fullName: user?.Name || checkoutData?.BillingDetail?.FullName || "",
//     email: user?.Email || checkoutData?.BillingDetail?.EmailAddress || "",
//     phone: user?.Phone || checkoutData?.BillingDetail?.Phone || "",
//   });

//   const [formErrors, setFormErrors] = useState<any>({});

//   // --- Fixed Country Filter Logic parsing "Text" fields correctly ---
//   const filteredCountries = useMemo(() => {
//     if (!rawCountries || !Array.isArray(rawCountries)) return [];
//     return (rawCountries as GeoItem[]).filter((country: GeoItem) => {
//       const name = country?.Text?.toLowerCase() || "";
//       return name === "pakistan" || name === "united kingdom" || name === "uk";
//     });
//   }, [rawCountries]);

//   // --- Location Cascade Core Side-Effects ---
//   useEffect(() => {
//     if (loadCountries) loadCountries();
//   }, [loadCountries]);

//   useEffect(() => {
//     if (addressForm.countryId && loadStates) {
//       loadStates(addressForm.countryId);
//     }
//   }, [addressForm.countryId, loadStates]);

//   useEffect(() => {
//     if (addressForm.stateId && loadCities) {
//       loadCities(addressForm.stateId);
//     }
//   }, [addressForm.stateId, loadCities]);

//   const [specialInstructions, setSpecialInstructions] = useState("");
//   const [deliveryInstructions, setDeliveryInstructions] = useState("");

//   // Courier state management
//   const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
//   const [selectedOption, setSelectedOption] = useState<DeliveryOption | null>(
//     null,
//   );
//   const [loadingOptions, setLoadingOptions] = useState<boolean>(false);
//   const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);

//   // Fetch standard courier variants
//   const fetchDeliveryOptions = useCallback(async () => {
//     setLoadingOptions(true);
//     try {
//       const response = await apiClient.get(
//         "/Setting/delivery/services/options",
//       );
//       if (response.data?.Data) {
//         setDeliveryOptions(response.data.Data);
//         // if (response.data.Data.length > 0) {
//         //   setSelectedOption(response.data.Data[0]);
//         // }
//       }
//     } catch (error) {
//       console.log("Failed fetching live dispatch rates:", error);
//     } finally {
//       setLoadingOptions(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchDeliveryOptions();
//   }, [fetchDeliveryOptions]);

//   const handleCountryChange = (id: number) => {
//     const country = filteredCountries.find((c) => Number(c.Value) === id);

//     // ONLY clear cascading if the country actually changed manually
//     if (Number(addressForm.countryId) !== id) {
//       if (clearCascadingLocations) clearCascadingLocations("country");
//     }

//     let extractedIso = "";
//     let extractedPhoneCode = "";

//     if (country) {
//       const nameLower = country.Text.toLowerCase();
//       if (nameLower === "pakistan") {
//         extractedIso = "PK";
//         extractedPhoneCode = "92";
//       } else if (nameLower === "united kingdom" || nameLower === "uk") {
//         extractedIso = "GB";
//         extractedPhoneCode = "44";
//       }
//     }

//     setAddressForm((prev) => ({
//       ...prev,
//       countryId: id,
//       isoCode: extractedIso,
//       phoneCode: extractedPhoneCode,
//       stateId: 0,
//       cityId: 0,
//       cityName: "",
//     }));
//   };

//   const handleStateChange = (id: number) => {
//     if (Number(addressForm.stateId) !== id) {
//       if (clearCascadingLocations) clearCascadingLocations("state");
//     }

//     setAddressForm((prev) => ({
//       ...prev,
//       stateId: id,
//       cityId: 0,
//       cityName: "",
//     }));
//   };

//   const handleCityChange = (id: number) => {
//     const city = (contextCities as GeoItem[])?.find(
//       (c: GeoItem) => Number(c.Value) === id,
//     );
//     setAddressForm((prev) => ({
//       ...prev,
//       cityId: id,
//       cityName: city?.Text || "",
//     }));
//   };

//   const handleSelectSavedAddress = (addr: any) => {
//     if (!addr) return;

//     const countryVal = addr?.CountryId || addr?.countryId || 0;
//     const stateVal = addr?.StateId || addr?.stateId || 0;
//     const cityVal = addr?.CityId || addr?.cityId || 0;

//     setAddressForm({
//       fullName: addr?.FullName || addr?.fullName || user?.Name || "",
//       email: addr?.EmailAddress || addr?.email || user?.Email || "",
//       phone: addr?.PhoneNumber || addr?.phone || user?.Phone || "",
//       address: addr?.Address || addr?.address || "",
//       countryId: countryVal ? Number(countryVal) : 0,
//       stateId: stateVal ? Number(stateVal) : 0,
//       cityId: cityVal ? Number(cityVal) : 0,
//       cityName: addr?.CityName || addr?.cityName || addr?.City || "",
//       isoCode: addr?.ISOCode || addr?.isoCode || "",
//       phoneCode: addr?.PhoneCode || addr?.phoneCode || "",
//       addressBookId: addr?.AddressId || addr?.addressId || addr?.Id || 0,
//     });
//     setIsEditingAddress(false);
//   };

//   const validateForm = () => {
//     let errors: any = {};
//     if (!addressForm.fullName) errors.fullName = "Required";
//     if (!addressForm.email) errors.email = "Required";
//     if (!addressForm.phone) errors.phone = "Required";
//     if (!addressForm.address) errors.address = "Required";
//     if (!addressForm.countryId) errors.countryId = "Required";
//     if (!addressForm.stateId) errors.stateId = "Required";
//     if (!addressForm.cityId) errors.cityId = "Required";

//     if (!billingForm.fullName) errors.billingFullName = "Required";
//     if (!billingForm.email) errors.billingEmail = "Required";
//     if (!billingForm.phone) errors.billingPhone = "Required";

//     setFormErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   const handleProceedToPayment = async () => {
//     if (!validateForm()) {
//       console.log(formErrors);
//       setCheckoutMessage("Please fill all required operational info fields.");
//       setTimeout(() => setCheckoutMessage(null), 3000);
//       return;
//     }

//     setIsSubmittingOrder(true);

//     const orderPayload: CreateOrderPayload = {
//       IsGiftOrder: false,
//       ShippingDetail: {
//         FullName: addressForm.fullName,
//         EmailAddress: addressForm.email,
//         Phone: addressForm.phone,
//         CityId: addressForm.cityId,
//         CountryId: addressForm.countryId,
//         StateId: addressForm.stateId,
//         Address: addressForm.address,
//         ISOCode: addressForm.isoCode,
//         City: addressForm.cityName,
//         AddressBookId: addressForm.addressBookId,
//         Longitude: "0.0",
//         Latitude: "0.0",
//       },
//       BillingDetail: {
//         FullName: billingForm.fullName,
//         EmailAddress: billingForm.email,
//         Phone: billingForm.phone,
//       },
//       SessionId: guestSessionId || "",
//       BranchId: checkoutData?.BranchId || 1,
//       DeliveryDate: new Date().toISOString(),
//       ISOCode: addressForm.isoCode,
//       PhoneCode: addressForm.phoneCode,
//       IsAddNewAddress: addressForm.addressBookId === 0,
//       DeliveryOption: selectedOption?.DeliveryTypeId || 1,
//       SpecialInstructions: specialInstructions || "None",
//       DeliveryInstructions: deliveryInstructions || "None",
//       OrderSource: 1,
//       CityId: addressForm.cityId,
//       CountryId: addressForm.countryId,
//     };
//     console.log("sending order payload :", orderPayload);
//     try {
//       const response = await orderApi.createOrde(orderPayload);
//       if (response?.HttpStatusCode === 200 || response?.Data?.OrderId) {
//         const generatedOrderId = response.Data.OrderId;
//         const userInfo = response.Data.UserInfoDto;
//         const tokenPayload = userInfo?.LoginTokenResponseModel;

//         if (tokenPayload?.AccessToken) {
//           await saveAuth(tokenPayload);
//         }

//         router.push({
//           pathname: "/(tabs)/cart/payment-methods",
//           params: { orderId: String(generatedOrderId) },
//         });
//       }
//     } catch (error: any) {
//       setCheckoutMessage(
//         error?.response?.data?.Message || "Order execution pipeline failed.",
//       );
//     } finally {
//       setIsSubmittingOrder(false);
//       setTimeout(() => setCheckoutMessage(null), 3000);
//     }
//   };

//   const subtotal = useMemo(
//     () => checkoutData?.OrderTotalPrice || 0,
//     [checkoutData],
//   );
//   const deliveryCharge = useMemo(
//     () => selectedOption?.Charge || 0,
//     [selectedOption],
//   );
//   const grandTotal = useMemo(
//     () => subtotal + deliveryCharge,
//     [subtotal, deliveryCharge],
//   );

//   return {
//     isAuthenticated,
//     isEditingAddress,
//     setIsEditingAddress,
//     isEditingBilling,
//     setIsEditingBilling,
//     savedAddresses: addresses || [],

//     addressForm,
//     setAddressForm,
//     billingForm,
//     setBillingForm,
//     countries: filteredCountries,
//     states: contextStates || [],
//     cities: contextCities || [],
//     formErrors,
//     specialInstructions,
//     setSpecialInstructions,
//     deliveryInstructions,
//     setDeliveryInstructions,
//     deliveryOptions,
//     selectedOption,
//     setSelectedOption,
//     showDeliveryOptions,
//     setShowDeliveryOptions,
//     isSubmittingOrder,
//     checkoutMessage,
//     loadingOptions,

//     subtotal,
//     deliveryCharge,
//     grandTotal,

//     handleCountryChange,
//     handleStateChange,
//     handleCityChange,
//     handleSelectSavedAddress,
//     handleProceedToPayment,
//     isSuccessModalVisible,
//     setIsSuccessModalVisible,
//     modalBody,
//   };
// }

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "expo-router";
import { orderApi, CreateOrderPayload } from "../services/orderApi";
import { useSharedCartData } from "@/store/CartContext";
import { useAuth } from "@/store/AuthContext";
import { useGlobalAddress } from "../../../store/AddressContext";
import apiClient from "../../../services/api/apiClient";
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
  cityName: string;
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
  const { user } = useAuth();
  const { guestSessionId } = useSharedCartData();

  const {
    addresses,
    countries: rawCountries,
    states: contextStates,
    cities: contextCities,
    loadCountries,
    loadStates,
    loadCities,
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

  // Dynamic initialization flags: summary visible if addresses exist, otherwise forms open
  const [isEditingAddress, setIsEditingAddress] = useState(!hasSavedAddresses);
  const [isEditingBilling, setIsEditingBilling] = useState(!hasSavedAddresses);

  // Store the initial structure state to support Form Dirty State matching rules
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
    cityName: "",
    isoCode: "",
    phoneCode: "",
    addressBookId: 0,
  });

  const [billingForm, setBillingForm] = useState({
    fullName: user?.Name || "",
    email: user?.Email || "",
    phone: user?.Phone || "",
  });

  const [formErrors, setFormErrors] = useState<any>({});

  useEffect(() => {
    if (hasSavedAddresses && addresses && addresses.length > 0) {
      const defaultAddr = addresses[0];
      const fallbackCountryId = defaultAddr?.CountryId
        ? Number(defaultAddr.CountryId)
        : 0;

      // 1. Find the master country configuration based on the address's countryId
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

        // 2. Handle missing StateId gracefully (fallback to 0 or first state if applicable)
        stateId: defaultAddr?.StateId ? Number(defaultAddr.StateId) : 0,
        cityId: defaultAddr?.CityId ? Number(defaultAddr.CityId) : 0,
        cityName: defaultAddr?.City || "",

        // 3. Automatically inject missing codes from the master country configuration
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
      addressForm.cityId !== originalAddressForm.cityId
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
      cityName: city?.Text || "",
    }));
  };

  const handleSelectSavedAddress = (addr: any) => {
    if (!addr) return;
    console.log(addr?.CountryId);
    const countryVal = addr?.CountryId || 0;
    const stateVal = addr?.StateId || 0;
    const cityVal = addr?.CityId || 0;
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

    // Shipping checks
    if (!addressForm.fullName) errors.fullName = "Full name is required";
    if (!addressForm.email) errors.email = "Email address is required";
    if (!addressForm.phone) errors.phone = "Phone number is required";
    if (!addressForm.address) errors.address = "Street address is required";
    if (!addressForm.countryId) errors.countryId = "Country is required";
    if (!addressForm.stateId) errors.stateId = "State is required";
    if (!addressForm.cityId) errors.cityId = "City is required";

    // Billing checks
    if (!billingForm.fullName)
      errors.billingFullName = "Billing full name is required";
    if (!billingForm.email) errors.billingEmail = "Billing email is required";
    if (!billingForm.phone) errors.billingPhone = "Billing phone is required";

    // Delivery check
    // if (!selectedOption)
    //   errors.deliveryOption = "Please choose a courier service option";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProceedToPayment = async () => {
    console.log("form errors are :", formErrors);
    if (!validateForm()) {
      setCheckoutMessage("Please fill all required operational info fields.");
      setTimeout(() => setCheckoutMessage(null), 3000);
      return;
    }

    setIsSubmittingOrder(true);

    const orderPayload: CreateOrderPayload = {
      IsGiftOrder: false,
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
      BranchId: checkoutData?.BranchId || 1,
      DeliveryDate: new Date().toISOString(),
      ISOCode: addressForm.isoCode,
      PhoneCode: addressForm.phoneCode,
      IsAddNewAddress: addressForm.addressBookId === 0,
      DeliveryOption: selectedOption?.DeliveryTypeId || 1,
      SpecialInstructions: specialInstructions || "None",
      DeliveryInstructions: deliveryInstructions || "None",
      OrderSource: 1,
      CityId: addressForm.cityId,
      CountryId: addressForm.countryId,
    };

    try {
      console.log("sending payload is :", orderPayload);
      const response = await orderApi.createOrder(orderPayload);
      if (response?.HttpStatusCode === 200 || response?.Data?.OrderId) {
        router.push({
          pathname: "/(tabs)/cart/payment-methods",
          params: { orderId: String(response.Data.OrderId) },
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

    handleCountryChange,
    handleStateChange,
    handleCityChange,
    handleSelectSavedAddress,
    handleProceedToPayment,
    isSuccessModalVisible,
    setIsSuccessModalVisible,
    modalBody,
  };
}
