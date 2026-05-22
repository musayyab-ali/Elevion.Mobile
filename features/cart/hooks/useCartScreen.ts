// import { useSharedCartData } from "@/store/CartContext";
// import { useRouter } from "expo-router";

// export function useCartScreen() {
//   const router = useRouter();
//   const {
//     cartData,
//     loading,
//     updateCartItemQuantity,
//     removeCartItem,
//     executeCheckout,
//     apiMessage,
//   } = useSharedCartData();

//   const cartItems = cartData?.CartItemList ?? [];
//   const pricingSummary = {
//     subtotal: cartData?.TotalPrice ?? 0,
//     discount: cartData?.TotalDiscount ?? 0,
//     grandTotal: cartData?.NetTotal ?? 0,
//     deliveryEnabled: cartData?.HomeDeliveryEnable ?? true,
//   };

//   const handleIncrement = (cartId: number, currentQuantity: number) => {
//     updateCartItemQuantity(cartId, currentQuantity + 1);
//   };

//   const handleDecrement = (cartId: number, currentQuantity: number) => {
//     if (currentQuantity > 1) {
//       updateCartItemQuantity(cartId, currentQuantity - 1);
//     } else {
//       removeCartItem(cartId);
//     }
//   };

//   const handleProcessCheckoutPipeline = async () => {
//     try {
//       // Execute the endpoint matrix pipeline
//       const invoiceReceipt = await executeCheckout([]);
//       if (invoiceReceipt) {
//         // Direct route user straight to a gorgeous transaction confirmation summary screen
//         router.push({
//           pathname: "/(tabs)/cart/order-success",
//           params: { orderSummary: JSON.stringify(invoiceReceipt.Data) },
//         });
//       }
//     } catch (err) {
//       console.log("Checkout process stopped due to validation errors.");
//     }
//   };

//   return {
//     cartItems,
//     pricingSummary,
//     loading,
//     errorMessage: apiMessage,
//     handleIncrement,
//     handleDecrement,
//     handleRemove: removeCartItem,
//     handleProcessCheckoutPipeline,
//   };
// }
import { Alert } from "react-native"; // Add Alert import
import { useSharedCartData } from "@/store/CartContext";
import { useRouter } from "expo-router";
export function useCartScreen() {
  const router = useRouter();
  const {
    cartData,
    loading,
    updateCartItemQuantity,
    removeCartItem,
    executeCheckout,
    apiMessage,
  } = useSharedCartData();

  const cartItems = cartData?.CartItemList ?? [];
  const pricingSummary = {
    subtotal: cartData?.TotalPrice ?? 0,
    discount: cartData?.TotalDiscount ?? 0,
    grandTotal: cartData?.NetTotal ?? 0,
    deliveryEnabled: cartData?.HomeDeliveryEnable ?? true,
  };

  const handleIncrement = (cartId: number, currentQuantity: number) => {
    updateCartItemQuantity(cartId, currentQuantity + 1);
  };

  const handleDecrement = (cartId: number, currentQuantity: number) => {
    if (currentQuantity > 1) {
      updateCartItemQuantity(cartId, currentQuantity - 1);
    } else {
      removeCartItem(cartId);
    }
  };

  // const handleProcessCheckoutPipeline = async () => {
  //   try {
  //     console.log("fuck me");
  //     const invoiceReceipt = await executeCheckout([]);
  //     console.log("fuck responce", invoiceReceipt);
  //     // 2. Safely verify execution structure status matches valid data signatures
  //     if (invoiceReceipt && invoiceReceipt.Data) {
  //       router.push({
  //         pathname: "/(tabs)/cart/checkout-summary",
  //         params: { data: JSON.stringify(invoiceReceipt.Data) },
  //       });
  //     }
  //   } catch (err) {
  //     console.log("Checkout process stopped due to API or validation errors.");
  //     Alert.alert(
  //       "Checkout Error",
  //       "Something went wrong processing your order. Please check your data.",
  //     );
  //   }
  // };
  const handleProcessCheckoutPipeline = async () => {
    try {
      const invoiceReceipt = await executeCheckout([]);

      if (invoiceReceipt && invoiceReceipt.Data) {
        router.push({
          pathname: "/(tabs)/cart/checkout-summary",
          params: { data: JSON.stringify(invoiceReceipt.Data) },
        });
      }
    } catch (err: any) {
      console.log("Checkout process stopped due to API or validation errors.");

      // ✅ Extract the exact server response error if available
      const serverMessage =
        err?.response?.data?.Message ||
        err?.message ||
        "Something went wrong processing your order.";

      Alert.alert("Checkout Error", serverMessage);
    }
  };
  return {
    cartItems,
    pricingSummary,
    loading,
    errorMessage: apiMessage,
    handleIncrement,
    handleDecrement,
    handleRemove: removeCartItem,
    handleProcessCheckoutPipeline,
  };
}
