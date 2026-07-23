import { useState, useCallback, useRef } from "react";
import { orderApi } from "../services/orderApi";
import { useAuth } from "@/store/AuthContext";
export function useCustomerOrders() {
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
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
  const PAGE_SIZE = 10;
  const activeFilterRef = useRef<number | undefined>(undefined);

  const fetchOrders = useCallback(
    async (statusFilter?: number, isSilent = false) => {
      if (!isAuthenticated) {
        console.log("User not authenticated. Aborting orders fetch.");
        setOrders([]);
        return;
      }

      activeFilterRef.current = statusFilter;

      if (!isSilent) {
        setLoading(true);
      }

      try {
        setServerError(false);
        // Reset back to page 1 on a fresh pull-down or filter switch
        const res = await orderApi.getOrders(PAGE_SIZE, 1);

        if (res?.StatusCode === 200 && res?.Data?.CustomerOrders) {
          const rawList = res.Data.CustomerOrders;

          const filteredList =
            statusFilter === undefined || statusFilter === -1
              ? rawList
              : rawList.filter((order: any) => order.Status === statusFilter);

          setOrders(filteredList);
          setPage(1);
          // If the returned backend items are less than our request size, we've hit the end
          setHasMore(rawList.length === PAGE_SIZE);
        } else {
          setOrders([]);
          setHasMore(false);
        }
      } catch (err) {
        console.log("Error pulling customer orders:", err);
        setServerError(true);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated],
  );

  const fetchNextPage = useCallback(async () => {
    // Block if already loading, or if we know there's no more data to fetch
    if (loading || loadingMore || !hasMore || !isAuthenticated) return;

    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      const res = await orderApi.getOrders(PAGE_SIZE, nextPage);

      if (res?.StatusCode === 200 && res?.Data?.CustomerOrders) {
        const rawList = res.Data.CustomerOrders;

        if (rawList.length === 0) {
          setHasMore(false);
          return;
        }

        const currentFilter = activeFilterRef.current;
        const filteredList =
          currentFilter === undefined || currentFilter === -1
            ? rawList
            : rawList.filter((order: any) => order.Status === currentFilter);

        // Append the new orders to your existing arrays cleanly
        setOrders((prevOrders) => [...prevOrders, ...filteredList]);
        setPage(nextPage);
        setHasMore(rawList.length === PAGE_SIZE);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.log("Error loading next order block page:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [page, hasMore, loading, loadingMore, isAuthenticated]);

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
    loadingMore,
    orders,
    hasMore,
    fetchOrders,
    fetchNextPage,
    loading,
    setOrders,
    currentOrderDetail,

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
