import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCustomerOrders } from "../hooks/useCustomerOrders";

const STATUS_FILTERS = [
  { label: "All", value: -1 },
  { label: "Created", value: 15 },
  { label: "In Process", value: 2 },
  { label: "Completed", value: 3 },
];

export const OrdersHistoryScreen = () => {
  const {
    loading,
    orders,
    currentOrderDetail,
    isCanceling,
    fetchOrders,
    fetchSingleOrderDetail,
    handleCancelOrder,
    setCurrentOrderDetail,
  } = useCustomerOrders();
  const [activeFilter, setActiveFilter] = useState(-1);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  useEffect(() => {
    fetchOrders(activeFilter);
  }, [activeFilter, fetchOrders]);

  const openDetailInspector = async (orderId: string) => {
    await fetchSingleOrderDetail(orderId);
    setDetailModalVisible(true);
  };

  const closeDetailInspector = () => {
    setDetailModalVisible(false);
    setCurrentOrderDetail(null);
  };

  // Helper function to pick colors for status states dynamically
  const getStatusMetaConfig = (statusDisplayName: string) => {
    const status = statusDisplayName?.toLowerCase() || "";
    if (status.includes("process"))
      return { bg: "#EFF6FF", text: "#2563EB", icon: "time-outline" };
    if (status.includes("create") || status.includes("wait"))
      return { bg: "#FEF3C7", text: "#D97706", icon: "document-text-outline" };
    if (status.includes("complete") || status.includes("success"))
      return {
        bg: "#ECFDF5",
        text: "#059669",
        icon: "checkmark-circle-outline",
      };
    return { bg: "#F1F5F9", text: "#475569", icon: "help-circle-outline" };
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER ROW */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Purchase Orders</Text>
        <Text style={styles.headerSubtext}>
          Monitor status modifications and tracking manifests
        </Text>
      </View>

      {/* HORIZONTAL STATUS FILTERS */}
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
                onPress={() => setActiveFilter(filter.value)}
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

      {/* CORE ORDERS CONTENT DATA AREA */}
      {loading && !detailModalVisible ? (
        <View style={styles.centerSpinner}>
          <ActivityIndicator size="large" color="#E11D48" />
          <Text style={styles.loadingMessageText}>
            Synchronizing Orders Ledger...
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.OrderId?.toString()}
          contentContainerStyle={styles.listContentSpace}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyStateContainer}>
              <Ionicons name="receipt-outline" size={64} color="#CBD5E1" />
              <Text style={styles.emptyStateTitle}>No Orders Found</Text>
              <Text style={styles.emptyStateSubtext}>
                There are no matching items inside this sequence index window.
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const visual = getStatusMetaConfig(item.OrderStatusDisplayName);
            return (
              <TouchableOpacity
                style={styles.orderCard}
                onPress={() => openDetailInspector(item.OrderId)}
              >
                <View style={styles.cardHeaderRow}>
                  <View>
                    <Text style={styles.orderNumberLabel}>
                      {item.OrderNumber}
                    </Text>
                    <Text style={styles.orderDateSublabel}>
                      {item.DeliveryDate
                        ? new Date(item.DeliveryDate).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric", year: "numeric" },
                          )
                        : "Date Unspecified"}
                    </Text>
                  </View>
                  <View
                    style={[styles.statusTag, { backgroundColor: visual.bg }]}
                  >
                    <Ionicons
                      name={visual.icon as any}
                      size={14}
                      color={visual.text}
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      style={[styles.statusTagText, { color: visual.text }]}
                    >
                      {item.OrderStatusDisplayName || "Unknown"}
                    </Text>
                  </View>
                </View>

                <View style={styles.cardDividingLine} />

                <View style={styles.cardFooterDetailsRow}>
                  <Text style={styles.totalItemsCountText}>
                    {item.TotalItems} {item.TotalItems === 1 ? "Item" : "Items"}{" "}
                    Ordered
                  </Text>
                  <Text style={styles.cardPriceAmountDisplay}>
                    Rs. {item.NetAmount?.toLocaleString()}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* DEEP INSPECTOR PROFILE MODAL */}
      <Modal
        visible={detailModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeDetailInspector}
      >
        <View style={styles.modalOverlayContainer}>
          <View style={styles.modalContentSheet}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalHeaderTitle}>
                Order Details Manifest
              </Text>
              <TouchableOpacity
                onPress={closeDetailInspector}
                style={styles.closeModalCircleButton}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {loading && detailModalVisible ? (
              <View style={[styles.centerSpinner, { flex: 1 }]}>
                <ActivityIndicator size="large" color="#E11D48" />
              </View>
            ) : currentOrderDetail ? (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 24 }}
              >
                {/* METRICS OVERVIEW BANNER */}
                <View style={styles.inspectOverviewBannerCard}>
                  <Text style={styles.inspectInvoiceIdLabel}>
                    {currentOrderDetail.OrderNumber}
                  </Text>
                  <Text style={styles.inspectInvoiceAmountText}>
                    Rs. {currentOrderDetail.NetAmount?.toLocaleString()}
                  </Text>
                  <Text style={styles.paymentStatusMarkerLabel}>
                    Status: {currentOrderDetail.OrderStatusDisplayName}
                  </Text>
                </View>

                {/* LINE ITEMS BLOCK */}
                <Text style={styles.inspectSectionHeaderLabel}>
                  Purchased Commodities
                </Text>
                {currentOrderDetail.OrderDetails?.OrderItemList?.map(
                  (item: any, index: number) => (
                    <View
                      key={item.OrderDetailId || index}
                      style={styles.productLineItemRow}
                    >
                      <View style={styles.productMetaIconWrapper}>
                        <Ionicons
                          name="shirt-outline"
                          size={20}
                          color="#E11D48"
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.productMainTitleText}>
                          {item.ProductName}
                        </Text>
                        <Text style={styles.productSpecsSubtext}>
                          Variant: {item.VariantName || "Default Spec"} • Qty:{" "}
                          {item.Quantity}
                        </Text>
                      </View>
                      <Text style={styles.productLineItemPriceText}>
                        Rs. {item.TotalAmount?.toLocaleString()}
                      </Text>
                    </View>
                  ),
                )}

                {/* LOGISTICS BLOCK */}
                <Text style={styles.inspectSectionHeaderLabel}>
                  Shipping Logistics Destination
                </Text>
                <View style={styles.infoMetaDetailsCard}>
                  <Text style={styles.infoMetaRecipientName}>
                    {currentOrderDetail.OrderShippingDetails?.FullName ||
                      "Recipient Unassigned"}
                  </Text>
                  <Text style={styles.infoMetaDeliveryAddressText}>
                    {currentOrderDetail.OrderShippingDetails?.Address ||
                      "No explicit shipping data structure linked."}
                  </Text>
                  <Text style={styles.infoMetaDeliveryAddressText}>
                    Contact:{" "}
                    {currentOrderDetail.OrderShippingDetails?.Phone || "N/A"}
                  </Text>
                </View>

                {/* CONDITIONAL ACTION STACK: SHOW CANCEL IF STATUS LOGIC PERMITS */}
                {(currentOrderDetail.OrderStatusDisplayName?.toLowerCase() ===
                  "created" ||
                  currentOrderDetail.Status === 15) && (
                  <TouchableOpacity
                    style={[
                      styles.modalDangerCancelButton,
                      isCanceling && { opacity: 0.6 },
                    ]}
                    disabled={isCanceling}
                    onPress={() =>
                      handleCancelOrder(
                        currentOrderDetail.OrderId?.toString(),
                        () => {
                          closeDetailInspector();
                          fetchOrders(activeFilter);
                        },
                      )
                    }
                  >
                    {isCanceling ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <>
                        <Ionicons name="trash-outline" size={18} color="#FFF" />
                        <Text style={styles.modalDangerCancelButtonText}>
                          Cancel and Revoke Order
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
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
  header: { paddingHorizontal: 16, paddingTop: 16, marginBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#0F172A" },
  headerSubtext: { fontSize: 13, color: "#64748B", marginTop: 2 },
  filterBarContainer: { paddingHorizontal: 16, marginBottom: 14 },
  filterBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#E2E8F0",
  },
  filterBadgeActive: { backgroundColor: "#E11D48" },
  filterBadgeText: { fontSize: 13, fontWeight: "600", color: "#475569" },
  filterBadgeTextActive: { color: "#FFF" },
  listContentSpace: { paddingHorizontal: 16, paddingBottom: 32, gap: 12 },
  centerSpinner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingMessageText: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 64,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#334155",
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 4,
    lineHeigt: 18,
  },
  orderCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  orderNumberLabel: { fontSize: 14, fontWeight: "700", color: "#1E293B" },
  orderDateSublabel: { fontSize: 12, color: "#94A3B8", marginTop: 2 },
  statusTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusTagText: { fontSize: 11, fontWeight: "700" },
  cardDividingLine: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 12,
  },
  cardFooterDetailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalItemsCountText: { fontSize: 13, color: "#64748B", fontWeight: "500" },
  cardPriceAmountDisplay: { fontSize: 15, fontWeight: "800", color: "#0F172A" },
  modalOverlayContainer: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    justifyContent: "flex-end",
  },
  modalContentSheet: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    paddingHorizontal: 16,
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalHeaderTitle: { fontSize: 16, fontWeight: "800", color: "#0F172A" },
  closeModalCircleButton: {
    backgroundColor: "#F1F5F9",
    padding: 6,
    borderRadius: 20,
  },
  inspectOverviewBannerCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  inspectInvoiceIdLabel: { fontSize: 13, fontWeight: "600", color: "#64748B" },
  inspectInvoiceAmountText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#E11D48",
    marginVertical: 4,
  },
  paymentStatusMarkerLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
  },
  inspectSectionHeaderLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
    textTransform: "uppercase",
    tracking: 0.5,
    marginTop: 20,
    marginBottom: 10,
  },
  productLineItemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  productMetaIconWrapper: {
    backgroundColor: "#FFF1F2",
    padding: 10,
    borderRadius: 12,
  },
  productMainTitleText: { fontSize: 14, fontWeight: "700", color: "#1E293B" },
  productSpecsSubtext: { fontSize: 12, color: "#64748B", marginTop: 2 },
  productLineItemPriceText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
  },
  infoMetaDetailsCard: {
    backgroundColor: "#FFF",
    borderWith: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    borderRadius: 16,
    gap: 4,
  },
  infoMetaRecipientName: { fontSize: 14, fontWeight: "700", color: "#1E293B" },
  infoMetaDeliveryAddressText: {
    fontSize: 13,
    color: "#64748B",
    lineHeigt: 18,
  },
  modalDangerCancelButton: {
    backgroundColor: "#EF4444",
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 24,
  },
  modalDangerCancelButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
