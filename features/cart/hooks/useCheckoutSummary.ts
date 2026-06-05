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
  console.log("Received checkout data in hook:", checkoutData);
  const { addresses } = useAddress(); // Grabs real database-saved customer records
  const { guestSessionId } = useSharedCartData();
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);
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
  const [specialInstructions, setSpecialInstructions] = useState(
    "There is nothing better than the Babar Azam's Cover drive",
  );
  const [deliveryInstructions, setDeliveryInstructions] = useState(
    "Oh Gone Surely Gone Yes Absolute Bump",
  );

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
      !addressForm.address ||
      !addressForm.city
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
      IsGiftOrder: true,
      ShippingDetail: {
        FullName: addressForm.fullName,
        EmailAddress: addressForm.email,
        Phone: addressForm.phone,
        Country: "Pakistan",
        CityId: checkoutData?.CityId || 0,
        // CityId: 1,
        Address: addressForm.address,
        City: addressForm.city || "",
        // City: "Lahore",
        AddressBookId: addressForm.addressBookId || 0,
        // AddressBookId: 0,
        Longitude: "34.33765",
        Latitude: "74.33789",
      },
      BillingDetail: {
        FullName: checkoutData?.BillingDetail?.FullName || addressForm.fullName,
        Phone: checkoutData?.BillingDetail?.Phone || addressForm.phone,
        EmailAddress:
          checkoutData?.BillingDetail?.EmailAddress || addressForm.email,
      },
      SessionId: guestSessionId || "",
      BranchId: checkoutData?.BranchId || 0,
      DeliveryDate: new Date().toISOString(),
      IsAddNewAddress: addressForm.addressBookId === 0,
      DeliveryOption: selectedOption.DeliveryTypeId,
      SpecialInstructions: specialInstructions,
      DeliveryInstructions: deliveryInstructions,
      OrderSource: 1, // Native App standard designation flag
      CityId: checkoutData?.CityId || 0,
      CountryId: checkoutData?.CountryId || 0,
      // CityId: 1,
      // CountryId: 169,
    };

    try {
      console.log(
        "Submitting Cleaned Order Payload:",
        JSON.stringify(orderPayload, null, 2),
      );
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
        setCheckoutMessage(
          response?.Message ||
            "Unexpected response from order processing. Please try again.",
        );
      }
    } catch (error: any) {
      console.log("Order Transaction Exception Block:", error);
      setCheckoutMessage(
        error?.response?.data?.Message ||
          "Network failed processing checkout session.",
      );
    } finally {
      setTimeout(() => setCheckoutMessage(null), 2000);
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
    checkoutMessage,
  };
}
