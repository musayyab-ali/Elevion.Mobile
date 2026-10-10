import { useSharedCartData } from "@/store/CartContext";
import { useState } from "react";
import { useRouter } from "expo-router";
import { findStockIssues, stockSummary, toStockLine } from "../utils/cartStock";
export function useCartScreen() {
  const router = useRouter();
  const {
    cartData,
    updateCartItemQuantity,
    removeCartItem,
    executeCheckout,
    fixStockIssues,
  } = useSharedCartData();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [fixingStock, setFixingStock] = useState(false);
  const cartItems = cartData?.CartItemList ?? [];
  const stockIssues = findStockIssues(cartItems.map(toStockLine));
  const stockProblem = stockSummary(stockIssues);

  const fixStock = async () => {
    setFixingStock(true);
    try {
      await fixStockIssues();
    } finally {
      setFixingStock(false);
    }
  };
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

  const handleProcessCheckoutPipeline = async () => {
    // The button is disabled too; this keeps any other caller honest.
    if (stockIssues.length > 0) return;
    setCheckoutLoading(true);
    try {
      const invoiceReceipt = await executeCheckout([]);
      if (invoiceReceipt && invoiceReceipt.Data) {
        router.push({
          pathname: "/(cart)/checkout-summary",
          params: { data: JSON.stringify(invoiceReceipt.Data) },
        });
      }
    } catch (err: any) {
      // ✅ Extract the exact server response error if available
      let serverMessage =
        err?.response?.data?.Message ||
        err?.message ||
        "Something went wrong processing your order.";

      console.log("Checkout error:", serverMessage);
    } finally {
      setCheckoutLoading(false);
    }
  };
  return {
    cartItems,
    pricingSummary,
    handleIncrement,
    handleDecrement,
    handleRemove: removeCartItem,
    handleProcessCheckoutPipeline,
    checkoutLoading,
    stockIssues,
    stockProblem,
    fixStock,
    fixingStock,
  };
}
