import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { usePaymentMethods } from "../hooks/usePaymentMethods";

export const PaymentMethodsScreen = () => {
  const { orderId } = useLocalSearchParams();
  const hook = usePaymentMethods(orderId as string);

  if (hook.loading) {
    return (
      <View style={styles.centerWrapper}>
        <ActivityIndicator size="large" color="#E11D48" />
        <Text style={styles.loadingText}>
          Initializing Payment Configuration...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "#F8FAFC" }}
    >
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* 🎫 PROMO COUPON DECK SECTION */}
        <View style={styles.card}>
          <Text style={styles.sectionHeaderTitle}>Have a Promo Coupon?</Text>
          {!hook.appliedPromo ? (
            <View style={styles.promoFormInputRow}>
              <TextInput
                placeholder="Enter Promo Code (e.g. SAVE20)"
                placeholderTextColor="#94A3B8"
                style={styles.promoTextInputField}
                value={hook.promoCode}
                onChangeText={hook.setPromoCode}
                autoCapitalize="characters"
              />
              <TouchableOpacity
                style={styles.promoSubmitBtn}
                onPress={hook.handleApplyPromo}
              >
                <Text style={styles.promoSubmitBtnText}>Apply</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.activePromoBadgeRow}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.badgePrimaryText}>
                  Code "{hook.appliedPromo.code}" Active
                </Text>
                <Text style={styles.badgeSecondaryText}>
                  Discount saved Rs. {hook.appliedPromo.discount}
                </Text>
              </View>
              <TouchableOpacity onPress={hook.handleCancelPromo}>
                <Text style={styles.removePromoActionLinkText}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* 💎 LOYALTY POINTS BLOCK VALUE REFINER */}
        <View style={styles.card}>
          <Text style={styles.sectionHeaderTitle}>
            Redeem Store Reward Points
          </Text>
          <View style={styles.promoFormInputRow}>
            <TextInput
              placeholder="Number of points to spend"
              placeholderTextColor="#94A3B8"
              keyboardType="number-pad"
              style={styles.promoTextInputField}
              value={hook.pointsToRedeem}
              onChangeText={hook.setPointsToRedeem}
              editable={!hook.pointsApplied}
            />
            <TouchableOpacity
              style={[
                styles.pointsRedeemButton,
                hook.pointsApplied && { backgroundColor: "#10B981" },
              ]}
              onPress={hook.handleApplyPoints}
              disabled={hook.pointsApplied}
            >
              <Text style={styles.promoSubmitBtnText}>
                {hook.pointsApplied ? "Applied" : "Redeem"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 💳 NATIVE SELECTABLE PAYMENT CHANNELS DECK */}
        <Text style={styles.mainTitleHeaderLabel}>Select Payment Method</Text>

        <View style={styles.gatewayDeckGroupContainer}>
          {hook.gateways.map((gw) => {
            const isSelected = hook.selectedGatewayId === gw.PGId;
            return (
              <TouchableOpacity
                key={gw.PGId}
                style={[
                  styles.gatewaySelectionCardRow,
                  isSelected && styles.selectedGatewayActiveBorderCard,
                ]}
                onPress={() => hook.setSelectedGatewayId(gw.PGId)}
              >
                <View
                  style={[
                    styles.outerRadioRingCircle,
                    isSelected && styles.activeOuterRadioRingCircle,
                  ]}
                >
                  {isSelected && (
                    <View style={styles.innerRadioFilledDotNode} />
                  )}
                </View>
                <View style={styles.gatewayMetaDescriptionColumn}>
                  <Text style={styles.gatewayNameLabelText}>
                    {gw.Name || "Online Gateway Payment"}
                  </Text>
                  <Text style={styles.gatewaySubtextSubheading}>
                    Secure routing handling credit instruments instantly
                  </Text>
                </View>
                <Ionicons
                  name={
                    gw.Name?.toLowerCase().includes("card")
                      ? "card"
                      : "globe-outline"
                  }
                  size={24}
                  color={isSelected ? "#E11D48" : "#64748B"}
                />
              </TouchableOpacity>
            );
          })}

          {/* 💵 CASH ON DELIVERY CONDITIONAL TRAY */}
          {hook.isCODAvailable && (
            <TouchableOpacity
              style={[
                styles.gatewaySelectionCardRow,
                hook.selectedGatewayId === 0 &&
                  styles.selectedGatewayActiveBorderCard,
              ]}
              onPress={() => hook.setSelectedGatewayId(0)}
            >
              <View
                style={[
                  styles.outerRadioRingCircle,
                  hook.selectedGatewayId === 0 &&
                    styles.activeOuterRadioRingCircle,
                ]}
              >
                {hook.selectedGatewayId === 0 && (
                  <View style={styles.innerRadioFilledDotNode} />
                )}
              </View>
              <View style={styles.gatewayMetaDescriptionColumn}>
                <Text style={styles.gatewayNameLabelText}>
                  Cash On Delivery (COD)
                </Text>
                <Text style={styles.gatewaySubtextSubheading}>
                  Pay with liquid physical currency right at your doorstep
                </Text>
              </View>
              <Ionicons
                name="cash-outline"
                size={24}
                color={hook.selectedGatewayId === 0 ? "#E11D48" : "#64748B"}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* 📊 INTERACTIVE INVOICE BILLING BREAKDOWN */}
        <View style={styles.card}>
          <Text style={styles.sectionHeaderTitle}>Final Payment Invoice</Text>
          <View style={styles.pricingSummaryCalculationRowItem}>
            <Text style={styles.summaryItemTitleDescriptionLabel}>
              Order Subtotal
            </Text>
            <Text style={styles.summaryItemNumericValueText}>
              Rs. {hook.totals.subtotal.toLocaleString()}
            </Text>
          </View>
          <View style={styles.pricingSummaryCalculationRowItem}>
            <Text style={styles.summaryItemTitleDescriptionLabel}>
              Courier Delivery Fees
            </Text>
            <Text style={styles.summaryItemNumericValueText}>
              Rs. {hook.totals.deliveryCharges.toLocaleString()}
            </Text>
          </View>
          {hook.totals.discount > 0 && (
            <View style={styles.pricingSummaryCalculationRowItem}>
              <Text
                style={[
                  styles.summaryItemTitleDescriptionLabel,
                  { color: "#10B981" },
                ]}
              >
                Applied Deductions
              </Text>
              <Text
                style={[
                  styles.summaryItemNumericValueText,
                  { color: "#10B981" },
                ]}
              >
                - Rs. {hook.totals.discount.toLocaleString()}
              </Text>
            </View>
          )}
          <View style={styles.decorativeDividingBreakline} />
          <View style={styles.pricingSummaryCalculationRowItem}>
            <Text style={styles.masterInvoiceGrandTotalLabel}>
              Net Outstanding Amount
            </Text>
            <Text style={styles.masterInvoiceGrandTotalValueText}>
              Rs. {hook.totals.grandTotal.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* 🚀 SUBMIT INVOICE CALL TO ACTION */}
        <TouchableOpacity
          style={[
            styles.masterSubmitCheckoutProcessingBtn,
            hook.isProcessing && { opacity: 0.65 },
          ]}
          onPress={hook.handleProcessPayment}
          disabled={hook.isProcessing}
        >
          {hook.isProcessing ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Text style={styles.masterSubmitCheckoutProcessingBtnTextLabel}>
                Authorize & Pay Invoice
              </Text>
              <Ionicons name="lock-closed" size={18} color="#FFF" />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  centerWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  mainTitleHeaderLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 8,
    marginBottom: 14,
    marginLeft: 2,
  },
  promoFormInputRow: { flexDirection: "row", gap: 10 },
  promoTextInputField: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#1E293B",
    fontWeight: "600",
  },
  promoSubmitBtn: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  pointsRedeemButton: {
    backgroundColor: "#64748B",
    borderRadius: 12,
    paddingHorizontal: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  promoSubmitBtnText: { color: "#FFF", fontWeight: "700", fontSize: 14 },
  activePromoBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    padding: 12,
    borderRadius: 12,
  },
  badgePrimaryText: { fontSize: 14, fontWeight: "700", color: "#065F46" },
  badgeSecondaryText: { fontSize: 12, color: "#047857", marginTop: 2 },
  removePromoActionLinkText: {
    color: "#EF4444",
    fontWeight: "700",
    fontSize: 13,
  },
  gatewayDeckGroupContainer: { gap: 12, marginBottom: 20 },
  gatewaySelectionCardRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  selectedGatewayActiveBorderCard: {
    borderColor: "#E11D48",
    backgroundColor: "#FFF1F2",
  },
  outerRadioRingCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    justifyContent: "center",
    alignItems: "center",
  },
  activeOuterRadioRingCircle: { borderColor: "#E11D48" },
  innerRadioFilledDotNode: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E11D48",
  },
  gatewayMetaDescriptionColumn: { flex: 1 },
  gatewayNameLabelText: { fontSize: 15, fontWeight: "700", color: "#1E293B" },
  gatewaySubtextSubheading: { fontSize: 12, color: "#64748B", marginTop: 3 },
  pricingSummaryCalculationRowItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
  },
  summaryItemTitleDescriptionLabel: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  summaryItemNumericValueText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  decorativeDividingBreakline: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 12,
    borderStyle: "dashed",
  },
  masterInvoiceGrandTotalLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1E293B",
  },
  masterInvoiceGrandTotalValueText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#E11D48",
  },
  masterSubmitCheckoutProcessingBtn: {
    backgroundColor: "#E11D48",
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    marginBottom: 48,
    shadowColor: "#E11D48",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  masterSubmitCheckoutProcessingBtnTextLabel: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
