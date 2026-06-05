import { useState, useEffect, useCallback } from "react";
import { Alert, Linking } from "react-native";
import { useRouter } from "expo-router";
import { paymentApi } from "../services/paymentApi";

export function usePaymentMethods(orderId: string) {
  const router = useRouter();

  // Core Order Structural States
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<any>(null);
  const [gateways, setGateways] = useState<any[]>([]);
  const [selectedGatewayId, setSelectedGatewayId] = useState<number | null>(
    null,
  );
  const [isCODAvailable, setIsCODAvailable] = useState(false);

  // Marketing & Reward Operations States
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{
    id: number;
    discount: number;
    code: string;
  } | null>(null);
  const [pointsToRedeem, setPointsToRedeem] = useState("");
  const [pointsApplied, setPointsApplied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);

  // Calculations Node State
  const [totals, setTotals] = useState({
    subtotal: 0,
    deliveryCharges: 0,
    discount: 0,
    grandTotal: 0,
  });

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

        // Map invoice totals cleanly from the core backend model calculations
        setTotals({
          subtotal: orderDto?.OrderAmount || 0,
          deliveryCharges: orderDto?.DeliveryCharges || 0,
          discount: orderDto?.NetDiscount || 0,
          grandTotal: orderDto?.NetAmount || 0,
        });

        // Retain visual input state if a promo coupon is already attached to this order session
        if (orderDto?.PromoCode) {
          setAppliedPromo({
            id: orderDto?.PromoCodeCampaignId || 0,
            discount: orderDto?.PromoCodeValue || 0,
            code: orderDto?.PromoCode,
          });
        }
      }
    } catch (err) {
      console.error(
        "🛑 Failed to load invoice matrix layout configuration:",
        err,
      );
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadPaymentSetup();
  }, [loadPaymentSetup]);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    try {
      const res = await paymentApi.redeemPromo(
        promoCode.trim(),
        Number(orderId),
      );
      // Swagger documentation maps success payload arrays to HttpStatusCode 100
      if (
        (res?.HttpStatusCode === 100 || res?.HttpStatusCode === 200) &&
        res?.Data
      ) {
        setAppliedPromo({
          id: res.Data.CampaignId,
          discount: res.Data.TotalDiscount,
          code: res.Data.Code,
        });
        Alert.alert("Success", res.Message || `Promo applied successfully!`);
        await loadPaymentSetup(); // Re-sync entire grand totals object
      } else {
        Alert.alert(
          "Invalid Promo",
          res?.Message || "Code could not be processed against entries.",
        );
      }
    } catch (err: any) {
      Alert.alert(
        "Promo Error",
        err?.response?.data?.Message || "Failed to validate coupon code.",
      );
    }
  };

  const handleCancelPromo = async () => {
    if (!appliedPromo) return;
    try {
      const res = await paymentApi.cancelPromo(
        Number(orderId),
        appliedPromo.id,
      );
      if (res?.HttpStatusCode === 100 || res?.HttpStatusCode === 200) {
        setAppliedPromo(null);
        setPromoCode("");
        Alert.alert("Removed", "Promo coupon detached successfully.");
        await loadPaymentSetup();
      }
    } catch (err) {
      Alert.alert("Error", "Failed to clear active coupon code.");
    }
  };

  const handleApplyPoints = async () => {
    const points = parseInt(pointsToRedeem);
    if (isNaN(points) || points <= 0) {
      Alert.alert(
        "Invalid Format",
        "Please input a positive non-zero integer point query.",
      );
      return;
    }
    try {
      const res = await paymentApi.redeemPoints(points, Number(orderId));
      if (res?.HttpStatusCode === 100 || res?.HttpStatusCode === 200) {
        setPointsApplied(true);
        Alert.alert(
          "Points Redeemed",
          res.Message || "Loyalty points applied against total amount.",
        );
        await loadPaymentSetup();
      } else {
        Alert.alert(
          "Redeem Refused",
          res?.Message || "Points allocation rejected.",
        );
      }
    } catch (err: any) {
      Alert.alert(
        "Points Error",
        err?.response?.data?.Detail ||
          "Insufficient points or execution mismatch.",
      );
    }
  };

  const handleProcessPayment = async () => {
    if (selectedGatewayId === null) {
      Alert.alert(
        "Selection Missing",
        "Please select your preferred checkout payment method.",
      );
      return;
    }

    setIsProcessing(true);
    try {
      // 🌟 STEP 1: Confirm and lock the order variables on the backend first
      const confirmationPayload = {
        OrderId: Number(orderId),
        RedeemPoints: pointsApplied ? Number(pointsToRedeem) : 0,
        CampaignId: appliedPromo ? Number(appliedPromo.id) : 0,
      };

      console.log(
        "🔒 Sending Order Confirmation Payload:",
        confirmationPayload,
      );
      const confirmRes = await paymentApi.confirmOrder(confirmationPayload);

      // Check for success types based on your swagger 100/200 return signatures
      if (
        confirmRes?.HttpStatusCode !== 100 &&
        confirmRes?.HttpStatusCode !== 200 &&
        confirmRes?.Type !== "Success"
      ) {
        Alert.alert(
          "Order Lock Failed",
          confirmRes?.Message || "Could not lock order parameters.",
        );
        setIsProcessing(false);
        return;
      }

      // 🌟 STEP 2: Process the payment gateway payload invoice generation
      const activeGateway = gateways.find((g) => g.PGId === selectedGatewayId);
      const payload = {
        OrderId: Number(orderId),
        OrderAmount: totals.grandTotal,
        TenantPaymentGatewayId: selectedGatewayId,
        PaymentGateway: activeGateway ? activeGateway.PGId : 1,
      };

      const res = await paymentApi.payInvoice(payload);
      console.log("📥 Verified PayInvoice Response Matrix:", res);

      if (res?.StatusCode === 200 && res?.Data) {
        const transaction = res.Data.Transaction;
        const redirectUrl = transaction?.PaymentPortal || transaction?.BillUrl;
        const transactionId = transaction?.TransactionID;

        if (redirectUrl) {
          const supported = await Linking.canOpenURL(redirectUrl);
          if (supported) {
            await Linking.openURL(redirectUrl);

            router.replace({
              pathname: "/(tabs)/cart/order-confirmation",
              params: {
                orderId: String(orderId),
                invoiceId: String(transactionId),
              },
            });
            return;
          }
        }

        // COD Fallback Route
        router.replace({
          pathname: "/(tabs)/cart/order-confirmation",
          params: { orderId: String(orderId), isCod: "true" },
        });
      } else {
        Alert.alert(
          "Execution Denied",
          res?.Message || "Failed to process target order invoice.",
        );
      }
    } catch (err: any) {
      console.error("🚨 Critical Payment Error:", err);
      Alert.alert(
        "Payment Failed",
        err?.response?.data?.Message ||
          "Error parsing invoice execution context.",
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // const handleProcessPayment = async () => {
  //   if (selectedGatewayId === null) {
  //     Alert.alert(
  //       "Selection Missing",
  //       "Please select your preferred checkout payment method.",
  //     );
  //     return;
  //   }

  //   setIsProcessing(true);
  //   try {
  //     const activeGateway = gateways.find((g) => g.PGId === selectedGatewayId);
  //     const payload = {
  //       OrderId: Number(orderId),
  //       OrderAmount: totals.grandTotal,
  //       TenantPaymentGatewayId: selectedGatewayId,
  //       PaymentGateway: activeGateway ? activeGateway.PGId : 1,
  //     };

  //     const res = await paymentApi.payInvoice(payload);
  //     console.log("📥 Verified PayInvoice Production Matrix Response:", res);

  //     // ✅ FIXED: Check against 200 status code per Swagger spec documentation
  //     if (res?.StatusCode === 200 && res?.Data) {
  //       const transaction = res.Data.Transaction;

  //       // ✅ FIXED: Fallback sequence reading PaymentPortal if BillUrl comes back null
  //       const redirectUrl = transaction?.PaymentPortal || transaction?.BillUrl;
  //       const transactionId = transaction?.TransactionID;

  //       if (redirectUrl) {
  //         const supported = await Linking.canOpenURL(redirectUrl);
  //         if (supported) {
  //           // Open up the premium external secure checkout payment engine screen link
  //           await Linking.openURL(redirectUrl);

  //           // Redirect the mobile view layer to track authorization validations
  //           router.replace({
  //             pathname: "/(tabs)/cart/order-confirmation",
  //             params: {
  //               orderId: String(orderId),
  //               invoiceId: String(transactionId),
  //             },
  //           });
  //           return;
  //         }
  //       }

  //       // Handling Cash On Delivery or standard local workflow operations directly
  //       router.replace({
  //         pathname: "/(tabs)/cart/order-confirmation",
  //         params: { orderId: String(orderId), isCod: "true" },
  //       });
  //     } else {
  //       Alert.alert(
  //         "Execution Denied",
  //         res?.Message || "Failed to process target order invoice.",
  //       );
  //     }
  //   } catch (err: any) {
  //     console.error("🚨 Critical Payment Error:", err);
  //     Alert.alert(
  //       "Payment Failed",
  //       err?.response?.data?.Message ||
  //         "Error parsing invoice execution context.",
  //     );
  //   } finally {
  //     setIsProcessing(false);
  //   }
  // };
  const handleCancelEntireOrder = async () => {
    Alert.alert(
      "Cancel and Discard Order",
      "Are you sure you want to completely cancel this order session? This action cannot be undone.",
      [
        { text: "No, Keep Order", style: "cancel" },
        {
          text: "Yes, Cancel Order",
          style: "destructive",
          onPress: async () => {
            setIsCanceling(true);
            try {
              const res = await paymentApi.cancelCustomerOrder(Number(orderId));
              if (
                res?.HttpStatusCode === 100 ||
                res?.HttpStatusCode === 200 ||
                res?.Type === "Success"
              ) {
                Alert.alert(
                  "Order Cancelled",
                  res.Message || "Order discarded successfully.",
                  [
                    {
                      text: "OK",
                      onPress: () => router.replace("/(tabs)/category/cart"),
                    },
                  ],
                );
              } else {
                Alert.alert(
                  "Cancellation Error",
                  res?.Message || "Order cancellation rejected by server.",
                );
              }
            } catch (err: any) {
              Alert.alert(
                "System Error",
                "Failed to process cancellation request framework parameters.",
              );
            } finally {
              setIsCanceling(false);
            }
          },
        },
      ],
    );
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
    handleApplyPromo,
    handleCancelPromo,
    handleApplyPoints,
    handleProcessPayment,
    handleCancelEntireOrder,
  };
}
