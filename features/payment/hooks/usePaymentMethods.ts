import { useState, useEffect, useCallback } from "react";
import { Platform, Keyboard, Linking } from "react-native";
import { useRouter } from "expo-router";
import { paymentApi } from "../services/paymentApi";
import { orderApi } from "@/features/cart/services/orderApi";
export interface ScreenNotification {
  type: "success" | "error" | null;
  text: string;
}

export interface DetailedTotals {
  subtotal: number;
  deliveryCharges: number;
  posCharges: number;
  saleDiscount: number;
  paymentMethodDiscount: number;
  orderValueDiscount: number;
  promoDiscount: number;
  pointsDiscount: number;
  netDiscount: number;
  grandTotal: number;
}

export function usePaymentMethods(orderId: string) {
  const router = useRouter();
  // Master Setup Loaders
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<any>(null);
  const [gateways, setGateways] = useState<any[]>([]);
  const [rewardPointsAllowed, setRewardPointsAllowed] = useState(false);
  const [selectedGatewayId, setSelectedGatewayId] = useState<number | null>(
    null,
  );
  const [isCODAvailable, setIsCODAvailable] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  // Localized Item/Component Loader Context flags (Removes full screen layout flickering)
  const [isPromoLoading, setIsPromoLoading] = useState(false);
  const [isPointsLoading, setIsPointsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  // Inputs & Applied Cache
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{
    id: number;
    discount: number;
    code: string;
  } | null>(null);

  const [pointsToRedeem, setPointsToRedeem] = useState("");
  const [pointsApplied, setPointsApplied] = useState(false);
  const [burnedPointsCount, setBurnedPointsCount] = useState(0);

  // Notifications
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

  // Order Cancellation Architecture States
  const [isCancelConfirmVisible, setIsCancelConfirmVisible] = useState(false);
  const [activeCancelOrderId, setActiveCancelOrderId] = useState<string | null>(
    null,
  );
  const [cancellationReasons, setCancellationReasons] = useState<any[]>([]);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [loadingReasons, setLoadingReasons] = useState(false);

  // Complete breakdown breakdown matrix matching DTO properties
  const [totals, setTotals] = useState<DetailedTotals>({
    subtotal: 0,
    deliveryCharges: 0,
    posCharges: 0,
    saleDiscount: 0,
    paymentMethodDiscount: 0,
    orderValueDiscount: 0,
    promoDiscount: 0,
    pointsDiscount: 0,
    netDiscount: 0,
    grandTotal: 0,
  });

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
    setSelectedReason(null);
    setIsCancelConfirmVisible(true);
    setCancelMessage({ type: null, text: "" });
    setLoadingReasons(true);

    try {
      const res = await orderApi.getOrderCancellationReasons();
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

  // Synchronize state data mapping wrapper
  const loadPaymentSetup = useCallback(
    async (showGlobalSpinner = true) => {
      if (!orderId) return;
      if (showGlobalSpinner) setLoading(true);

      try {
        const res = await paymentApi.getPaymentSetup(orderId);
        if (
          (res?.HttpStatusCode === 200 || res?.HttpStatusCode === 100) &&
          res?.Data
        ) {
          const orderDto = res.Data?.OrderDto;

          setOrderData(orderDto);
          setGateways(res.Data?.PaymentGateways || []);
          setIsCODAvailable(orderDto?.IsCODPaymentEnable || false);
          setRewardPointsAllowed(res.Data?.RewardPointsAllowed || false);

          setTotals({
            subtotal: orderDto?.OrderAmount || 0,
            deliveryCharges: orderDto?.DeliveryCharges || 0,
            posCharges: orderDto?.POSCharges || 0,
            saleDiscount: orderDto?.SaleDiscount || 0,
            paymentMethodDiscount: orderDto?.PaymentMethodDiscount || 0,
            orderValueDiscount: orderDto?.OrderValueDiscount || 0,
            promoDiscount: orderDto?.PromoCodeValue || 0,
            pointsDiscount: orderDto?.BurnPointsAmount || 0,
            netDiscount: orderDto?.NetDiscount || 0,
            grandTotal: orderDto?.NetAmount || 0,
          });

          if (orderDto?.BurnPoints > 0) {
            setPointsApplied(true);
            setBurnedPointsCount(orderDto.BurnPoints);
            setPointsToRedeem(String(orderDto.BurnPoints));
          }

          if (orderDto?.PromoCode) {
            setAppliedPromo({
              id: orderDto?.PromoCodeCampaignId || 0,
              discount: orderDto?.PromoCodeValue || 0,
              code: orderDto?.PromoCode,
            });
          } else {
            setAppliedPromo(null);
          }
        }
      } catch (err) {
        console.log("🛑 Failed to load invoice configuration matrix:", err);
        setGeneralNotification({
          type: "error",
          text: "Could not sync payment allocations with the server.",
        });
      } finally {
        if (showGlobalSpinner) setLoading(false);
        setTimeout(() => {
          setGeneralNotification({ type: null, text: "" });
        }, 3000);
      }
    },
    [orderId],
  );

  useEffect(() => {
    loadPaymentSetup(true);
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
    setIsPromoLoading(true);

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

        // Instant update local matrix elements calculation before payload sync finishes
        setTotals((prev) => {
          const updatedPromo = res.Data.TotalDiscount;
          const combinedDiscount =
            prev.saleDiscount +
            prev.paymentMethodDiscount +
            prev.orderValueDiscount +
            prev.pointsDiscount +
            updatedPromo;
          return {
            ...prev,
            promoDiscount: updatedPromo,
            netDiscount: combinedDiscount,
            grandTotal: Math.max(
              0,
              prev.subtotal +
                prev.deliveryCharges +
                prev.posCharges -
                combinedDiscount,
            ),
          };
        });

        setPromoNotification({
          type: "success",
          text: res.Message || "Promo code applied successfully!",
        });

        // await loadPaymentSetup(false);
      } else {
        setPromoNotification({
          type: "error",
          text: res?.Message || "Code could not be verified against entries.",
        });
      }
    } catch (err: any) {
      setPromoNotification({
        type: "error",
        text: err?.response?.data?.Message || "Failed to validate coupon code.",
      });
    } finally {
      setIsPromoLoading(false);
    }
  };

  const handleCancelPromo = async () => {
    if (!appliedPromo) return;
    setPromoNotification({ type: null, text: "" });
    setIsPromoLoading(true);

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
        await loadPaymentSetup(false);
        setTimeout(() => setPromoNotification({ type: null, text: "" }), 3500);
      }
    } catch (err) {
      setPromoNotification({
        type: "error",
        text: "Failed to clear active coupon code.",
      });
    } finally {
      setIsPromoLoading(false);
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
    setIsPointsLoading(true);

    try {
      const res = await paymentApi.redeemPoints(points, Number(orderId));

      if (res?.HttpStatusCode === 100 || res?.HttpStatusCode === 200) {
        setPointsApplied(true);
        setBurnedPointsCount(res.Data?.RedeemPoints || points);

        setTotals((prev) => {
          const updatedPointsDiscount = res.Data.DiscountedAmount || 0;
          const combinedDiscount =
            prev.saleDiscount +
            prev.paymentMethodDiscount +
            prev.orderValueDiscount +
            prev.promoDiscount +
            updatedPointsDiscount;
          return {
            ...prev,
            pointsDiscount: updatedPointsDiscount,
            netDiscount: combinedDiscount,
            grandTotal: Math.max(
              0,
              prev.subtotal +
                prev.deliveryCharges +
                prev.posCharges -
                combinedDiscount,
            ),
          };
        });

        setPointsNotification({
          type: "success",
          text: res.Message || "Loyalty points deducted from bill.",
        });

        await loadPaymentSetup(false);
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
    } finally {
      setIsPointsLoading(false);
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
      // 1. Core interceptor requirement: Always Confirm order before processing routing redirection url
      const confirmationPayload = {
        OrderId: Number(orderId),
        RedeemPoints: pointsApplied ? burnedPointsCount : 0,
        CampaignId: appliedPromo ? appliedPromo.id : 0,
      };

      const confirmRes = await paymentApi.confirmOrder(confirmationPayload);

      if (
        confirmRes?.HttpStatusCode !== 200 &&
        confirmRes?.Type !== "Success"
      ) {
        setGeneralNotification({
          type: "error",
          text:
            confirmRes?.Message ||
            "Failed to finalize order verification matrix.",
        });
        setIsProcessing(false);
        return;
      }

      // 2. COD Quick Intercept Handling
      if (selectedGatewayId === 0) {
        router.replace({
          pathname: "/(cart)/order-confirmation",
          params: { orderId: String(orderId), isCod: "true" },
        });
        return;
      }

      // 3. Digital payment gateway flow mapping
      const activeGateway = gateways.find((g) => g.PGId === selectedGatewayId);
      const payload = {
        OrderId: Number(orderId),
        OrderAmount: totals.grandTotal,
        TenantPaymentGatewayId: selectedGatewayId,
        PaymentGateway: activeGateway ? activeGateway.PGId : 1,
      };

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
          "Error parsing invoice transaction process pipeline.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // const executeOrderCancellation = async (onCompletion?: () => void) => {
  //   if (!activeCancelOrderId) return;
  //   if (!selectedReason) {
  //     setCancelMessage({
  //       type: "error",
  //       text: "Please select a reason for cancellation.",
  //     });
  //     return;
  //   }

  //   setIsCanceling(true);
  //   setCancelMessage({ type: null, text: "" });

  //   try {
  //     const res = await orderApi.cancelCustomerOrder(
  //       activeCancelOrderId,
  //       selectedReason,
  //     );
  //     const dataPayload = res?.data || res;
  //     if (
  //       dataPayload?.HttpStatusCode === 200 ||
  //       dataPayload?.Type === "Success"
  //     ) {
  //       setCancelMessage({
  //         type: "success",
  //         text:
  //           dataPayload.Message || "The order has been cancelled successfully.",
  //       });

  //       setTimeout(() => {
  //         setIsCancelConfirmVisible(false);
  //         if (onCompletion) onCompletion();
  //         fetchOrders();
  //       }, 1500);
  //     } else {
  //       setCancelMessage({
  //         type: "error",
  //         text:
  //           dataPayload?.Message ||
  //           "Cancellation request rejected by server application logic.",
  //       });
  //     }
  //   } catch (err: any) {
  //     console.log("Cancellation Endpoint Error Context:", err);
  //     setCancelMessage({
  //       type: "error",
  //       text: "System communication exception.",
  //     });
  //   } finally {
  //     setIsCanceling(false);
  //     setTimeout(() => setCancelMessage({ type: null, text: "" }), 3000);
  //   }
  // };
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

        // Keep the modal cleanly open and displaying success during this transition block
        setTimeout(() => {
          setIsCancelConfirmVisible(false);
          setIsCanceling(false); // 🌟 Move this here so it doesn't turn off before navigation!
          if (onCompletion) onCompletion();
        }, 1500);
      } else {
        setCancelMessage({
          type: "error",
          text:
            dataPayload?.Message ||
            "Cancellation request rejected by server application logic.",
        });
        setIsCanceling(false); // Clear loading only on failures so they can retry
      }
    } catch (err: any) {
      console.log("Cancellation Endpoint Error Context:", err);
      setCancelMessage({
        type: "error",
        text: "System communication exception.",
      });
      setIsCanceling(false); // Clear loading only on failures
    } finally {
      // 🌟 Removed setIsCanceling(false) from here so it doesn't flash the background screens!
      setTimeout(() => setCancelMessage({ type: null, text: "" }), 3000);
    }
  };
  return {
    loading,
    orderData,
    totals,
    gateways,
    rewardPointsAllowed,
    selectedGatewayId,
    setSelectedGatewayId,
    isCODAvailable,
    promoCode,
    setPromoCode,
    appliedPromo,
    pointsToRedeem,
    setPointsToRedeem,
    pointsApplied,
    isPromoLoading,
    isPointsLoading,
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
