import { useState, useCallback } from "react";
import { Alert } from "react-native";
import { orderApi } from "../services/orderApi";

export function useCustomerOrders() {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [currentOrderDetail, setCurrentOrderDetail] = useState<any>(null);
  const [isCanceling, setIsCanceling] = useState(false);

  const fetchOrders = useCallback(async (statusFilter?: number) => {
    setLoading(true);
    try {
      const queryParams: any = {
        FromDate: "2026-01-01T00:00:00.000Z",
        UtcOffset: 5,
      };
      if (statusFilter !== undefined && statusFilter !== -1) {
        queryParams.OrderStatus = statusFilter;
      }

      const res = await orderApi.getCustomerOrders(queryParams);
      console.log("📥 Raw Customer Orders API Response Matrix:", res);

      if (res?.HttpStatusCode === 200 || res?.Type === "Success") {
        let parsedList = [];

        // 🌟 BULLETPROOF PARSER ENGINE:
        if (typeof res.Data === "string") {
          // Only attempt to parse if the string isn't completely blank or whitespace
          if (res.Data.trim()) {
            try {
              parsedList = JSON.parse(res.Data);
            } catch (parseError) {
              console.error(
                "⚠️ Failed to parse res.Data string layout:",
                parseError,
              );
              parsedList = [];
            }
          }
        } else if (res.Data && typeof res.Data === "object") {
          // If Axios/apiClient has already automatically parsed it into an object/array
          parsedList = res.Data;
        }

        // Safeguard to ensure your state always gets a clean array structure
        setOrders(Array.isArray(parsedList) ? parsedList : []);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("🚨 Error pulling customer orders history array:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
    // If your endpoint requires the header to function properly,
    // ensure your global apiClient interceptor automatically injects your 'api-security-key'.
  }, []);
  // 🔎 2. Fetch Single Deep Order Details
  const fetchSingleOrderDetail = useCallback(async (orderId: string) => {
    setLoading(true);
    try {
      const res = await orderApi.getCustomerOrderDetails(orderId);
      if (res?.HttpStatusCode === 200 && res?.Data) {
        setCurrentOrderDetail(res.Data);
      } else {
        Alert.alert(
          "Data Error",
          res?.Message || "Could not synchronize order payload specifications.",
        );
      }
    } catch (err) {
      console.error("🚨 Error pulling detailed object data node:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 🚫 3. Cancel Order Action Route Mutation
  const handleCancelOrder = async (
    orderId: string,
    onCompletion?: () => void,
  ) => {
    Alert.alert(
      "Cancel Order Execution",
      "Are you sure you want to cancel this order? This operation cannot be reversed.",
      [
        { text: "No, Keep Order", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            setIsCanceling(true);
            try {
              const res = await orderApi.cancelCustomerOrder(orderId);
              if (res?.HttpStatusCode === 200 || res?.Type === "Success") {
                Alert.alert(
                  "Order Cancelled",
                  res.Message || "The order state has dropped successfully.",
                );
                if (onCompletion) onCompletion();
              } else {
                const errorMsg =
                  res.Errors?.[0]?.Message ||
                  res.Message ||
                  "Cancellation rejected.";
                Alert.alert("Cancellation Denied", errorMsg);
              }
            } catch (err) {
              Alert.alert(
                "System Exception",
                "Failed to communicate with authorization server.",
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
    orders,
    currentOrderDetail,
    isCanceling,
    fetchOrders,
    fetchSingleOrderDetail,
    handleCancelOrder,
    setCurrentOrderDetail,
  };
}
