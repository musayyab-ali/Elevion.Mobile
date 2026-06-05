import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  BackHandler,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { paymentApi } from "../services/paymentApi";

export const OrderConfirmationScreen = () => {
  const router = useRouter();
  const { orderId, invoiceId, isCod } = useLocalSearchParams();

  const [verifying, setVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    "Verifying payment transaction matrix...",
  );

  useEffect(() => {
    const backSubscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        return true; // Strictly lock the screen layout during authorization loops
      },
    );

    if (isCod === "true") {
      setVerifying(false);
      setIsSuccess(true);
      setStatusMessage("Order processed successfully under COD terms.");
    } else if (orderId) {
      runPaymentVerificationLoop();
    } else {
      setVerifying(false);
      setIsSuccess(false);
      setStatusMessage(
        "Missing transaction sequence token manifest indicators.",
      );
    }

    return () => backSubscription.remove();
  }, [invoiceId, isCod, orderId]);

  const runPaymentVerificationLoop = async () => {
    try {
      let verifiedOnServer = false;

      // 🌟 Step 1: Direct Validation Check via Invoice Tracking ID Tokens
      if (invoiceId) {
        try {
          const res = await paymentApi.verifyPayment(String(invoiceId));
          if (res?.StatusCode === 200 && res?.Data?.IsPaymentVerify === true) {
            verifiedOnServer = true;
            setStatusMessage(
              res.Message || "Payment transaction authorized successfully!",
            );
          } else {
            const logRes = await paymentApi.verifyLogPayment(String(invoiceId));
            if (
              logRes?.StatusCode === 200 &&
              logRes?.Data?.IsPaymentVerify === true
            ) {
              verifiedOnServer = true;
              setStatusMessage(
                logRes.Message || "Payment verified via logging sequences.",
              );
            }
          }
        } catch (innerErr) {
          console.log(
            "Invoice endpoints skipped or returned errors, trying global fallback status check...",
          );
        }
      }

      // 🌟 Step 2: Parametric Fallback Validation Checking
      if (!verifiedOnServer && orderId) {
        console.log(
          "🔍 Running Safe Parameter Checks against Order ID:",
          orderId,
        );
        const statusRes = await paymentApi.checkOrderPaymentStatus(
          Number(orderId),
        );

        if (
          statusRes?.HttpStatusCode === 200 &&
          statusRes?.Data?.IsProceedPayment === true
        ) {
          verifiedOnServer = false;
          setStatusMessage(
            "Transaction incomplete. The browser window was closed before authorization finished.",
          );
        } else if (
          statusRes?.Type === "Success" ||
          statusRes?.HttpStatusCode === 100 ||
          statusRes?.HttpStatusCode === 200
        ) {
          verifiedOnServer = true;
          setStatusMessage(
            statusRes.Message || "Order ledger validated successfully.",
          );
        } else {
          verifiedOnServer = false;
          setStatusMessage(
            statusRes?.Message || "Payment loop returned unverified states.",
          );
        }
      }

      setIsSuccess(verifiedOnServer);
    } catch (err: any) {
      console.error("🚨 Verification Loop Crash Intercept:", err);
      setIsSuccess(false);
      setStatusMessage(
        err?.response?.data?.Message ||
          "Unable to confirm payment state parameters.",
      );
    } finally {
      setVerifying(false);
    }
  };

  return (
    <SafeAreaView style={styles.masterContainer}>
      <View style={styles.contentCardWrapper}>
        {verifying ? (
          <View style={styles.stateCenterColumn}>
            <ActivityIndicator size="large" color="#E11D48" />
            <Text style={styles.interactiveLoadingTitle}>
              Securing Order Tokens
            </Text>
            <Text style={styles.subtextCaptionDesc}>{statusMessage}</Text>
          </View>
        ) : isSuccess ? (
          <View style={styles.stateCenterColumn}>
            <View
              style={[
                styles.statusIconRingWrapper,
                { backgroundColor: "#ECFDF5" },
              ]}
            >
              <Ionicons name="checkmark-sharp" size={44} color="#10B981" />
            </View>
            <Text style={styles.masterStatusTitleLabel}>Order Confirmed!</Text>
            <Text style={styles.orderIdMetricDisplayLabel}>
              Reference Base ID: #{orderId}
            </Text>
            <Text style={styles.subtextCaptionDesc}>
              Your purchase ledger payload has compiled smoothly. Warehouses are
              now assembling your packaging manifests.
            </Text>
          </View>
        ) : (
          <View style={styles.stateCenterColumn}>
            <View
              style={[
                styles.statusIconRingWrapper,
                { backgroundColor: "#FEF2F2" },
              ]}
            >
              <Ionicons name="alert-circle-outline" size={44} color="#EF4444" />
            </View>
            <Text style={[styles.masterStatusTitleLabel, { color: "#EF4444" }]}>
              Payment Unverified
            </Text>
            <Text style={styles.orderIdMetricDisplayLabel}>
              Reference Base ID: #{orderId}
            </Text>
            <Text style={styles.subtextCaptionDesc}>{statusMessage}</Text>
          </View>
        )}

        {/* FOOTER ACTION ROUTING PANELS */}
        {!verifying && (
          <View style={styles.actionsFooterStackArea}>
            <TouchableOpacity
              style={[
                styles.primaryActionBtn,
                !isSuccess && { backgroundColor: "#475569" },
              ]}
              onPress={() => {
                if (isSuccess) {
                  // Direct clean route reset back to core dashboard elements smoothly
                  router.replace("/(tabs)/index");
                } else {
                  // ✅ FIXED: Explicitly redirects users safely back to the checkout/cart stack panel path without POP_TO_TOP tracking exceptions
                  router.replace("/(tabs)/cart/checkout-summary");
                }
              }}
            >
              <Text style={styles.primaryActionBtnTextLabel}>
                {isSuccess ? "Continue Shopping" : "Return to Cart"}
              </Text>
              <Ionicons name="arrow-forward-sharp" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  masterContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
  },
  contentCardWrapper: {
    width: "90%",
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 3,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
  },
  stateCenterColumn: { alignItems: "center", paddingVertical: 16 },
  statusIconRingWrapper: {
    width: 84,
    height: 84,
    borderRadius: 42,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  interactiveLoadingTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1E293B",
    marginTop: 16,
  },
  masterStatusTitleLabel: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0F172A",
    textAlign: "center",
  },
  orderIdMetricDisplayLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#E11D48",
    backgroundColor: "#FFF1F2",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    overflow: "hidden",
  },
  subtextCaptionDesc: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginTop: 12,
    paddingHorizontal: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
  actionsFooterStackArea: { marginTop: 24, width: "100%" },
  primaryActionBtn: {
    backgroundColor: "#E11D48",
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  primaryActionBtnTextLabel: { color: "#FFF", fontSize: 14, fontWeight: "700" },
});
