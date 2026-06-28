import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCustomerOrders } from "../hooks/useCustomerOrders";
import { OrderCancelModal } from "@/components/OrderCancelModal";
import { paymentApi } from "@/features/payment/services/paymentApi";
import { EmptyState } from "@/components/EmptyState";
import { PremiumGuestGate } from "@/components/PremiumGuestGate";
import { useAuth } from "@/store/AuthContext";
const STATUS_FILTERS = [
  { label: "All", value: -1 },
  { label: "Created", value: 15 },
  { label: "In Process", value: 2 },
  { label: "Completed", value: 3 },
];

// ==========================================
// PROFESSIONAL SKELETON LOADING COMPONENTS
// ==========================================
const CardSkeleton = () => (
  <View style={[styles.orderCard, styles.skeletonCard]}>
    <View style={styles.skeletonLeftBar} />
    <View style={{ flex: 1, gap: 10 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View style={[styles.skeletonLine, { width: "45%", height: 16 }]} />
        <View
          style={[
            styles.skeletonLine,
            { width: "25%", height: 20, borderRadius: 8 },
          ]}
        />
      </View>
      <View style={[styles.skeletonLine, { width: "30%", height: 12 }]} />
      <View style={styles.divider} />
      <View style={[styles.skeletonLine, { width: "60%", height: 14 }]} />
      <View style={[styles.skeletonLine, { width: "50%", height: 14 }]} />
      <View style={styles.divider} />
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View style={[styles.skeletonLine, { width: "20%", height: 12 }]} />
        <View style={[styles.skeletonLine, { width: "30%", height: 18 }]} />
      </View>
    </View>
  </View>
);

const DetailSkeleton = () => (
  <View style={{ gap: 16, marginTop: 16 }}>
    <View
      style={[
        styles.summaryCard,
        { backgroundColor: "#F1F5F9", borderColor: "#E2E8F0" },
      ]}
    >
      <View
        style={[
          styles.skeletonLine,
          { width: "30%", height: 12, marginBottom: 8 },
        ]}
      />
      <View
        style={[
          styles.skeletonLine,
          { width: "50%", height: 24, marginBottom: 12 },
        ]}
      />
      <View style={{ flexDirection: "row", gap: 8 }}>
        <View
          style={[
            styles.skeletonLine,
            { width: "30%", height: 20, borderRadius: 6 },
          ]}
        />
        <View
          style={[
            styles.skeletonLine,
            { width: "30%", height: 20, borderRadius: 6 },
          ]}
        />
      </View>
    </View>
    <View
      style={[styles.skeletonLine, { width: "35%", height: 14, marginTop: 10 }]}
    />
    {[1, 2].map((i) => (
      <View
        key={i}
        style={{ flexDirection: "row", gap: 12, alignItems: "center" }}
      >
        <View
          style={[
            styles.skeletonLine,
            { width: 34, height: 34, borderRadius: 10 },
          ]}
        />
        <View style={{ flex: 1, gap: 6 }}>
          <View style={[styles.skeletonLine, { width: "70%", height: 14 }]} />
          <View style={[styles.skeletonLine, { width: "40%", height: 12 }]} />
        </View>
        <View style={[styles.skeletonLine, { width: "20%", height: 14 }]} />
      </View>
    ))}
  </View>
);

// ==========================================
// MAIN SCREEN COMPONENT
// ==========================================
export const OrdersHistoryScreen = () => {
  const { isAuthenticated } = useAuth();
  const {
    loading: globalLoading,
    orders,
    setOrders,
    currentOrderDetail,
    fetchOrders,
    fetchSingleOrderDetail,
    setCurrentOrderDetail,
    isCanceling,
    cancelMessage,
    isCancelConfirmVisible,
    setIsCancelConfirmVisible,
    executeOrderCancellation,
    modalError,
    triggerCancelConfirmation,
    setModalError,
    serverError,
    setCancelMessage,

    cancellationReasons,
    selectedReason,
    setSelectedReason,
    loadingReasons,
  } = useCustomerOrders();
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState(-1);
  const [filterChanging, setFilterChanging] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  // const [modalError, setModalError] = useState<string | null>(null);
  const [verifyingOrderId, setVerifyingOrderId] = useState<string | null>(null);

  // Safely trigger lookups and capture state transformations cleanly
  const runFilterUpdateSequence = useCallback(
    async (filterValue: number) => {
      setFilterChanging(true);
      try {
        await fetchOrders(filterValue);
      } catch (err) {
        console.log("Failed handling filter sync lookup", err);
      } finally {
        setFilterChanging(false);
      }
    },
    [fetchOrders],
  );

  const handleRetryFetch = () => {
    fetchOrders(activeFilter);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchOrders(activeFilter);
    } catch (err) {
      console.log("Pull-to-refresh failed:", err);
    } finally {
      setRefreshing(false);
    }
  }, [activeFilter, fetchOrders]);

  useEffect(() => {
    runFilterUpdateSequence(activeFilter);
  }, [activeFilter, runFilterUpdateSequence]);

  const openDetailInspector = async (orderId: string) => {
    setModalError(null);
    setDetailModalVisible(true);
    setModalLoading(true);
    try {
      await fetchSingleOrderDetail(orderId);
    } catch (err) {
      console.log("🚨 Error fetching order detail:", err);
    } finally {
      setModalLoading(false);
    }
  };

  const closeDetailInspector = () => {
    setDetailModalVisible(false);
    setCurrentOrderDetail(null);
    setModalError(null);
  };

  const handleProceedToPayment = (orderId: string) => {
    closeDetailInspector();
    router.push({
      pathname: "/(cart)/payment-methods",
      params: { orderId: String(orderId) },
    });
  };

  // const handleVerifyPaymentDirectly = async (orderId: string) => {
  //   setVerifyingOrderId(orderId);
  //   try {
  //     const verifyRes = await paymentApi.verifyPayment(Number(orderId));
  //     console.log("📥 Verify Payment API Response:", verifyRes);

  //     if (
  //       verifyRes?.StatusCode === 200 &&
  //       verifyRes?.Data?.IsPaymentVerify === true
  //     ) {
  //       console.log("✅ Payment verified successfully for order", orderId);
  //     }
  //     await fetchSingleOrderDetail(orderId);
  //     await fetchOrders(activeFilter);
  //   } catch (err) {
  //     console.error("Verification sequence failed natively", err);
  //   } finally {
  //     setVerifyingOrderId(null);
  //   }
  // };

  const handleVerifyPaymentDirectly = async (orderId: string) => {
    // Only spinner the targeted button, NOT the global full screen loader
    setVerifyingOrderId(orderId);
    setCancelMessage({ type: null, text: "" });
    try {
      const verifyRes = await paymentApi.verifyPayment(Number(orderId));
      console.log("📥 Verify Payment API Response:", verifyRes);

      if (
        verifyRes?.StatusCode === 200 &&
        verifyRes?.Data?.IsPaymentVerify === true
      ) {
        console.log("✅ Payment verified successfully for order", orderId);
        setCancelMessage({
          type: "success",
          text: "The Payment has been verified successfully.",
        });
        // ⚡ 1. INSTANT LOCAL MUTATION FOR THE INDIVIDUAL MODAL VIEW
        if (
          currentOrderDetail &&
          String(currentOrderDetail.OrderId) === String(orderId)
        ) {
          setCurrentOrderDetail((prev: any) => {
            if (!prev) return prev;
            return {
              ...prev,
              IsPaymentVerify: true,
              Status: 1, // Or whatever your numeric "Paid/Verified" backend status code is
            };
          });
        }

        // ⚡ 2. INSTANT LOCAL MUTATION FOR THE MAIN LIST BACKGROUND ARRAY
        setOrders((prevOrders: any[]) => {
          return prevOrders.map((order) => {
            if (String(order.OrderId) === String(orderId)) {
              return {
                ...order,
                IsPaymentVerify: true,
                Status: 1, // Matches status track update inline
              };
            }
            return order;
          });
        });
      }

      // 🤫 3. SILENT BACKGROUND SYNC (Passes true to the isSilent parameter)
      // Runs concurrently via native execution loops without locking the screen view
      await Promise.all([
        fetchSingleOrderDetail(orderId, true),
        fetchOrders(activeFilter, true),
      ]);
    } catch (err) {
      console.log("Verification sequence failed natively", err);
      setCancelMessage({
        type: "error",
        text: "Verification sequence failed natively",
      });
    } finally {
      // Clear out only the localized button loading indicator spinner state
      setVerifyingOrderId(null);
      setTimeout(() => setCancelMessage({ type: null, text: "" }), 3000);
    }
  };
  const getStatusMetaConfig = (statusDisplayName: string) => {
    const status = statusDisplayName?.toLowerCase() || "";
    if (status.includes("process"))
      return {
        bg: "#EFF6FF",
        text: "#2563EB",
        edge: "#3B82F6",
        icon: "time-outline",
      };
    if (
      status.includes("create") ||
      status.includes("wait") ||
      status.includes("pending")
    )
      return {
        bg: "#FEF3C7",
        text: "#D97706",
        edge: "#F59E0B",
        icon: "wallet-outline",
      };
    if (status.includes("complete") || status.includes("success"))
      return {
        bg: "#ECFDF5",
        text: "#059669",
        edge: "#10B981",
        icon: "checkmark-circle-outline",
      };
    return {
      bg: "#F1F5F9",
      text: "#475569",
      edge: "#94A3B8",
      icon: "help-circle-outline",
    };
  };

  const getPaymentStatusMeta = (paymentStatus: number, name: string) => {
    if (
      paymentStatus === 4 ||
      name?.toLowerCase() === "paid" ||
      name?.toLowerCase() === "completed"
    ) {
      return { bg: "#DCFCE7", text: "#15803D", edge: "#22C55E", label: "Paid" };
    }
    if (
      name?.toLowerCase() === "in process" ||
      name?.toLowerCase() === "inprocess"
    ) {
      return {
        bg: "#EFF6FF",
        text: "#1D4ED8",
        edge: "#3B82F6",
        label: "In Process",
      };
    }
    return {
      bg: "#FEE2E2",
      text: "#B91C1C",
      edge: "#EF4444",
      label: name || "Unpaid",
    };
  };

  // Determine if total window loading state applies
  const showMainSkeletonLoader = globalLoading || filterChanging;

  if (!isAuthenticated) {
    return <PremiumGuestGate screenType="orders" />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {cancelMessage.type === "error" && (
        <View style={styles.bannerError}>
          <Ionicons name="alert-circle-outline" size={18} color="#EF4444" />
          <Text style={styles.bannerErrorText}>{cancelMessage.text}</Text>
        </View>
      )}

      {cancelMessage.type === "success" && (
        <View style={styles.bannerSuccess}>
          <Ionicons name="checkmark-circle-outline" size={18} color="#16A34A" />
          <Text style={styles.bannerSuccessText}>{cancelMessage.text}</Text>
        </View>
      )}

      {/* <OrderCancelModal
        visible={isCancelConfirmVisible}
        isLoading={isCanceling}
        errorMessage={cancelMessage.type === "error" ? cancelMessage.text : ""}
        onConfirm={() =>
          executeOrderCancellation(() => {
            setIsCancelConfirmVisible(false);
            closeDetailInspector();
            fetchOrders(activeFilter);
          })
        }
        onCancel={() => setIsCancelConfirmVisible(false)}
      /> */}

      <OrderCancelModal
        visible={isCancelConfirmVisible}
        isLoading={isCanceling}
        isLoadingReasons={loadingReasons}
        reasons={cancellationReasons}
        selectedReason={selectedReason}
        onSelectReason={setSelectedReason}
        errorMessage={cancelMessage.type === "error" ? cancelMessage.text : ""}
        onConfirm={() =>
          executeOrderCancellation(() => {
            setIsCancelConfirmVisible(false);
            closeDetailInspector();
            fetchOrders(activeFilter);
          })
        }
        onCancel={() => setIsCancelConfirmVisible(false)}
      />

      {/* FILTER BAR */}
      <View style={styles.filterBarContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          {STATUS_FILTERS.map((filter) => {
            const isActive = activeFilter === filter.value;
            return (
              <TouchableOpacity
                key={filter.value}
                style={[
                  styles.filterBadge,
                  isActive && styles.filterBadgeActive,
                ]}
                onPress={() => {
                  if (activeFilter !== filter.value) {
                    setActiveFilter(filter.value);
                  }
                }}
              >
                <Text
                  style={[
                    styles.filterBadgeText,
                    isActive && styles.filterBadgeTextActive,
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* MAIN DATA RENDERING WINDOW */}
      {showMainSkeletonLoader ? (
        <FlatList
          data={[1, 2, 3, 4]}
          keyExtractor={(item) => item.toString()}
          contentContainerStyle={styles.listContentSpace}
          renderItem={() => <CardSkeleton />}
        />
      ) : (
        <>
          {serverError ? (
            <EmptyState
              iconName="cloud-offline-outline"
              title="Server Connection Interrupted"
              description="We are having trouble synchronizing our orders. Please check your network and try again."
              actionLabel="Retry Connection"
              onActionPress={handleRetryFetch}
            />
          ) : (
            <FlatList
              data={orders}
              keyExtractor={(item) => item.OrderId?.toString()}
              contentContainerStyle={styles.listContentSpace}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={["#0284C7"]} // Android loading spinner color
                  tintColor="#0284C7" // iOS loading spinner color
                />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="receipt-outline" size={54} color="#CBD5E1" />
                  <Text style={styles.emptyTitle}>No Orders Placed Yet</Text>
                  <Text style={styles.emptySubtext}>
                    Your order tracking summary will show up directly inside
                    this feed window.
                  </Text>
                </View>
              }
              renderItem={({ item }) => {
                const statusConfig = getStatusMetaConfig(
                  item.OrderStatus || "Created",
                );
                const payConfig = getPaymentStatusMeta(
                  item.PaymentStatus,
                  item.PaymentStatusName,
                );

                // Is the payment completely settled?
                const isPaymentSettled =
                  item.PaymentStatus === 4 ||
                  item.PaymentStatusName?.toLowerCase() === "completed" ||
                  item.PaymentStatusName?.toLowerCase() === "paid";

                const needsPaymentAction =
                  !isPaymentSettled &&
                  (item.OrderStatus?.toLowerCase().includes("wait") ||
                    item.OrderStatus?.toLowerCase().includes("pending") ||
                    item.Status === 15);

                // Verify action should ONLY appear if it's an online gateway (e.g. Stripe) and NOT yet marked paid/completed
                const isInProcessPayment =
                  !isPaymentSettled &&
                  item.PaymentMethod?.toLowerCase() === "stripe" &&
                  (item.PaymentStatusName?.toLowerCase().includes("process") ||
                    item.OrderStatus?.toLowerCase().includes("process"));

                return (
                  <View
                    style={[
                      styles.orderCard,
                      { borderLeftColor: payConfig.edge },
                    ]}
                  >
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() =>
                        openDetailInspector(item.OrderId.toString())
                      }
                    >
                      <View style={styles.cardHeader}>
                        <View>
                          <Text style={styles.orderNo}>{item.OrderNumber}</Text>
                          <Text style={styles.orderDate}>
                            {item.OrderDate || "Date Pending"}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.badge,
                            { backgroundColor: statusConfig.bg },
                          ]}
                        >
                          <Ionicons
                            name={statusConfig.icon as any}
                            size={12}
                            color={statusConfig.text}
                            style={{ marginRight: 4 }}
                          />
                          <Text
                            style={[
                              styles.badgeText,
                              { color: statusConfig.text },
                            ]}
                          >
                            {item.OrderStatus || "Created"}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.divider} />

                      <View style={styles.cardInfoBody}>
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>Method:</Text>
                          <Text style={styles.infoValue}>
                            {item.PaymentMethod || "Not Selected"}
                          </Text>
                        </View>
                        <View style={styles.infoRow}>
                          <Text style={styles.infoLabel}>Payment Status:</Text>
                          <View
                            style={[
                              styles.miniBadge,
                              { backgroundColor: payConfig.bg },
                            ]}
                          >
                            <Text
                              style={[
                                styles.miniBadgeText,
                                { color: payConfig.text },
                              ]}
                            >
                              {payConfig.label}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View style={styles.divider} />

                      <View style={styles.cardFooter}>
                        <Text style={styles.orderIdText}>
                          ID: #{item.OrderId}
                        </Text>
                        <Text style={styles.priceText}>
                          Rs. {item.Total?.toLocaleString()}
                        </Text>
                      </View>

                      {/* ACTION FOOTERS CONDITIONALS */}
                      {isInProcessPayment && (
                        <TouchableOpacity
                          style={styles.verifyPaymentButton}
                          disabled={
                            verifyingOrderId === item.OrderId.toString()
                          }
                          onPress={() =>
                            handleVerifyPaymentDirectly(item.OrderId.toString())
                          }
                        >
                          {verifyingOrderId === item.OrderId.toString() ? (
                            <ActivityIndicator size="small" color="#FFF" />
                          ) : (
                            <Ionicons
                              name="refresh-circle-outline"
                              size={16}
                              color="#FFF"
                            />
                          )}
                          <Text style={styles.payButtonText}>
                            {verifyingOrderId === item.OrderId.toString()
                              ? "Verifying..."
                              : "Verify Payment"}
                          </Text>
                        </TouchableOpacity>
                      )}

                      {needsPaymentAction && !isInProcessPayment && (
                        <TouchableOpacity
                          style={styles.payButton}
                          onPress={() =>
                            handleProceedToPayment(item.OrderId.toString())
                          }
                        >
                          <Ionicons
                            name="card-outline"
                            size={16}
                            color="#FFF"
                          />
                          <Text style={styles.payButtonText}>Pay Invoice</Text>
                        </TouchableOpacity>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              }}
            />
          )}
        </>
      )}

      {/* DETAIL OVERLAY BOTTOM SHEET MODAL */}
      <Modal
        visible={detailModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeDetailInspector}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Order Summary</Text>
              <TouchableOpacity
                onPress={closeDetailInspector}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {modalLoading ? (
              <DetailSkeleton />
            ) : modalError ? (
              <View style={styles.errorStateView}>
                <Ionicons
                  name="cloud-offline-outline"
                  size={44}
                  color="#EF4444"
                />
                <Text style={styles.errorStateText}>{modalError}</Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() =>
                    currentOrderDetail?.OrderId &&
                    openDetailInspector(currentOrderDetail.OrderId.toString())
                  }
                >
                  <Text style={styles.retryButtonText}>Retry Lookup</Text>
                </TouchableOpacity>
              </View>
            ) : currentOrderDetail ? (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 34 }}
              >
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryNum}>
                    {currentOrderDetail.OrderNumber}
                  </Text>
                  <Text style={styles.summaryTotal}>
                    Rs. {currentOrderDetail.NetAmount?.toLocaleString()}
                  </Text>

                  <View style={styles.badgeRow}>
                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor: getStatusMetaConfig(
                            currentOrderDetail.OrderStatusDisplayName,
                          ).bg,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          {
                            color: getStatusMetaConfig(
                              currentOrderDetail.OrderStatusDisplayName,
                            ).text,
                          },
                        ]}
                      >
                        Order: {currentOrderDetail.OrderStatusDisplayName}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor: getPaymentStatusMeta(
                            currentOrderDetail.PaymentStatus,
                            currentOrderDetail.PaymentStatusDisplayName,
                          ).bg,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          {
                            color: getPaymentStatusMeta(
                              currentOrderDetail.PaymentStatus,
                              currentOrderDetail.PaymentStatusDisplayName,
                            ).text,
                          },
                        ]}
                      >
                        Payment: {currentOrderDetail.PaymentStatusDisplayName}
                      </Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.sectionHeader}>Items Ordered</Text>
                {currentOrderDetail.OrderDetails?.OrderItemList?.map(
                  (item: any, index: number) => (
                    <View
                      style={styles.itemRow}
                      key={item.OrderDetailId || index}
                    >
                      <View style={styles.itemIconBox}>
                        <Ionicons
                          name="shirt-outline"
                          size={18}
                          color="#0284C7"
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.itemName}>{item.ProductName}</Text>
                        <Text style={styles.itemSpecs}>
                          Variant: {item.VariantName || "Standard"} • Qty:{" "}
                          {item.Quantity}
                        </Text>
                      </View>
                      <Text style={styles.itemPrice}>
                        Rs. {item.TotalAmount?.toLocaleString()}
                      </Text>
                    </View>
                  ),
                )}

                <Text style={styles.sectionHeader}>Shipping Target</Text>
                <View style={styles.shippingCard}>
                  <Text style={styles.shipName}>
                    {currentOrderDetail.OrderShippingDetails?.FullName}
                  </Text>
                  <Text style={styles.shipAddress}>
                    {currentOrderDetail.OrderShippingDetails?.Address}
                  </Text>
                  <Text style={styles.shipPhone}>
                    <Ionicons name="call-outline" size={12} />{" "}
                    {currentOrderDetail.OrderShippingDetails?.Phone}
                  </Text>
                </View>

                {currentOrderDetail.SpecialInstructions ? (
                  <>
                    <Text style={styles.sectionHeader}>Special Notes</Text>
                    <View style={styles.notesCard}>
                      <Text style={styles.notesText}>
                        "{currentOrderDetail.SpecialInstructions}"
                      </Text>
                    </View>
                  </>
                ) : null}

                <View style={styles.modalActionsStack}>
                  {currentOrderDetail.PaymentStatus !== 4 &&
                    currentOrderDetail.PaymentStatusDisplayName?.toLowerCase() !==
                      "completed" &&
                    currentOrderDetail.PaymentStatusDisplayName?.toLowerCase() !==
                      "paid" &&
                    (currentOrderDetail.Status === 15 ||
                      currentOrderDetail.OrderStatusDisplayName?.toLowerCase().includes(
                        "pending",
                      )) && (
                      <TouchableOpacity
                        style={styles.modalPayBtn}
                        onPress={() =>
                          handleProceedToPayment(currentOrderDetail.OrderId)
                        }
                      >
                        <Ionicons
                          name="shield-checkmark-outline"
                          size={18}
                          color="#FFF"
                        />
                        <Text style={styles.modalPayBtnText}>
                          Complete Secure Payment
                        </Text>
                      </TouchableOpacity>
                    )}
                  {(currentOrderDetail.Status === 15 ||
                    currentOrderDetail.OrderStatusDisplayName?.toLowerCase().includes(
                      "pending",
                    )) && (
                    <TouchableOpacity
                      style={styles.modalCancelBtn}
                      disabled={isCanceling}
                      onPress={() =>
                        triggerCancelConfirmation(
                          currentOrderDetail.OrderId?.toString(),
                        )
                      } // Opens your pre-existing confirmation modal
                    >
                      {isCanceling ? (
                        <ActivityIndicator size="small" color="#EF4444" />
                      ) : (
                        <>
                          <Ionicons
                            name="trash-outline"
                            size={18}
                            color="#EF4444"
                          />
                          <Text style={styles.modalCancelBtnText}>
                            Cancel Order
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  filterBarContainer: {
    paddingTop: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  filterBadgeActive: { backgroundColor: "#0284C7", borderColor: "#0284C7" },
  filterBadgeText: { fontSize: 13, fontWeight: "600", color: "#64748B" },
  filterBadgeTextActive: { color: "#FFF" },
  listContentSpace: { paddingHorizontal: 16, paddingBottom: 24, gap: 15 },
  emptyContainer: {
    alignItems: "center",
    marginTop: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 4,
    lineHeight: 18,
  },
  orderCard: {
    marginTop: 10,
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 5,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
      },
      android: { elevation: 3 },
    }),
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  orderNo: { fontSize: 15, fontWeight: "700", color: "#0F172A" },
  orderDate: { fontSize: 12, color: "#94A3B8", marginTop: 2 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: { fontSize: 11, fontWeight: "700" },
  divider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 12 },
  cardInfoBody: { gap: 8 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: { fontSize: 13, color: "#64748B", fontWeight: "500" },
  infoValue: { fontSize: 13, fontWeight: "600", color: "#334155" },
  miniBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  miniBadgeText: { fontSize: 11, fontWeight: "700" },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderIdText: { fontSize: 12, color: "#94A3B8", fontWeight: "500" },
  priceText: { fontSize: 16, fontWeight: "800", color: "#0F172A" },
  payButton: {
    backgroundColor: "#0284C7",
    borderRadius: 12,
    height: 44,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 14,
  },
  verifyPaymentButton: {
    backgroundColor: "#10B981",
    borderRadius: 12,
    height: 44,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 14,
  },
  payButtonText: { color: "#FFF", fontSize: 13, fontWeight: "700" },
  skeletonCard: { borderLeftWidth: 5, borderLeftColor: "#E2E8F0" },
  skeletonLeftBar: {
    width: 5,
    backgroundColor: "#E2E8F0",
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  skeletonLine: { backgroundColor: "#E2E8F0", borderRadius: 4 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    paddingHorizontal: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#0F172A" },
  closeButton: { backgroundColor: "#F1F5F9", padding: 6, borderRadius: 20 },
  summaryCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  summaryNum: { fontSize: 13, fontWeight: "600", color: "#64748B" },
  summaryTotal: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
    marginVertical: 6,
  },
  badgeRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "800",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 24,
    marginBottom: 10,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  itemIconBox: { backgroundColor: "#F0F9FF", padding: 8, borderRadius: 10 },
  itemName: { fontSize: 14, fontWeight: "700", color: "#1E293B" },
  itemSpecs: { fontSize: 12, color: "#64748B", marginTop: 2 },
  itemPrice: { fontSize: 14, fontWeight: "700", color: "#1E293B" },
  shippingCard: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    borderRadius: 14,
    gap: 4,
  },
  shipName: { fontSize: 14, fontWeight: "700", color: "#1E293B" },
  shipAddress: { fontSize: 13, color: "#64748B", lineHeight: 18 },
  shipPhone: { fontSize: 12, color: "#64748B", marginTop: 2 },
  notesCard: {
    backgroundColor: "#FFFBEB",
    borderLeftWidth: 3,
    borderLeftColor: "#F59E0B",
    padding: 12,
    borderRadius: 8,
  },
  notesText: { fontSize: 13, color: "#D97706", fontStyle: "italic" },
  modalActionsStack: { marginTop: 24, gap: 15 },
  modalPayBtn: {
    backgroundColor: "#10B981",
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  modalPayBtnText: { color: "#FFF", fontSize: 14, fontWeight: "700" },
  errorStateView: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  errorStateText: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#0284C7",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: { color: "#FFF", fontSize: 13, fontWeight: "600" },
  bannerError: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    backgroundColor: "#FEF2F2",
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
  },
  bannerErrorText: { color: "#EF4444", fontWeight: "600", fontSize: 13 },
  bannerSuccess: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    backgroundColor: "#F0FDF4",
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
  },
  bannerSuccessText: { color: "#16A34A", fontWeight: "600", fontSize: 13 },
  modalCancelBtn: {
    flexDirection: "row",
    backgroundColor: "#FEF2F2", // Soft red background
    borderWidth: 1,
    borderColor: "#FEE2E2",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  modalCancelBtnText: {
    color: "#EF4444", // Dark red text
    fontSize: 16,
    fontWeight: "600",
  },
});
