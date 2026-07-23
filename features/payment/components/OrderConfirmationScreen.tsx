import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  BackHandler,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { paymentApi } from "../services/paymentApi";

export const OrderConfirmationScreen = () => {
  const router = useRouter();
  const { orderId, invoiceId, isCod } = useLocalSearchParams();

  const [verificationState, setVerificationState] = useState<
    "processing" | "success" | "unverified"
  >("processing");
  const [statusMessage, setStatusMessage] = useState(
    "Connecting to secure payment network...",
  );
  const [retryCount, setRetryCount] = useState(0);

  const pollingAttemptRef = useRef(0);

  useEffect(() => {
    const backSubscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => true,
    );

    const initializeVerificationFlow = async () => {
      pollingAttemptRef.current = 0;

      // 🌟 Case 1: Cash On Delivery (Instant Success)
      if (isCod === "true") {
        setVerificationState("success");
        setStatusMessage(
          "Your order has been safely recorded under Cash On Delivery conditions.",
        );
      }
      // 🌟 Case 2: Online Payment Verification Flow
      else if (orderId) {
        runPaymentVerificationSequence();
      } else {
        setVerificationState("unverified");
        setStatusMessage(
          "Missing structural parameters to initiate server-side transaction tracking.",
        );
      }
    };

    initializeVerificationFlow();

    return () => backSubscription.remove();
  }, [invoiceId, isCod, orderId, retryCount]);

  const runPaymentVerificationSequence = async () => {
    setVerificationState("processing");

    const maxAttempts = 5;
    const delayMs = 3000;

    const executeCheck = async (): Promise<boolean> => {
      pollingAttemptRef.current += 1;
      setStatusMessage(
        `Verifying transaction ledger (Attempt ${pollingAttemptRef.current}/${maxAttempts})...`,
      );

      try {
        // 🛠️ STEP 1: Verify Core payment route using base Order Tracking ID
        const targetId = invoiceId || orderId;
        const verifyRes = await paymentApi.verifyPayment(Number(targetId));

        if (
          verifyRes?.StatusCode === 200 &&
          verifyRes?.Data?.IsPaymentVerify === true
        ) {
          // 🛠️ STEP 2: Deep check status structure via multipart requirement
          const formData = new FormData();
          formData.append("files", "");

          const statusRes = await paymentApi.checkOrderPaymentStatus(
            Number(orderId),
            formData,
          );
          const isSuccessStatus =
            statusRes?.HttpStatusCode === 200 ||
            statusRes?.StatusCode === 200 ||
            statusRes?.Type === "Success";

          // 🛠️ SUCCESS EVALUATION (confirmOrder call removed completely)
          if (isSuccessStatus && statusRes?.Data?.IsProceedPayment !== true) {
            setStatusMessage(
              "Order processing pipeline completed beautifully!",
            );
            return true;
          }
        }
      } catch (err: any) {
        console.log(
          `⚠️ Step Loop Execution Exception on index ${pollingAttemptRef.current}:`,
          err?.response?.data || err.message,
        );
      }
      return false;
    };

    // --- Core Polling Verification Engine Thread Controller ---
    let verified = false;
    for (let i = 0; i < maxAttempts; i++) {
      verified = await executeCheck();
      if (verified) break;

      if (i < maxAttempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }

    if (verified) {
      setVerificationState("success");
    } else {
      setVerificationState("unverified");
      setStatusMessage(
        "Stripe payment notification is taking slightly longer than expected. If your checkout window cleared, press verify again to re-sync records.",
      );
    }
  };

  return (
    <View style={styles.masterContainer}>
      <View style={styles.contentCardWrapper}>
        {/* State A: Processing / Automatic Polling */}
        {verificationState === "processing" && (
          <View style={styles.stateCenterColumn}>
            <ActivityIndicator size="large" color="#E11D48" />
            <Text style={styles.interactiveLoadingTitle}>
              Securing Order Status
            </Text>
            <Text style={styles.subtextCaptionDesc}>{statusMessage}</Text>
          </View>
        )}

        {/* State B: Confirmed Success View */}
        {verificationState === "success" && (
          <View style={styles.stateCenterColumn}>
            <View
              style={[
                styles.statusIconRingWrapper,
                { backgroundColor: "#ECFDF5" },
              ]}
            >
              <Ionicons name="checkmark-sharp" size={42} color="#10B981" />
            </View>
            <Text style={styles.masterStatusTitleLabel}>Order Confirmed!</Text>
            <Text style={styles.orderIdMetricDisplayLabel}>
              Reference Base ID: #{orderId}
            </Text>
            <Text style={styles.subtextCaptionDesc}>
              {statusMessage ||
                "Your transaction has been securely settled. Our systems are now preparing your delivery manifests."}
            </Text>

            <View style={styles.actionsFooterStackArea}>
              <TouchableOpacity
                style={styles.primaryActionBtn}
                onPress={() => router.replace("/(tabs)")}
              >
                <Text style={styles.primaryActionBtnTextLabel}>
                  Continue Shopping
                </Text>
                <Ionicons name="arrow-forward-sharp" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* State C: Unverified Failure / Delay View */}
        {verificationState === "unverified" && (
          <View style={styles.stateCenterColumn}>
            <View
              style={[
                styles.statusIconRingWrapper,
                { backgroundColor: "#FFF7ED" },
              ]}
            >
              <Ionicons name="time-outline" size={42} color="#F97316" />
            </View>
            <Text style={[styles.masterStatusTitleLabel, { color: "#F97316" }]}>
              Payment Verification Delayed
            </Text>
            <Text style={styles.orderIdMetricDisplayLabel}>
              Reference Base ID: #{orderId}
            </Text>
            <Text style={styles.subtextCaptionDesc}>{statusMessage}</Text>

            <View style={styles.actionsFooterStackArea}>
              <TouchableOpacity
                style={styles.verifyRetryBtn}
                onPress={() => setRetryCount((prev) => prev + 1)}
              >
                <Ionicons name="refresh-outline" size={18} color="#FFF" />
                <Text style={styles.verifyRetryBtnText}>
                  I Have Paid — Verify Again
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.changeMethodBtn}
                onPress={() => {
                  router.replace({
                    pathname: "/(cart)/payment-methods",
                    params: { orderId: String(orderId) },
                  });
                }}
              >
                <Text style={styles.changeMethodBtnText}>
                  Change Payment Method / Retry
                </Text>
                <Ionicons name="card-outline" size={16} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
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
  stateCenterColumn: {
    alignItems: "center",
    paddingVertical: 8,
    width: "100%",
  },
  statusIconRingWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  interactiveLoadingTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1E293B",
    marginTop: 16,
  },
  masterStatusTitleLabel: {
    fontSize: 20,
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
    paddingHorizontal: 8,
    lineHeight: 20,
    fontWeight: "500",
  },
  actionsFooterStackArea: { marginTop: 24, width: "100%", gap: 12 },
  primaryActionBtn: {
    backgroundColor: "#E11D48",
    borderRadius: 16,
    paddingVertical: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    width: "100%",
  },
  primaryActionBtnTextLabel: { color: "#FFF", fontSize: 14, fontWeight: "700" },
  verifyRetryBtn: {
    backgroundColor: "#10B981",
    borderRadius: 16,
    paddingVertical: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    width: "100%",
  },
  verifyRetryBtnText: { color: "#FFF", fontSize: 14, fontWeight: "700" },
  changeMethodBtn: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 16,
    paddingVertical: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    width: "100%",
  },
  changeMethodBtnText: { color: "#64748B", fontSize: 14, fontWeight: "700" },
});
