// import { useState, useEffect, useCallback, useMemo } from "react";
// import { Alert } from "react-native";
// import { useRouter } from "expo-router";
// import apiClient from "../../../services/api/apiClient"; // Adjust this path to your apiClient
// import { useAddress } from "@/features/customer/hooks/useAddress";

// interface AddressForm {
//   fullName: string;
//   phone: string;
//   address: string;
//   city: string;
// }

// export interface DeliveryOption {
//   DeliveryTypeId: number;
//   Name: string;
//   DisplayName: string;
//   EstimatedDays: number;
//   Charge: number;
// }

// export function useCheckoutSummary(checkoutData: any) {
//   const router = useRouter();
//   const { addresses } = useAddress(); // Accesses user saved database addresses
//   console.log(addresses);
//   // Shipping form tracking state
//   const [addressForm, setAddressForm] = useState<AddressForm>({
//     fullName: checkoutData?.ShippingDetail?.FullName || "",
//     phone: checkoutData?.ShippingDetail?.Phone || "",
//     address: checkoutData?.ShippingDetail?.Address || "",
//     city: checkoutData?.ShippingDetail?.City || "",
//   });

//   const [isAddressSaved, setIsAddressSaved] = useState<boolean>(
//     !!checkoutData?.ShippingDetail?.Address &&
//       !!checkoutData?.ShippingDetail?.FullName,
//   );

//   // Delivery options tracking configurations
//   const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
//   const [selectedOption, setSelectedOption] = useState<DeliveryOption | null>(
//     null,
//   );
//   const [loadingOptions, setLoadingOptions] = useState<boolean>(false);
//   const [showSavedAddresses, setShowSavedAddresses] = useState<boolean>(false);

//   // Fetch structural delivery methods from API backend
//   const fetchDeliveryOptions = useCallback(async () => {
//     setLoadingOptions(true);
//     try {
//       const response = await apiClient.get(
//         "/Setting/delivery/services/options",
//       );
//       if (response.data?.Data) {
//         console.log("Fetched Delivery Options:", response.data.Data);
//         setDeliveryOptions(response.data.Data);
//         // Default select the first available tier option
//         if (response.data.Data.length > 0) {
//           setSelectedOption(response.data.Data[0]);
//         }
//       }
//     } catch (error) {
//       console.error("Failed loading backend courier variations:", error);
//     } finally {
//       setLoadingOptions(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchDeliveryOptions();
//   }, [fetchDeliveryOptions]);

//   // Bind address details automatically upon selection
//   const handleSelectSavedAddress = (addr: any) => {
//     setAddressForm({
//       fullName:
//         addr?.FullName || checkoutData?.ShippingDetail?.FullName || "Customer",
//       phone: addr?.PhoneNumber || "",
//       address: addr?.Address || "",
//       city: addr?.City || "",
//     });
//     setShowSavedAddresses(false);
//   };

//   const handleSaveAddress = () => {
//     if (
//       !addressForm.fullName ||
//       !addressForm.phone ||
//       !addressForm.address
//       //   !addressForm.city
//     ) {
//       Alert.alert(
//         "Missing Fields",
//         "Please populate all structural delivery parameters safely.",
//       );
//       return;
//     }
//     setIsAddressSaved(true);
//   };

//   // Dynamic Grand Total computation loop mapping reactive delivery method allocations
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

//   const handleProceedToPayment = () => {
//     if (!isAddressSaved) {
//       Alert.alert(
//         "Shipping Required",
//         "Please provide and save your shipping address information before proceeding.",
//       );
//       return;
//     }
//     if (!selectedOption) {
//       Alert.alert(
//         "Delivery Tier Missing",
//         "Please select a courier dispatch framework option.",
//       );
//       return;
//     }

//     router.push({
//       pathname: "/(tabs)/cart/payment-methods",
//       params: {
//         orderAmount: String(grandTotal),
//         shippingDetails: JSON.stringify(addressForm),
//         deliveryOption: JSON.stringify(selectedOption),
//       },
//     });
//   };

//   return {
//     addressForm,
//     setAddressForm,
//     isAddressSaved,
//     setIsAddressSaved,
//     deliveryOptions,
//     selectedOption,
//     setSelectedOption,
//     loadingOptions,
//     savedAddresses: addresses || [],
//     showSavedAddresses,
//     setShowSavedAddresses,
//     subtotal,
//     deliveryCharge,
//     grandTotal,
//     handleSelectSavedAddress,
//     handleSaveAddress,
//     handleProceedToPayment,
//   };
// }

import { useState, useEffect, useCallback, useMemo } from "react";
import { Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import apiClient from "../../../services/api/apiClient";
import { orderApi, CreateOrderPayload } from "../services/orderApi";
import { useAddress } from "@/features/customer/hooks/useAddress"; // Assuming custom global hook handles DB calls
import { useSharedCartData } from "@/store/CartContext";
interface AddressForm {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  email: string;
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

  const { addresses } = useAddress(); // Grabs real database-saved customer records
  const { guestSessionId } = useSharedCartData();

  console.log(`tati is : ${guestSessionId}`);
  // Shipping form data mapping
  const [addressForm, setAddressForm] = useState<AddressForm>({
    fullName: checkoutData?.ShippingDetail?.FullName || "",
    phone: checkoutData?.ShippingDetail?.Phone || "",
    address: checkoutData?.ShippingDetail?.Address || "",
    city: checkoutData?.ShippingDetail?.City || "",
    email: checkoutData?.ShippingDetail?.EmailAddress || "customer@store.com",
    addressBookId: checkoutData?.ShippingDetail?.AddressBookId || 0,
  });

  const [isAddressSaved, setIsAddressSaved] = useState<boolean>(
    !!checkoutData?.ShippingDetail?.Address &&
      !!checkoutData?.ShippingDetail?.FullName,
  );

  // Core instruction parameters
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");

  // Courier state management
  const [deliveryOptions, setDeliveryOptions] = useState<DeliveryOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<DeliveryOption | null>(
    null,
  );
  const [loadingOptions, setLoadingOptions] = useState<boolean>(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);

  // Fetch standard courier variants
  const fetchDeliveryOptions = useCallback(async () => {
    setLoadingOptions(true);
    try {
      const response = await apiClient.get(
        "/Setting/delivery/services/options",
      );
      if (response.data?.Data) {
        setDeliveryOptions(response.data.Data);
        if (response.data.Data.length > 0) {
          setSelectedOption(response.data.Data[0]); // Fallback assignment
        }
      }
    } catch (error) {
      console.error("Failed fetching live dispatch rates:", error);
    } finally {
      setLoadingOptions(false);
    }
  }, []);

  useEffect(() => {
    fetchDeliveryOptions();
  }, [fetchDeliveryOptions]);

  // Handle auto-binding saved addresses
  const handleSelectSavedAddress = (addr: any) => {
    setAddressForm({
      fullName: addr?.FullName || "",
      phone: addr?.PhoneNumber || "",
      address: addr?.Address || "",
      city: addr?.City || "",
      email: addr?.EmailAddress || "customer@store.com",
      addressBookId: addr?.AddressId || 0, // Maps to AddressBookId
    });
    setIsAddressSaved(true);
  };

  const handleSaveAddress = () => {
    if (
      !addressForm.fullName ||
      !addressForm.phone ||
      !addressForm.address
      // !addressForm.city
    ) {
      Alert.alert(
        "Incomplete Parameters",
        "Please populate all mandatory shipping input properties.",
      );
      return;
    }
    setIsAddressSaved(true);
  };

  // Live total price evaluation
  const subtotal = useMemo(() => {
    return (
      checkoutData?.OrderTotalPrice ||
      checkoutData?.CartItemDtos?.TotalPrice ||
      0
    );
  }, [checkoutData]);

  const deliveryCharge = useMemo(() => {
    return selectedOption
      ? selectedOption.Charge
      : checkoutData?.DeliveryCharges || 0;
  }, [selectedOption, checkoutData]);

  const grandTotal = useMemo(() => {
    return subtotal + deliveryCharge;
  }, [subtotal, deliveryCharge]);

  // Master execution chain: Orders creation setup
  const handleProceedToPayment = async () => {
    if (!isAddressSaved) {
      Alert.alert(
        "Shipping Address Required",
        "Please provide and confirm your destination details.",
      );
      return;
    }
    if (!selectedOption) {
      Alert.alert(
        "Delivery Method Required",
        "Please select a standard delivery option.",
      );
      return;
    }

    setIsSubmittingOrder(true);

    // Build the request payload matching the Swagger specification precisely
    const orderPayload: CreateOrderPayload = {
      IsGiftOrder: false,
      ShippingDetail: {
        FullName: addressForm.fullName,
        EmailAddress: addressForm.email,
        Phone: addressForm.phone,
        Country: "Pakistan",
        CityId: checkoutData?.CityId || 0,
        Address: addressForm.address,
        City: addressForm.city,
        AddressBookId: addressForm.addressBookId,
        Longitude: "0.0",
        Latitude: "0.0",
      },
      BillingDetail: {
        FullName: checkoutData?.BillingDetail?.FullName || addressForm.fullName,
        Phone: checkoutData?.BillingDetail?.Phone || addressForm.phone,
        EmailAddress:
          checkoutData?.BillingDetail?.EmailAddress || addressForm.email,
      },
      SessionId: guestSessionId,
      BranchId: checkoutData?.BranchId || 0,
      DeliveryDate: new Date().toISOString(),
      IsAddNewAddress: addressForm.addressBookId === 0,
      DeliveryOption: selectedOption.DeliveryTypeId,
      SpecialInstructions: specialInstructions,
      DeliveryInstructions: deliveryInstructions,
      OrderSource: 1, // Native App standard designation flag
      CityId: checkoutData?.CityId || 0,
      CountryId: checkoutData?.CountryId || 0,
    };

    try {
      console.log("Submitting Order with Payload:", orderPayload);
      const response = await orderApi.createOrder(orderPayload);
      console.log("Order Creation Response:", response);
      if (response?.HttpStatusCode === 200 || response?.Data?.OrderId) {
        const generatedOrderId = response.Data.OrderId;
        console.log("Generated Order ID:", generatedOrderId);
        // Pass the fresh OrderId directly to the payment routing node
        router.push({
          pathname: "/(tabs)/cart/payment-methods",
          params: { orderId: String(generatedOrderId) },
        });
      } else {
        Alert.alert(
          "Order Failure",
          response?.Message || "Database could not construct order entry.",
        );
      }
    } catch (error: any) {
      console.error("Order Transaction Exception Block:", error);
      Alert.alert(
        "Error Handling",
        error?.response?.data?.Message ||
          "Network failed processing checkout session.",
      );
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return {
    addressForm,
    setAddressForm,
    isAddressSaved,
    setIsAddressSaved,
    specialInstructions,
    setSpecialInstructions,
    deliveryInstructions,
    setDeliveryInstructions,
    deliveryOptions,
    selectedOption,
    setSelectedOption,
    loadingOptions,
    isSubmittingOrder,
    savedAddresses: addresses || [],
    subtotal,
    deliveryCharge,
    grandTotal,
    handleSelectSavedAddress,
    handleSaveAddress,
    handleProceedToPayment,
  };
}
