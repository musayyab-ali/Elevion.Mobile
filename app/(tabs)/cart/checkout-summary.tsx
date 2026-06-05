import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  useCheckoutSummary,
  DeliveryOption,
} from "@/features/cart/hooks/useCheckoutSummary";
import { CustomErrorMessage } from "@/components/CustomErrorMessage";

export default function CheckoutSummaryScreen() {
  const params = useLocalSearchParams();
  const checkoutData = params.data ? JSON.parse(params.data as string) : null;

  if (!checkoutData) {
    return (
      <View style={styles.centerWrapper}>
        <Text style={styles.errorText}>No checkout session found.</Text>
      </View>
    );
  }

  // Bind custom business loop variables hooks
  const hook = useCheckoutSummary(checkoutData);

  const itemsList = checkoutData?.CartItemDtos?.CartItemList || [];
  const hasItems = itemsList.length > 0;

  return (
    <View style={styles.parent}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* 📍 SHIPPING ADDRESS MANAGER BLOCK */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="location" size={20} color="#E11D48" />
            <Text style={styles.cardTitle}>Shipping Details</Text>
            {hook.isAddressSaved && (
              <TouchableOpacity
                style={{ marginLeft: "auto" }}
                onPress={() => hook.setIsAddressSaved(false)}
              >
                <Text style={styles.editLink}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>

          {!hook.isAddressSaved ? (
            <View style={styles.formContainer}>
              {/* Quick-Pick DB Save Selector Section */}
              {hook.savedAddresses.length > 0 && (
                <View style={styles.quickPickSection}>
                  <Text style={styles.subSectionLabel}>
                    Quick Select Saved Destination:
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={{ marginTop: 8 }}
                  >
                    {hook.savedAddresses.map((addr: any, index: number) => (
                      <TouchableOpacity
                        key={addr.AddressId || index}
                        style={styles.addressChip}
                        onPress={() => hook.handleSelectSavedAddress(addr)}
                      >
                        <Ionicons
                          name="bookmark-outline"
                          size={12}
                          color="#1E293B"
                        />
                        <Text style={styles.chipText} numberOfLines={1}>
                          {addr.AddressLabel || addr.Address || "Address"}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              <TextInput
                placeholder="Full Name"
                style={styles.input}
                value={hook.addressForm.fullName}
                onChangeText={(txt) =>
                  hook.setAddressForm((p) => ({ ...p, fullName: txt }))
                }
              />
              <TextInput
                placeholder="Phone Number"
                keyboardType="phone-pad"
                style={styles.input}
                value={hook.addressForm.phone}
                onChangeText={(txt) =>
                  hook.setAddressForm((p) => ({ ...p, phone: txt }))
                }
              />
              <TextInput
                placeholder="Complete Street Address"
                style={styles.input}
                value={hook.addressForm.address}
                onChangeText={(txt) =>
                  hook.setAddressForm((p) => ({ ...p, address: txt }))
                }
              />
              <TextInput
                placeholder="City"
                style={styles.input}
                value={hook.addressForm.city}
                onChangeText={(txt) =>
                  hook.setAddressForm((p) => ({ ...p, city: txt }))
                }
              />
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={hook.handleSaveAddress}
              >
                <Text style={styles.saveBtnText}>
                  Confirm Shipping Destination
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.addressDisplay}>
              <Text style={styles.primaryText}>
                {hook.addressForm.fullName}
              </Text>
              <Text style={styles.secondaryText}>
                {hook.addressForm.address}, {hook.addressForm.city}
              </Text>
              <Text style={styles.secondaryText}>
                Phone: {hook.addressForm.phone}
              </Text>
            </View>
          )}
        </View>

        {/* 🧾 NEW ADDITION: BILLING OVERVIEW CARD */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="card-outline" size={20} color="#E11D48" />
            <Text style={styles.cardTitle}>Billing Details</Text>
          </View>
          <View style={styles.addressDisplay}>
            <Text style={styles.primaryText}>
              {checkoutData?.BillingDetail?.FullName ||
                hook.addressForm.fullName ||
                "Identical to shipping parameters"}
            </Text>
            <Text style={styles.secondaryText}>
              {checkoutData?.BillingDetail?.Address ||
                hook.addressForm.address ||
                "No custom billing address attached"}
            </Text>
            <Text style={styles.secondaryText}>
              Email:{" "}
              {checkoutData?.BillingDetail?.EmailAddress ||
                "No Email provided for billing contact"}
            </Text>
          </View>
        </View>

        {/* 🚚 NEW ADDITION: DELIVERY/COURIER SHIPPING METHODS */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="airplane-outline" size={20} color="#E11D48" />
            <Text style={styles.cardTitle}>Delivery Options</Text>
          </View>

          {hook.loadingOptions ? (
            <ActivityIndicator size="small" color="#E11D48" />
          ) : (
            <View style={styles.deliveryGroup}>
              {hook.deliveryOptions.map((opt: DeliveryOption) => {
                const isSelected =
                  hook.selectedOption?.DeliveryTypeId === opt.DeliveryTypeId;
                return (
                  <TouchableOpacity
                    key={opt.DeliveryTypeId}
                    style={[
                      styles.deliveryRowItem,
                      isSelected && styles.deliverySelectedRow,
                    ]}
                    onPress={() => hook.setSelectedOption(opt)}
                  >
                    <Ionicons
                      name={isSelected ? "radio-button-on" : "radio-button-off"}
                      size={18}
                      color={isSelected ? "#E11D48" : "#94A3B8"}
                    />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.deliveryName}>{opt.DisplayName}</Text>
                      <Text style={styles.deliverySub}>
                        Estimated Arrival: {opt.EstimatedDays} day(s)
                      </Text>
                    </View>
                    <Text style={styles.deliveryChargeText}>
                      Rs. {opt.Charge}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {/* 📦 CART BREAKDOWN ITEMS SECTION */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="cube" size={20} color="#E11D48" />
            <Text style={styles.cardTitle}>
              Order Items ({checkoutData.TotalItems || itemsList.length})
            </Text>
          </View>

          {!hasItems ? (
            <Text style={styles.emptyItemsText}>
              No product items detected in server checkout cache layout.
            </Text>
          ) : (
            itemsList.map((item: any, idx: number) => (
              <View key={item.CartId || idx} style={styles.itemRow}>
                <Image
                  source={{
                    uri: item.ProductImage || "https://via.placeholder.com/150",
                  }}
                  style={styles.productImage}
                />
                <View style={styles.itemMeta}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.ProductName || "Store Product"}
                  </Text>
                  <Text style={styles.itemQty}>
                    Quantity: {item.Quantity || 1}
                  </Text>
                </View>
                <Text style={styles.itemPrice}>
                  Rs.{" "}
                  {((item.Price || 0) * (item.Quantity || 1)).toLocaleString()}
                </Text>
              </View>
            ))
          )}
        </View>

        {/* 💳 BILLING OVERVIEW SUMMARY SECTION */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="receipt" size={20} color="#E11D48" />
            <Text style={styles.cardTitle}>Payment Breakdown</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal</Text>
            <Text style={styles.priceValue}>
              Rs. {hook.subtotal.toLocaleString()}
            </Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>
              Delivery Charges ({hook.selectedOption?.DisplayName || "Normal"})
            </Text>
            <Text style={styles.priceValue}>
              Rs. {hook.deliveryCharge.toLocaleString()}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Grand Total</Text>
            <Text style={styles.totalValue}>
              Rs. {hook.grandTotal.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* 🚀 ACTION CALL */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            hook.isSubmittingOrder && { opacity: 0.7 },
          ]}
          onPress={hook.handleProceedToPayment}
          disabled={hook.isSubmittingOrder}
        >
          {hook.isSubmittingOrder ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Text style={styles.actionButtonText}>Generate Order & Pay</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFF" />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
      {hook.checkoutMessage && (
        <CustomErrorMessage>{hook.checkoutMessage}</CustomErrorMessage>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  parent: { flex: 1, backgroundColor: "#F8FAFC", padding: 16 },
  container: { flex: 1 },
  centerWrapper: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 16, color: "#64748B" },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#1E293B" },
  editLink: { color: "#E11D48", fontWeight: "600", fontSize: 14 },
  primaryText: { fontSize: 15, fontWeight: "600", color: "#334155" },
  secondaryText: { fontSize: 13, color: "#64748B", marginTop: 4 },
  emptyItemsText: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
    marginVertical: 12,
  },
  formContainer: { gap: 12 },
  quickPickSection: { paddingBottom: 6 },
  subSectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    textTransform: "uppercase",
  },
  addressChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1E293B",
    maxWidth: 120,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: "#334155",
    backgroundColor: "#F8FAFC",
  },
  saveBtn: {
    backgroundColor: "#1E293B",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    marginTop: 4,
  },
  saveBtnText: { color: "#FFF", fontWeight: "600", fontSize: 14 },
  addressDisplay: { paddingVertical: 4 },
  deliveryGroup: { gap: 10 },
  deliveryRowItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFF",
  },
  deliverySelectedRow: { borderColor: "#E11D48", backgroundColor: "#FFF1F2" },
  deliveryName: { fontSize: 14, fontWeight: "700", color: "#1E293B" },
  deliverySub: { fontSize: 12, color: "#64748B", marginTop: 2 },
  deliveryChargeText: { fontSize: 14, fontWeight: "700", color: "#334155" },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  productImage: {
    width: 55,
    height: 55,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
  },
  itemMeta: { flex: 1, marginLeft: 12 },
  itemName: { fontSize: 14, fontWeight: "600", color: "#334155" },
  itemQty: { fontSize: 12, color: "#64748B", marginTop: 4 },
  itemPrice: { fontSize: 15, fontWeight: "700", color: "#1E293B" },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  priceLabel: { fontSize: 14, color: "#64748B" },
  priceValue: { fontSize: 14, fontWeight: "600", color: "#334155" },
  divider: { height: 1, backgroundColor: "#E2E8F0", marginVertical: 12 },
  totalLabel: { fontSize: 16, fontWeight: "700", color: "#1E293B" },
  totalValue: { fontSize: 18, fontWeight: "700", color: "#E11D48" },
  actionButton: {
    backgroundColor: "#E11D48",
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    marginBottom: 100,
    shadowColor: "#E11D48",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  actionButtonText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});
