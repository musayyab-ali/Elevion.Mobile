import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";
import { useCartScreen } from "../hooks/useCartScreen";
import { Colors } from "@/constants/Theme";

const IMAGE_BASE_URL = "http://thelink.innovex.biz/";

export const CartScreen = () => {
  const {
    cartItems,
    pricingSummary,
    loading,
    handleIncrement,
    handleDecrement,
    handleRemove,
    handleProcessCheckoutPipeline,
  } = useCartScreen();

  if (loading && cartItems.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0284C7" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cartItems}
        keyExtractor={(item) => `cart-row-${item.CartId}`}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={styles.sheetTitle}>
            Shopping Bag ({cartItems.length} items)
          </Text>
        }
        renderItem={({ item, index }) => (
          <MotiView
            from={{ opacity: 0, translateY: 15 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 300, delay: index * 40 }}
            style={styles.cartCard}
          >
            <Image
              source={{ uri: `${IMAGE_BASE_URL}${item.ProductImage}` }}
              style={styles.productImage}
            />

            <View style={styles.cardDetails}>
              <View style={styles.rowHeader}>
                <Text style={styles.productName} numberOfLines={1}>
                  {item.ProductName}
                </Text>
                <TouchableOpacity onPress={() => handleRemove(item.CartId)}>
                  <Ionicons name="trash-outline" size={18} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              <Text style={styles.variantText}>
                {item.ProductVariants || "Standard Configuration"}
              </Text>

              <View style={styles.priceRow}>
                <Text style={styles.priceText}>
                  Rs. {item.Price.toLocaleString()}
                </Text>

                {/* Micro Controller Quantity Box */}
                <View style={styles.quantityWidget}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => handleDecrement(item.CartId, item.Quantity)}
                  >
                    <Ionicons name="remove" size={14} color="#1E293B" />
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{item.Quantity}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => handleIncrement(item.CartId, item.Quantity)}
                  >
                    <Ionicons name="add" size={14} color="#1E293B" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </MotiView>
        )}
        ListEmptyComponent={
          <View style={styles.emptyView}>
            <Ionicons name="bag-handle-outline" size={64} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>Your Bag is Empty</Text>
            <Text style={styles.emptySubtitle}>
              Items you add to your shopping cart will appear right here.
            </Text>
          </View>
        }
      />

      {/* Persistent Price Summary Dashboard Layer */}
      {cartItems.length > 0 && (
        <View style={styles.checkoutFooter}>
          <View style={styles.summaryLine}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>
              Rs. {pricingSummary.subtotal.toLocaleString()}
            </Text>
          </View>
          <View style={styles.summaryLine}>
            <Text style={styles.summaryLabel}>Discounts</Text>
            <Text style={[styles.summaryValue, { color: "#10B981" }]}>
              - Rs. {pricingSummary.discount.toLocaleString()}
            </Text>
          </View>
          <View style={[styles.summaryLine, styles.grandTotalLine]}>
            <Text style={styles.grandTotalLabel}>Total Amount</Text>
            <Text style={styles.grandTotalValue}>
              Rs. {pricingSummary.grandTotal.toLocaleString()}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.checkoutBtn}
            activeOpacity={0.8}
            onPress={handleProcessCheckoutPipeline}
          >
            <Text style={styles.checkoutBtnText}>
              PROCEED TO SECURE CHECKOUT
            </Text>
            <Ionicons
              name="arrow-forward-heading"
              size={16}
              color="#FFFFFF"
              style={styles.arrowSpacing}
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    // flex: 1,
    padding: 16,
    paddingBottom: 220,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  cartCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  productImage: {
    width: 84,
    height: 84,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
  },
  cardDetails: { flex: 1, marginLeft: 14, justifyContent: "space-between" },
  rowHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
    flex: 0.95,
  },
  variantText: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
    marginTop: 2,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  priceText: { fontSize: 14, fontWeight: "800", color: "#0284C7" },
  quantityWidget: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  qtyBtn: {
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
    paddingHorizontal: 6,
  },
  emptyView: { alignItems: "center", marginTop: 100, paddingHorizontal: 40 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E293B",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 20,
  },
  checkoutFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  summaryLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: { fontSize: 13, color: "#64748B", fontWeight: "500" },
  summaryValue: { fontSize: 13, color: "#1E293B", fontWeight: "700" },
  grandTotalLine: {
    borderTopWidth: 1,
    borderColor: "#F1F5F9",
    paddingTop: 12,
    marginTop: 4,
    marginBottom: 16,
  },
  grandTotalLabel: { fontSize: 15, fontWeight: "800", color: "#0F172A" },
  grandTotalValue: { fontSize: 18, fontWeight: "900", color: "#0F172A" },
  checkoutBtn: {
    backgroundColor: "#0F172A",
    height: 54,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  checkoutBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  arrowSpacing: { marginLeft: 6 },
});
