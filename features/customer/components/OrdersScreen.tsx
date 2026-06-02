import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useOrders } from "../hooks/useOrders";
import { Colors } from "../../../constants/Theme";
import { Ionicons } from "@expo/vector-icons";

export const OrdersScreen = () => {
  const { orders, loading, refreshing, onRefresh } = useOrders();

  const renderOrderItem = ({ item }: { item: any }) => (
    <View style={styles.orderCard}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.orderNumber}>Order #{item.OrderNumber}</Text>
          <Text style={styles.orderDate}>
            {new Date(item.OrderDate).toLocaleDateString()}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.Status) + "20" },
          ]}
        >
          <Text
            style={[styles.statusText, { color: getStatusColor(item.Status) }]}
          >
            {item.OrderStatus}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardFooter}>
        <View style={styles.paymentInfo}>
          <Ionicons name="card-outline" size={16} color={Colors.tertiary} />
          <Text style={styles.paymentMethod}>{item.PaymentMethod}</Text>
        </View>
        <Text style={styles.totalPrice}>${item.Total.toFixed(1)}</Text>
      </View>
    </View>
  );

  const getStatusColor = (status: number) => {
    switch (status) {
      case 1:
        return "#3B82F6"; // Processing
      case 2:
        return "#10B981"; // Complete
      case 3:
        return "#EF4444"; // Cancelled
      default:
        return Colors.tertiary;
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.headerOne[0]} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.OrderId.toString()}
        renderItem={renderOrderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.headerOne[0]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="receipt-outline"
              size={60}
              color={Colors.tertiary}
            />
            <Text style={styles.emptyText}>No orders found yet.</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  listContent: { padding: 16, paddingBottom: 120 }, // Extra padding for floating tab bar
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  orderCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  orderNumber: { fontSize: 16, fontWeight: "700", color: Colors.textMain },
  orderDate: { fontSize: 13, color: Colors.tertiary, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: "700" },
  divider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 12 },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paymentInfo: { flexDirection: "row", alignItems: "center", gap: 6 },
  paymentMethod: { fontSize: 13, color: Colors.tertiary },
  totalPrice: { fontSize: 18, fontWeight: "800", color: Colors.headerOne[0] },
  emptyContainer: { alignItems: "center", marginTop: 100 },
  emptyText: { marginTop: 10, color: Colors.tertiary, fontSize: 16 },
});
