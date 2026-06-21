import { useState, useCallback } from "react";
import { orderApi } from "../services/orderApi";
import { useAuth } from "@/store/AuthContext";
export function useCustomerOrders() {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [currentOrderDetail, setCurrentOrderDetail] = useState<any>(null);
  const [isCanceling, setIsCanceling] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<boolean>(false);

  const { isAuthenticated } = useAuth(); //
  // 🌟 Status state to show validation errors or success directly on the UI screens
  const [cancelMessage, setCancelMessage] = useState<{
    type: "success" | "error" | null;
    text: string;
  }>({ type: null, text: "" });

  // Controlled UI State instead of Alert.alert

  const [isCancelConfirmVisible, setIsCancelConfirmVisible] = useState(false);
  const [activeCancelOrderId, setActiveCancelOrderId] = useState<string | null>(
    null,
  );
  const [cancellationReasons, setCancellationReasons] = useState<any[]>([]);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [loadingReasons, setLoadingReasons] = useState(false);

  const triggerCancelConfirmation = async (orderId: string) => {
    setActiveCancelOrderId(orderId);
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

  // const triggerCancelConfirmation = (orderId: string) => {
  //   setActiveCancelOrderId(orderId);
  //   setIsCancelConfirmVisible(true);
  //   setCancelMessage({ type: null, text: "" }); // Reset errors on fresh interaction
  // };

  const fetchOrders = useCallback(
    async (statusFilter?: number, isSilent = false) => {
      if (!isAuthenticated) {
        console.log("User not authenticated. Aborting orders fetch.");
        setOrders([]);
        return;
      }
      if (!isSilent) {
        setLoading(true);
      }
      // setLoading(true);
      try {
        // 1. Use the new API endpoint (Requesting a large enough page or handling pagination)
        const res = await orderApi.getOrders(50, 1);
        console.log("📥 New Customer Orders API Response:", res);

        if (res?.StatusCode === 200 && res?.Data?.CustomerOrders) {
          const rawList = res.Data.CustomerOrders;

          // 2. Local Filtering Logic
          // If statusFilter is -1 (All), show everything. Otherwise, match the 'Status' field.
          const filteredList =
            statusFilter === undefined || statusFilter === -1
              ? rawList
              : rawList.filter((order: any) => order.Status === statusFilter);

          setOrders(filteredList);
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.log("🚨 Error pulling new customer orders:", err);
        setServerError(true);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const fetchSingleOrderDetail = useCallback(
    async (orderId: string, isSilent = false) => {
      // setLoading(true);
      if (!isSilent) {
        setLoading(false);
      }
      try {
        const res = await orderApi.getCustomerOrderDetails(orderId);
        if (res?.HttpStatusCode === 200 && res?.Data) {
          setCurrentOrderDetail(res.Data);
        } else {
          setModalError(
            res?.Message ||
              "Could not synchronize order payload specifications.",
          );
        }
      } catch (err) {
        console.log("🚨 Error pulling detailed object data node:", err);
        setModalError("Failed to fetch order summary. Please try again.");
      } finally {
        if (!isSilent) {
          setLoading(false);
        }
        // setLoading(false);
      }
    },
    [],
  );

  // const executeOrderCancellation = async (onCompletion?: () => void) => {
  //   console.log("🚀 Executing order cancellation...,", activeCancelOrderId);
  //   if (!activeCancelOrderId) return;

  //   setIsCanceling(true);
  //   setCancelMessage({ type: null, text: "" });

  //   try {
  //     console.log("📤 Sending cancellation request...");
  //     const res = await orderApi.cancelCustomerOrder(activeCancelOrderId);

  //     if (res?.HttpStatusCode === 200 || res?.Type === "Success") {
  //       setCancelMessage({
  //         type: "success",
  //         text: res.Message || "The order has been cancelled successfully.",
  //       });

  //       setIsCancelConfirmVisible(false);
  //       if (onCompletion) onCompletion();
  //     } else {
  //       const errorMsg =
  //         res.Errors?.[0]?.Message ||
  //         res.Message ||
  //         "Cancellation request rejected by server application logic.";

  //       setCancelMessage({ type: "error", text: errorMsg });
  //     }
  //   } catch (err: any) {
  //     console.log("Cancellation Endpoint Error Context:", err);
  //     setCancelMessage({
  //       type: "error",
  //       text: "System communication exception. Failed to connect with server payload gateway.",
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
    orders,
    setOrders,
    currentOrderDetail,
    fetchOrders,
    fetchSingleOrderDetail,
    setCurrentOrderDetail,
    isCanceling,
    cancelMessage,
    setCancelMessage,
    isCancelConfirmVisible,
    setIsCancelConfirmVisible,
    triggerCancelConfirmation,
    executeOrderCancellation,
    modalError,
    setModalError,
    serverError,
    setServerError,

    cancellationReasons,
    selectedReason,
    setSelectedReason,
    loadingReasons,
  };
}
