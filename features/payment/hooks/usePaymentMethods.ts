import { useState, useEffect, useCallback } from "react";
import { Alert, Linking } from "react-native";
import { useRouter } from "expo-router";
import { paymentApi } from "../services/paymentApi";

export function usePaymentMethods(orderId: string) {
  const router = useRouter();

  // Core Order Data State
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState<any>(null);
  const [gateways, setGateways] = useState<any[]>([]);
  const [selectedGatewayId, setSelectedGatewayId] = useState<number | null>(
    null,
  );
  const [isCODAvailable, setIsCODAvailable] = useState(false);

  // Promo and Loyalty State
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{
    id: number;
    discount: number;
    code: string;
  } | null>(null);
  const [pointsToRedeem, setPointsToRedeem] = useState("");
  const [pointsApplied, setPointsApplied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Dynamic calculations based on backend setup mutations
  const [totals, setTotals] = useState({
    subtotal: 0,
    deliveryCharges: 0,
    discount: 0,
    grandTotal: 0,
  });

  // Load order breakdowns and valid gateways securely
  const loadPaymentSetup = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      const res = await paymentApi.getPaymentSetup(orderId);
      if (res?.HttpStatusCode === 100 && res?.Data) {
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
      }
    } catch (err) {
      Alert.alert(
        "Error",
        "Could not load transaction checkout configuration.",
      );
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadPaymentSetup();
  }, [loadPaymentSetup]);

  // Handle application of promo coupons
  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    try {
      const res = await paymentApi.redeemPromo(promoCode, Number(orderId));
      if (res?.HttpStatusCode === 100 && res?.Data) {
        setAppliedPromo({
          id: res.Data.CampaignId,
          discount: res.Data.TotalDiscount,
          code: res.Data.Code,
        });
        Alert.alert(
          "Success",
          `Promo applied! You saved Rs. ${res.Data.TotalDiscount}`,
        );
        loadPaymentSetup(); // Re-sync billing matrices
      } else {
        Alert.alert(
          "Invalid Code",
          res?.Message || "Promo code is not applicable.",
        );
      }
    } catch (err: any) {
      Alert.alert(
        "Promo Error",
        err?.response?.data?.Message || "Failed to redeem code.",
      );
    }
  };

  // Clear or cancel active promo codes
  const handleCancelPromo = async () => {
    if (!appliedPromo) return;
    try {
      const res = await paymentApi.cancelPromo(
        Number(orderId),
        appliedPromo.id,
      );
      if (res?.HttpStatusCode === 100) {
        setAppliedPromo(null);
        setPromoCode("");
        Alert.alert("Removed", "Promo coupon detached successfully.");
        loadPaymentSetup();
      }
    } catch (err) {
      Alert.alert("Error", "Failed to clear active promo code.");
    }
  };

  // Apply Reward Points
  const handleApplyPoints = async () => {
    const points = parseInt(pointsToRedeem);
    if (isNaN(points) || points <= 0) return;
    try {
      const res = await paymentApi.redeemPoints(points, Number(orderId));
      setPointsApplied(true);
      Alert.alert(
        "Points Redeemed",
        "Loyalty point metrics parsed against grand total.",
      );
      loadPaymentSetup();
    } catch (err: any) {
      Alert.alert(
        "Points Error",
        err?.response?.data?.Detail || "Failed to redeem points.",
      );
    }
  };

  // Process Final Invoice Checkout Generation Loop
  const handleProcessPayment = async () => {
    if (selectedGatewayId === null) {
      Alert.alert(
        "Selection Missing",
        "Please select your preferred checkout mechanism framework.",
      );
      return;
    }

    setIsProcessing(true);
    try {
      const activeGateway = gateways.find((g) => g.PGId === selectedGatewayId);

      const payload = {
        OrderId: Number(orderId),
        OrderAmount: totals.grandTotal,
        TenantPaymentGatewayId: selectedGatewayId,
        PaymentGateway: activeGateway ? activeGateway.PGId : 1,
      };

      const res = await paymentApi.payInvoice(payload);

      if (res?.StatusCode === 0 && res?.Data?.Transaction?.BillUrl) {
        const redirectUrl = res.Data.Transaction.BillUrl;

        // Open payment portal link safely in native system browser
        const supported = await Linking.canOpenURL(redirectUrl);
        if (supported) {
          await Linking.openURL(redirectUrl);

          // Redirect user into confirmation tracking polling check loops
          router.replace({
            pathname: "/(tabs)/cart/order-confirmation",
            params: { orderId, invoiceId: res.Data.Transaction.TransactionID },
          });
        } else {
          Alert.alert(
            "Error",
            "Cannot initialize target gateway invoice interface wrapper.",
          );
        }
      } else {
        // Fallback or Cash on delivery execution logic branches
        Alert.alert("Success", "Order processing token locked seamlessly.");
      }
    } catch (err: any) {
      Alert.alert(
        "Payment Failed",
        err?.response?.data?.Message ||
          "Error parsing invoice checkout execution.",
      );
    } finally {
      setIsProcessing(false);
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
    handleApplyPromo,
    handleCancelPromo,
    handleApplyPoints,
    handleProcessPayment,
  };
}
