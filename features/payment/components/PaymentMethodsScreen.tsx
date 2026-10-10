import React, { useEffect, useState } from "react";
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
  Image,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { usePaymentMethods } from "../hooks/usePaymentMethods";
import { OrderCancelModal } from "@/components/OrderCancelModal";
import { paymentApi } from "../services/paymentApi";
import { Colors } from "@/constants/Theme";

export const PaymentMethodsScreen = () => {
  const { orderId } = useLocalSearchParams();
  const hook = usePaymentMethods(orderId as string);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [isAlreadyPaid, setIsAlreadyPaid] = useState(false);
  const [orderMeta, setOrderMeta] = useState<any>(null);
  const [errorLog, setErrorLog] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      verifyInvoiceLockStatus();
    } else {
      setErrorLog(
        "Missing a valid contextual context order identity context parameter.",
      );
      setCheckingStatus(false);
    }
  }, [orderId]);

  const verifyInvoiceLockStatus = async () => {
    try {
      setCheckingStatus(true);
      setErrorLog(null);

      const formData = new FormData();
      formData.append("files", "");

      const statusRes = await paymentApi.checkOrderPaymentStatus(
        Number(orderId),
        formData,
      );

      // Cache raw order details payload metadata if applicable
      if (statusRes?.Data?.OrderDetails) {
        setOrderMeta(statusRes.Data.OrderDetails);
      }

      const isSuccessStatus =
        statusRes?.HttpStatusCode === 200 ||
        statusRes?.StatusCode === 200 ||
        statusRes?.Type === "Success";

      if (isSuccessStatus && statusRes?.Data?.IsProceedPayment !== true) {
        setIsAlreadyPaid(true);
        return;
      }
    } catch (err: any) {
      console.log("Defensive system lookup failure: ", err);
      setErrorLog(err || "Network synchronization runtime interruption error.");
    } finally {
      setCheckingStatus(false);
    }
  };

  const IMAGE_PLACEHOLDER =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIAeZuzrVTr0malUh4q4UD4wiipA8RuYlqHHDR6IQBxQ&s=10";

  if (checkingStatus) {
    return (
      <View style={styles.centerGateContainer}>
        <ActivityIndicator size="large" color="#E11D48" />
        <Text style={styles.gateProgressText}>Verifying Payment Status...</Text>
      </View>
    );
  }

  if (isAlreadyPaid) {
    return (
      <View style={styles.centerGateContainer}>
        <View style={styles.iconCircleSuccess}>
          <Ionicons name="shield-checkmark" size={44} color="#10B981" />
        </View>
        <Text style={styles.gateTitleText}>Invoice Already Settled</Text>
        <Text style={styles.gateBodyDescription}>
          Order{" "}
          <Text style={{ fontWeight: "700" }}>
            {orderMeta?.OrderNumber || `#${orderId}`}
          </Text>{" "}
          has already been successfully processed. Double payments have been
          intercepted defensively.
        </Text>

        <TouchableOpacity
          style={styles.returnFeedButton}
          onPress={() => router.replace("/(tabs)/orders")}
        >
          <Text style={styles.returnFeedButtonText}>
            Return to Order History
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (errorLog) {
    return (
      <View style={styles.centerGateContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
        <Text style={styles.gateTitleText}>Verification Failed</Text>
        <Text style={styles.gateBodyDescription}>{errorLog}</Text>

        <TouchableOpacity
          style={styles.retryBtn}
          onPress={verifyInvoiceLockStatus}
        >
          <Text style={styles.retryBtnText}>Retry Check</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (hook.loading) {
    return (
      <View style={styles.centerWrapper}>
        <ActivityIndicator size="large" color="#E11D48" />
        <Text style={styles.loadingText}>Please wait...</Text>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.mainLayoutWrapper}>
          {/* SYSTEM TOP GLOBAL NOTIFICATION CONTROLLER */}
          {hook.generalNotification.type && (
            <View
              style={[
                styles.globalBannerAlert,
                hook.generalNotification.type === "error"
                  ? styles.bgError
                  : styles.bgSuccess,
              ]}
            >
              <Ionicons
                name={
                  hook.generalNotification.type === "error"
                    ? "alert-circle"
                    : "checkmark-circle"
                }
                size={20}
                color={
                  hook.generalNotification.type === "error"
                    ? "#EF4444"
                    : "#16A34A"
                }
              />
              <Text
                style={[
                  styles.globalBannerText,
                  hook.generalNotification.type === "error"
                    ? styles.textError
                    : styles.textSuccess,
                ]}
              >
                {hook.generalNotification.text}
              </Text>
            </View>
          )}

          <OrderCancelModal
            visible={hook.isCancelConfirmVisible}
            isLoading={hook.isCanceling}
            isLoadingReasons={hook.loadingReasons}
            reasons={hook.cancellationReasons}
            selectedReason={hook.selectedReason}
            onSelectReason={hook.setSelectedReason}
            errorMessage={
              hook.cancelMessage.type === "error" ? hook.cancelMessage.text : ""
            }
            onConfirm={async () => {
              if (hook.executeOrderCancellation) {
                await hook.executeOrderCancellation(() => {
                  router.replace("/(tabs)/orders");
                });
              }
            }}
            onCancel={() => hook.setIsCancelConfirmVisible(false)}
          />

          {/* SCROLLABLE FORM SEGMENTATION DECK */}
          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={[
              styles.scrollContentLayout,
              hook.isKeyboardVisible && { paddingBottom: 40 },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {/* INVOICE IDENTITY BANNER CARD */}
            <View style={styles.orderSummaryCard}>
              <View style={styles.summaryHeaderRow}>
                <View style={styles.iconBadge}>
                  <Ionicons name="receipt" size={22} color="#E11D48" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.summarySubLabel}>
                    Secure Checkout Session
                  </Text>
                  <Text style={styles.summaryMainLabel}>
                    Order Reference: #{orderId}
                  </Text>
                </View>
              </View>
            </View>

            {/* 📦 PRODUCT ITEMS DECK BLOCK */}
            <View style={styles.card}>
              <Text style={styles.sectionHeaderTitle}>Review Items</Text>
              {hook.orderData?.OrderDetails?.OrderItemList &&
              hook.orderData?.OrderDetails?.OrderItemList.length > 0 ? (
                hook.orderData?.OrderDetails?.OrderItemList?.map(
                  (item: any, idx: number) => (
                    <View key={item.id || idx} style={styles.productRowItem}>
                      {item.ProductImageURL ? (
                        <Image
                          source={{ uri: item.ProductImageURL }}
                          style={styles.productThumbnail || IMAGE_PLACEHOLDER}
                        />
                      ) : (
                        <View style={styles.productThumbnailPlaceholder}>
                          <Ionicons
                            name="cube-outline"
                            size={20}
                            color="#94A3B8"
                          />
                        </View>
                      )}
                      <View style={styles.productMetaInfoColumn}>
                        <Text
                          style={styles.productNameLabelText}
                          numberOfLines={1}
                        >
                          {item.ProductName || "Purchased Product Item"}
                        </Text>
                        <Text style={styles.productVariantSubtext}>
                          {item.VariantName || "Standard Edition"}
                        </Text>
                        <Text style={styles.productQuantityCounterText}>
                          Qty: {item.Quantity || 1} × Rs.{" "}
                          {(item.Amount || 0).toLocaleString()}
                        </Text>
                      </View>
                      <Text style={styles.productCalculatedLinePriceText}>
                        Rs.{" "}
                        {(
                          (item.Amount || 0) * (item.Quantity || 1)
                        ).toLocaleString()}
                      </Text>
                    </View>
                  ),
                )
              ) : (
                <Text style={styles.emptyProductsFallbackText}>
                  No direct line items found attached to context ledger.
                </Text>
              )}
            </View>

            {/* PROMO CODE INTERACTION MODULE */}
            <View style={styles.card}>
              <Text style={styles.sectionHeaderTitle}>
                Have a Promotional Coupon?
              </Text>
              {!hook.appliedPromo ? (
                <>
                  <View style={styles.promoFormInputRow}>
                    <TextInput
                      placeholder="Enter Promo Code (e.g., SAVE50)"
                      placeholderTextColor="#94A3B8"
                      style={[
                        styles.promoTextInputField,
                        hook.promoNotification.type === "error" &&
                          styles.inputBorderError,
                      ]}
                      value={hook.promoCode}
                      onChangeText={hook.setPromoCode}
                      autoCapitalize="characters"
                    />
                    <TouchableOpacity
                      style={styles.promoSubmitBtn}
                      disabled={hook.isProcessing || hook.isPromoLoading}
                      onPress={hook.handleApplyPromo}
                    >
                      {hook.isPromoLoading ? (
                        <ActivityIndicator size="small" color="#FFF" />
                      ) : (
                        <Text style={styles.promoSubmitBtnText}>Apply</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                  {hook.promoNotification.type && (
                    <Text
                      style={[
                        styles.inputFeedbackInlineLabel,
                        hook.promoNotification.type === "error"
                          ? styles.textError
                          : styles.textSuccess,
                      ]}
                    >
                      {hook.promoNotification.text}
                    </Text>
                  )}
                </>
              ) : (
                <View style={styles.activePromoBadgeRow}>
                  <Ionicons name="checkmark-circle" size={22} color="#10B981" />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.badgePrimaryText}>
                      Code "{hook.appliedPromo?.code}" Activated
                    </Text>
                    <Text style={styles.badgeSecondaryText}>
                      Instant savings of Rs.{" "}
                      {hook.appliedPromo?.discount?.toLocaleString()} attached.
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removePromoButton}
                    disabled={hook.isPromoLoading || hook.isProcessing}
                    onPress={hook.handleCancelPromo}
                  >
                    {hook.isPromoLoading ? (
                      <ActivityIndicator
                        size="small"
                        color={Colors.darkError}
                      />
                    ) : (
                      <Text style={styles.removePromoActionLinkText}>
                        Remove
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* GIFT CARDS */}
            {hook.giftCards.filter((c) => c.appliedToOrder > 0 || (c.isUsable && c.balance > 0)).length > 0 && (
              <View style={styles.card}>
                <Text style={styles.sectionHeaderTitle}>Gift Cards</Text>
                {hook.giftCards
                  .filter((c) => c.appliedToOrder > 0 || (c.isUsable && c.balance > 0))
                  .map((card) => (
                    <View key={card.giftCardId} style={{ marginTop: 10 }}>
                      <Text style={styles.inputFeedbackInlineLabel}>
                        {card.maskedCode} · Rs. {card.balance.toLocaleString()} left
                      </Text>
                      {card.appliedToOrder > 0 ? (
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                          <Text style={[styles.inputFeedbackInlineLabel, styles.textSuccess]}>
                            Rs. {card.appliedToOrder.toLocaleString()} used
                          </Text>
                          <TouchableOpacity
                            onPress={() => hook.handleRemoveGiftCard(card)}
                            disabled={hook.isProcessing || hook.giftBusyId !== null}
                            accessibilityRole="button"
                          >
                            <Text style={styles.removePromoActionLinkText}>Remove</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View style={styles.promoFormInputRow}>
                          <TextInput
                            placeholder="Amount to use"
                            placeholderTextColor="#94A3B8"
                            keyboardType="decimal-pad"
                            style={styles.promoTextInputField}
                            value={hook.giftInputs[card.giftCardId] ?? ""}
                            onChangeText={(v) =>
                              hook.setGiftInputs((current: Record<number, string>) => ({ ...current, [card.giftCardId]: v }))
                            }
                            accessibilityLabel={`Amount to use from gift card ${card.maskedCode}`}
                          />
                          <TouchableOpacity
                            style={styles.pointsRedeemButton}
                            onPress={() => hook.handleUseGiftCard(card)}
                            disabled={hook.isProcessing || hook.giftBusyId !== null}
                          >
                            <Text style={styles.promoSubmitBtnText}>
                              {hook.giftBusyId === card.giftCardId ? "..." : "Use"}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  ))}
                {!!hook.giftNotification.type && (
                  <Text
                    style={[
                      styles.inputFeedbackInlineLabel,
                      hook.giftNotification.type === "error" ? styles.textError : styles.textSuccess,
                    ]}
                  >
                    {hook.giftNotification.text}
                  </Text>
                )}
              </View>
            )}

            {/* REWARD POINTS REDEMPTION MODULE */}
            {(hook.rewardPointsAllowed || hook.pointsApplied) && hook.pointRate > 0 && (
              <View style={styles.card}>
                <Text style={styles.sectionHeaderTitle}>
                  Redeem Store Loyalty Points
                </Text>
                <Text style={styles.inputFeedbackInlineLabel}>
                  You have {hook.pointsBalance} points
                  {hook.pointsBalance > 0
                    ? ` (worth Rs. ${hook.pointsBalance * hook.pointRate})`
                    : ""}
                  . Each point is worth Rs. {hook.pointRate}.
                </Text>
                <View style={styles.promoFormInputRow}>
                  <TextInput
                    placeholder="Points quantity to apply"
                    placeholderTextColor="#94A3B8"
                    keyboardType="number-pad"
                    style={[
                      styles.promoTextInputField,
                      hook.pointsNotification.type === "error" &&
                        styles.inputBorderError,
                      hook.pointsApplied && styles.inputBorderSuccess,
                    ]}
                    value={hook.pointsToRedeem}
                    onChangeText={hook.setPointsToRedeem}
                    editable={!hook.pointsApplied}
                  />
                  <TouchableOpacity
                    style={[
                      styles.pointsRedeemButton,
                      hook.pointsApplied && styles.bgSuccessBtn,
                    ]}
                    onPress={hook.handleApplyPoints}
                    disabled={
                      hook.pointsApplied ||
                      hook.isProcessing ||
                      hook.isPointsLoading
                    }
                  >
                    <Text style={styles.promoSubmitBtnText}>
                      {hook.pointsApplied ? "Applied" : "Redeem"}
                    </Text>
                  </TouchableOpacity>
                </View>
                {hook.pointsApplied && (
                  <TouchableOpacity
                    onPress={hook.handleRemovePoints}
                    disabled={hook.isProcessing || hook.isPointsLoading}
                    accessibilityRole="button"
                  >
                    <Text style={styles.removePromoActionLinkText}>
                      Remove points
                    </Text>
                  </TouchableOpacity>
                )}
                {hook.pointsNotification.type && (
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={[
                        styles.inputFeedbackInlineLabel,
                        hook.pointsNotification.type === "error"
                          ? styles.textError
                          : styles.textSuccess,
                      ]}
                    >
                      {hook.pointsNotification.text}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* SELECTABLE PAYMENT CHANNEL TRACKS */}
            <Text style={styles.mainTitleHeaderLabel}>
              Select Payment Method
            </Text>
            <View style={styles.gatewayDeckGroupContainer}>
              {hook.gateways?.map((gw) => {
                const isSelected = hook.selectedGatewayId === gw.PGId;
                return (
                  <TouchableOpacity
                    key={gw.PGId}
                    activeOpacity={0.85}
                    style={[
                      styles.gatewaySelectionCardRow,
                      isSelected && styles.selectedGatewayActiveBorderCard,
                    ]}
                    disabled={hook.isProcessing}
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
                        {gw.Name || "Online Gateway System"}
                      </Text>
                      <Text style={styles.gatewaySubtextSubheading}>
                        Secure instant payment authorization using tokenized
                        transfers.
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

              {/* CASH ON DELIVERY TRAY ALTERNATIVE */}
              {hook.isCODAvailable && (
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[
                    styles.gatewaySelectionCardRow,
                    hook.selectedGatewayId === 0 &&
                      styles.selectedGatewayActiveBorderCard,
                  ]}
                  disabled={hook.isProcessing}
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
                      Settle invoice balance utilizing hard cash assets on
                      doorstep arrival.
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

            {/* 💰 PRICING CALCULATION LEDGER BLOCK */}
            <View style={styles.card}>
              <Text style={styles.sectionHeaderTitle}>
                Final Settlement Summary
              </Text>

              {/* 1. Base Subtotal */}
              <View style={styles.pricingSummaryCalculationRowItem}>
                <Text style={styles.summaryItemTitleDescriptionLabel}>
                  Order Base Subtotal
                </Text>
                <Text style={styles.summaryItemNumericValueText}>
                  Rs. {hook.totals?.subtotal?.toLocaleString() || "0"}
                </Text>
              </View>

              {/* 2. Logistic Handling Fees */}
              <View style={styles.pricingSummaryCalculationRowItem}>
                <Text style={styles.summaryItemTitleDescriptionLabel}>
                  Logistic Handling Fees
                </Text>
                <Text style={styles.summaryItemNumericValueText}>
                  Rs. {hook.totals?.deliveryCharges?.toLocaleString() || "0"}
                </Text>
              </View>

              {/* 3. POS Charges (If applicable) */}
              {hook.totals?.posCharges > 0 && (
                <View style={styles.pricingSummaryCalculationRowItem}>
                  <Text style={styles.summaryItemTitleDescriptionLabel}>
                    POS Service Charges
                  </Text>
                  <Text style={styles.summaryItemNumericValueText}>
                    Rs. {hook.totals.posCharges.toLocaleString()}
                  </Text>
                </View>
              )}

              {/* ================= DEDUCTIONS & DISCOUNTS ================= */}

              {/* 4. General Sale Discount */}
              {hook.totals?.saleDiscount > 0 && (
                <View style={styles.pricingSummaryCalculationRowItem}>
                  <Text
                    style={[
                      styles.summaryItemTitleDescriptionLabel,
                      { color: "#10B981" },
                    ]}
                  >
                    General Sale Discount
                  </Text>
                  <Text
                    style={[
                      styles.summaryItemNumericValueText,
                      { color: "#10B981", fontWeight: "700" },
                    ]}
                  >
                    - Rs. {hook.totals.saleDiscount.toLocaleString()}
                  </Text>
                </View>
              )}

              {/* 5. Order Value Tier Discount */}
              {hook.totals?.orderValueDiscount > 0 && (
                <View style={styles.pricingSummaryCalculationRowItem}>
                  <Text
                    style={[
                      styles.summaryItemTitleDescriptionLabel,
                      { color: "#10B981" },
                    ]}
                  >
                    Order Value Discount
                  </Text>
                  <Text
                    style={[
                      styles.summaryItemNumericValueText,
                      { color: "#10B981", fontWeight: "700" },
                    ]}
                  >
                    - Rs. {hook.totals.orderValueDiscount.toLocaleString()}
                  </Text>
                </View>
              )}

              {/* 6. Payment Method Specific Promo Discount */}
              {hook.totals?.paymentMethodDiscount > 0 && (
                <View style={styles.pricingSummaryCalculationRowItem}>
                  <Text
                    style={[
                      styles.summaryItemTitleDescriptionLabel,
                      { color: "#10B981" },
                    ]}
                  >
                    Payment Method Incentive
                  </Text>
                  <Text
                    style={[
                      styles.summaryItemNumericValueText,
                      { color: "#10B981", fontWeight: "700" },
                    ]}
                  >
                    - Rs. {hook.totals.paymentMethodDiscount.toLocaleString()}
                  </Text>
                </View>
              )}

              {/* 7. Promo/Coupon Code Deductions (Fixed from hook.totals.promoDiscount) */}
              {hook.totals?.promoDiscount > 0 && (
                <View style={styles.pricingSummaryCalculationRowItem}>
                  <Text
                    style={[
                      styles.summaryItemTitleDescriptionLabel,
                      { color: "#10B981" },
                    ]}
                  >
                    Promo Code ({hook.appliedPromo?.code || "Coupon"}) Savings
                  </Text>
                  <Text
                    style={[
                      styles.summaryItemNumericValueText,
                      { color: "#10B981", fontWeight: "700" },
                    ]}
                  >
                    - Rs. {hook.totals.promoDiscount.toLocaleString()}
                  </Text>
                </View>
              )}

              {/* 8. Reward/Loyalty Points Deductions */}
              {hook.totals?.pointsDiscount > 0 && (
                <View style={styles.pricingSummaryCalculationRowItem}>
                  <Text
                    style={[
                      styles.summaryItemTitleDescriptionLabel,
                      { color: "#10B981" },
                    ]}
                  >
                    Loyalty Points Redemption
                  </Text>
                  <Text
                    style={[
                      styles.summaryItemNumericValueText,
                      { color: "#10B981", fontWeight: "700" },
                    ]}
                  >
                    - Rs. {hook.totals.pointsDiscount.toLocaleString()}
                  </Text>
                </View>
              )}

              {hook.giftCards.reduce((sum: number, c: { appliedToOrder: number }) => sum + (c.appliedToOrder || 0), 0) > 0 && (
                <View style={styles.pricingSummaryCalculationRowItem}>
                  <Text style={[styles.summaryItemTitleDescriptionLabel, { color: "#10B981" }]}>Gift Card</Text>
                  <Text style={[styles.summaryItemNumericValueText, { color: "#10B981", fontWeight: "700" }]}>
                    - Rs. {hook.giftCards.reduce((sum: number, c: { appliedToOrder: number }) => sum + (c.appliedToOrder || 0), 0).toLocaleString()}
                  </Text>
                </View>
              )}

              {/* ================= FINAL BREAKLINE & TOTAL ================= */}
              <View style={styles.decorativeDividingBreakline} />

              <View style={styles.pricingSummaryCalculationRowItem}>
                <Text style={styles.masterInvoiceGrandTotalLabel}>
                  Net Outstanding Balance
                </Text>
                <Text style={styles.masterInvoiceGrandTotalValueText}>
                  Rs. {hook.totals?.grandTotal?.toLocaleString() || "0"}
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* FIXED BOTTOM ACTION PANEL - DISMISSED WHEN KEYBOARD SHOWS */}
          {!hook.isKeyboardVisible && (
            <View style={styles.fixedBottomControlDock}>
              <View style={styles.dockActionRowWrapper}>
                <TouchableOpacity
                  style={[
                    styles.cancelActionFlexButton,
                    hook.isCanceling && { opacity: 0.5 },
                  ]}
                  disabled={
                    hook.isProcessing ||
                    hook.isCanceling ||
                    hook.isPromoLoading ||
                    hook.isPointsLoading
                  }
                  onPress={() =>
                    hook.triggerCancelConfirmation(orderId?.toString())
                  }
                >
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                  <Text style={styles.cancelActionFlexButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.primarySubmitFlexButton,
                    (hook.isProcessing || hook.selectedGatewayId === null) &&
                      styles.disabledPrimaryButton,
                  ]}
                  onPress={hook.handleProcessPayment}
                  disabled={
                    hook.isProcessing ||
                    hook.isCanceling ||
                    hook.selectedGatewayId === null
                  }
                >
                  {hook.isProcessing ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <>
                      <Text style={styles.primarySubmitFlexButtonText}>
                        Confirm & Pay
                      </Text>
                      <Ionicons
                        name="shield-checkmark"
                        size={18}
                        color="#FFF"
                      />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8FAFC" },
  centerGateContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  gateProgressText: {
    marginTop: 14,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.accent,
  },
  iconCircleSuccess: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  gateTitleText: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.primary,
    textAlign: "center",
  },
  gateBodyDescription: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
    marginBottom: 24,
  },
  returnFeedButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  returnFeedButtonText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 14,
  },
  retryBtn: {
    borderColor: "#E2E8F0",
    backgroundColor: Colors.darkError,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 12,
  },
  retryBtnText: {
    color: Colors.white,
    fontWeight: "600",
  },
  mainLayoutWrapper: { flex: 1, justifyContent: "space-between" },
  scrollContainer: { flex: 1 },
  scrollContentLayout: { padding: 16, paddingBottom: 110 },
  centerWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingText: {
    marginTop: 14,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.accent,
  },
  orderSummaryCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderLeftWidth: 5,
    borderLeftColor: "#E11D48",
  },
  summaryHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBadge: {
    backgroundColor: "#FFF1F2",
    padding: 10,
    borderRadius: 14,
  },
  summarySubLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500",
  },
  summaryMainLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginTop: 2,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.02,
        shadowRadius: 8,
      },
      android: { elevation: 1.5 },
    }),
  },
  sectionHeaderTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    marginBottom: 14,
    textTransform: "uppercase",
    letterSpacing: 0.75,
  },
  productRowItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  productThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
  },
  productThumbnailPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  productMetaInfoColumn: {
    flex: 1,
    marginLeft: 12,
  },
  productNameLabelText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
  },
  productVariantSubtext: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 1,
  },
  productQuantityCounterText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#94A3B8",
    marginTop: 2,
  },
  productCalculatedLinePriceText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
  },
  emptyProductsFallbackText: {
    fontSize: 13,
    color: "#94A3B8",
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 8,
  },
  mainTitleHeaderLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 8,
    marginBottom: 14,
    letterSpacing: -0.2,
  },
  promoFormInputRow: { flexDirection: "row", gap: 10 },
  promoTextInputField: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#1E293B",
    fontWeight: "600",
  },
  inputBorderError: { borderColor: "#EF4444", backgroundColor: "#FEF2F2" },
  inputBorderSuccess: { borderColor: "#10B981", backgroundColor: "#F0FDF4" },
  promoSubmitBtn: {
    backgroundColor: "#0F172A",
    borderRadius: 12,
    paddingHorizontal: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  pointsRedeemButton: {
    backgroundColor: "#475569",
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  bgSuccessBtn: { backgroundColor: "#10B981" },
  promoSubmitBtnText: { color: "#FFF", fontWeight: "700", fontSize: 14 },
  inputFeedbackInlineLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 8,
    marginLeft: 2,
  },
  activePromoBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#DCFCE7",
    padding: 14,
    borderRadius: 12,
  },
  badgePrimaryText: { fontSize: 14, fontWeight: "700", color: "#16A34A" },
  badgeSecondaryText: {
    fontSize: 12,
    color: "#15803D",
    marginTop: 2,
    lineHeight: 16,
  },
  removePromoButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
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
  gatewaySubtextSubheading: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 3,
    lineHeight: 16,
  },
  pricingSummaryCalculationRowItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
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
  fixedBottomControlDock: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 24 : 14,
    borderTopWidth: 1,
    borderColor: "#E2E8F0",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
      },
      android: { elevation: 8 },
    }),
  },
  dockActionRowWrapper: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  cancelActionFlexButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FEE2E2",
    borderRadius: 14,
    paddingVertical: 15,
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  cancelActionFlexButtonText: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "700",
  },
  primarySubmitFlexButton: {
    flex: 2,
    flexDirection: "row",
    backgroundColor: "#E11D48",
    borderRadius: 14,
    paddingVertical: 15,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  disabledPrimaryButton: {
    backgroundColor: "#CBD5E1",
  },
  primarySubmitFlexButtonText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "700",
  },
  globalBannerAlert: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 14,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  globalBannerText: {
    flex: 1,
    textAlign: "center",
    fontWeight: "600",
    fontSize: 13,
    lineHeight: 18,
    paddingHorizontal: 5,
  },
  bgError: { backgroundColor: "#FEF2F2", borderColor: "#FEE2E2" },
  bgSuccess: { backgroundColor: "#F0FDF4", borderColor: "#DCFCE7" },
  textError: { color: "#EF4444" },
  textSuccess: { color: "#16A34A" },
});
