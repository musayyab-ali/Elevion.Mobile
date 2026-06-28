import { useState, useEffect, useCallback } from "react";
import { Platform, Keyboard, Linking } from "react-native";
import { useRouter } from "expo-router";
import { paymentApi } from "../services/paymentApi";
import { orderApi } from "@/features/cart/services/orderApi";
// 🌟 Highly organized localized notification interface
export interface ScreenNotification {
  type: "success" | "error" | null;
  text: string;
}

export function usePaymentMethods(orderId: string) {
  const router = useRouter();

  // Core Structural Application States
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<any>(null);
  const [gateways, setGateways] = useState<any[]>([]);
  const [selectedGatewayId, setSelectedGatewayId] = useState<number | null>(
    null,
  );
  const [isCODAvailable, setIsCODAvailable] = useState(false);

  // Keyboard Dynamic Visibility State
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Marketing & Reward Operations States
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{
    id: number;
    discount: number;
    code: string;
  } | null>(null);
  const [pointsToRedeem, setPointsToRedeem] = useState("");
  const [pointsApplied, setPointsApplied] = useState(false);

  // Status state engines replacing legacy Alerts
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  // Professional, non-obtrusive inline visual feedback states
  const [promoNotification, setPromoNotification] =
    useState<ScreenNotification>({ type: null, text: "" });
  const [pointsNotification, setPointsNotification] =
    useState<ScreenNotification>({ type: null, text: "" });
  const [generalNotification, setGeneralNotification] =
    useState<ScreenNotification>({ type: null, text: "" });
  const [cancelMessage, setCancelMessage] = useState<ScreenNotification>({
    type: null,
    text: "",
  });

  // Controlled UI State Overlay For Confirmations
  const [isCancelConfirmVisible, setIsCancelConfirmVisible] = useState(false);
  const [activeCancelOrderId, setActiveCancelOrderId] = useState<string | null>(
    null,
  );
  const [cancellationReasons, setCancellationReasons] = useState<any[]>([]);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [loadingReasons, setLoadingReasons] = useState(false);

  // Calculations Struct Nodes
  const [totals, setTotals] = useState({
    subtotal: 0,
    deliveryCharges: 0,
    discount: 0,
    grandTotal: 0,
  });

  // --- KEYBOARD LISTENER SETUP ---
  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showListener = Keyboard.addListener(showEvent, () =>
      setIsKeyboardVisible(true),
    );
    const hideListener = Keyboard.addListener(hideEvent, () =>
      setIsKeyboardVisible(false),
    );

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, []);

  const triggerCancelConfirmation = async (targetOrderId: string) => {
    setActiveCancelOrderId(targetOrderId);
    setSelectedReason(null); // Reset selection on a clean state interaction
    setIsCancelConfirmVisible(true);
    setCancelMessage({ type: null, text: "" });
    setLoadingReasons(true);

    try {
      const res = await orderApi.getOrderCancellationReasons();
      // Safely map through Axios wrapper tracking your 'Data' array array structure
      if (res?.data?.Data) {
        setCancellationReasons(res.data.Data.filter((r: any) => !r.Disabled));
      }
    } catch (err) {
      console.log(
        "Failed fetching dynamic cancel structural items context logs:",
        err,
      );
    } finally {
      setLoadingReasons(false);
    }
  };

  const loadPaymentSetup = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      const res = await paymentApi.getPaymentSetup(orderId);
      if (
        (res?.HttpStatusCode === 200 || res?.HttpStatusCode === 100) &&
        res?.Data
      ) {
        const orderDto = res.Data.OrderDto;

        setOrderData(orderDto);
        setGateways(res.Data.PaymentGateways || []);
        setIsCODAvailable(orderDto?.IsCODPaymentEnable || false);

        setTotals({
          subtotal: orderDto?.OrderAmount || 0,
          deliveryCharges: orderDto?.DeliveryCharges || 0,
          discount: orderDto?.NetDiscount || 0,
          grandTotal: orderDto?.NetAmount || 0,
        });

        if (orderDto?.PromoCode) {
          setAppliedPromo({
            id: orderDto?.PromoCodeCampaignId || 0,
            discount: orderDto?.PromoCodeValue || 0,
            code: orderDto?.PromoCode,
          });
        }
      }
    } catch (err) {
      console.log("🛑 Failed to load invoice configuration matrix:", err);
      setGeneralNotification({
        type: "error",
        text: "Could not sync payment allocations with the server.",
      });
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadPaymentSetup();
  }, [loadPaymentSetup]);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoNotification({
        type: "error",
        text: "Please enter a valid promo code.",
      });
      return;
    }
    setPromoNotification({ type: null, text: "" });
    try {
      const res = await paymentApi.redeemPromo(
        promoCode.trim(),
        Number(orderId),
      );
      if (
        (res?.HttpStatusCode === 100 || res?.HttpStatusCode === 200) &&
        res?.Data
      ) {
        setAppliedPromo({
          id: res.Data.CampaignId,
          discount: res.Data.TotalDiscount,
          code: res.Data.Code,
        });
        setPromoNotification({
          type: "success",
          text: res.Message || "Promo code matched successfully!",
        });
        await loadPaymentSetup();
      } else {
        setPromoNotification({
          type: "error",
          text: res?.Message || "Code could not be verified against entries.",
        });
      }
    } catch (err: any) {
      setPromoNotification({
        type: "error",
        text:
          err?.response?.data?.Message ||
          "Failed to validate structural coupon code.",
      });
    }
  };

  const handleCancelPromo = async () => {
    if (!appliedPromo) return;
    setPromoNotification({ type: null, text: "" });
    try {
      const res = await paymentApi.cancelPromo(
        Number(orderId),
        appliedPromo.id,
      );
      if (res?.HttpStatusCode === 100 || res?.HttpStatusCode === 200) {
        setAppliedPromo(null);
        setPromoCode("");
        setPromoNotification({
          type: "success",
          text: "Promo coupon detached successfully.",
        });
        await loadPaymentSetup();

        setTimeout(() => setPromoNotification({ type: null, text: "" }), 3500);
      }
    } catch (err) {
      setPromoNotification({
        type: "error",
        text: "Failed to clear active coupon code.",
      });
    }
  };

  const handleApplyPoints = async () => {
    const points = parseInt(pointsToRedeem);
    if (isNaN(points) || points <= 0) {
      setPointsNotification({
        type: "error",
        text: "Please enter a positive non-zero point value.",
      });
      return;
    }
    setPointsNotification({ type: null, text: "" });
    try {
      const res = await paymentApi.redeemPoints(points, Number(orderId));
      if (res?.HttpStatusCode === 100 || res?.HttpStatusCode === 200) {
        setPointsApplied(true);
        setPointsNotification({
          type: "success",
          text: res.Message || "Loyalty points deducted from bill.",
        });
        await loadPaymentSetup();
      } else {
        setPointsNotification({
          type: "error",
          text: res?.Message || "Points allocation rejected.",
        });
      }
    } catch (err: any) {
      setPointsNotification({
        type: "error",
        text:
          err?.response?.data?.Detail ||
          "Insufficient points balance or logic error.",
      });
    }
  };

  const handleProcessPayment = async () => {
    if (selectedGatewayId === null) {
      setGeneralNotification({
        type: "error",
        text: "Please pick a checkout payment method to proceed.",
      });
      return;
    }
    setGeneralNotification({ type: null, text: "" });
    setIsProcessing(true);

    try {
      if (selectedGatewayId === 0) {
        router.replace({
          pathname: "/(cart)/order-confirmation",
          params: { orderId: String(orderId), isCod: "true" },
        });
        return;
      }

      const activeGateway = gateways.find((g) => g.PGId === selectedGatewayId);
      const payload = {
        OrderId: Number(orderId),
        OrderAmount: totals.grandTotal,
        TenantPaymentGatewayId: selectedGatewayId,
        PaymentGateway: activeGateway ? activeGateway.PGId : 1,
      };

      console.log("sending payment gateway payload: ", payload);

      const res = await paymentApi.payInvoice(payload);

      if (res?.StatusCode === 200 && res?.Data) {
        const transaction = res.Data.Transaction;
        const redirectUrl = transaction?.PaymentPortal || transaction?.BillUrl;
        const numericInvoiceId = String(orderId);

        if (redirectUrl) {
          const supported = await Linking.canOpenURL(redirectUrl);
          if (supported) {
            await Linking.openURL(redirectUrl);
            router.replace({
              pathname: "/(cart)/order-confirmation",
              params: { orderId: String(orderId), invoiceId: numericInvoiceId },
            });
            return;
          }
        }
      }
      setGeneralNotification({
        type: "error",
        text: res?.Message || "Failed to process payment gateway allocation.",
      });
    } catch (err: any) {
      setGeneralNotification({
        type: "error",
        text:
          err?.response?.data?.Message ||
          "Error parsing invoice redirection token pipeline.",
      });
    } finally {
      setTimeout(() => {
        setGeneralNotification({ type: null, text: "" });
      }, 3000);
      setIsProcessing(false);
    }
  };

  const executeOrderCancellation = async (onCompletion?: () => void) => {
    if (!activeCancelOrderId) return;
    if (!selectedReason) {
      setCancelMessage({
        type: "error",
        text: "Please select a reason for cancellation.",
      });
      return;
    }

    setIsCanceling(true);
    setCancelMessage({ type: null, text: "" });

    try {
      // Pass both order identity and structural payload value down to server gateway mapping logic
      const res = await orderApi.cancelCustomerOrder(
        activeCancelOrderId,
        selectedReason,
      );
      const dataPayload = res?.data || res;

      if (
        dataPayload?.HttpStatusCode === 200 ||
        dataPayload?.Type === "Success"
      ) {
        setCancelMessage({
          type: "success",
          text:
            dataPayload.Message || "The order has been cancelled successfully.",
        });

        setTimeout(() => {
          setIsCancelConfirmVisible(false);
          if (onCompletion) onCompletion();
        }, 1500);
      } else {
        const errorMsg =
          dataPayload?.Message ||
          "Cancellation request rejected by server application logic.";
        setCancelMessage({ type: "error", text: errorMsg });
      }
    } catch (err: any) {
      console.log("Cancellation Endpoint Error Context:", err);
      setCancelMessage({
        type: "error",
        text: "System communication exception. Failed to connect with server payload gateway.",
      });
    } finally {
      setIsCanceling(false);
      setTimeout(() => setCancelMessage({ type: null, text: "" }), 3000);
    }
  };
  return {
    loading,
    totals,
    gateways,
    selectedGatewayId,
    setSelectedGatewayId,
    isCODAvailable,
    promoCode,
    setPromoCode,
    appliedPromo,
    pointsToRedeem,
    setPointsToRedeem,
    pointsApplied,
    isProcessing,
    isCanceling,
    isKeyboardVisible,
    promoNotification,
    pointsNotification,
    generalNotification,
    cancelMessage,
    isCancelConfirmVisible,
    setIsCancelConfirmVisible,
    triggerCancelConfirmation,
    executeOrderCancellation,
    handleApplyPromo,
    handleCancelPromo,
    handleApplyPoints,
    handleProcessPayment,

    cancellationReasons,
    selectedReason,
    setSelectedReason,
    loadingReasons,
  };
}
