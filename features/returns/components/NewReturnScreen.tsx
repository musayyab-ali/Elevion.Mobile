import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/Theme";
import { apiErrorMessage } from "../../../utils/apiError";
import { RESOLUTIONS, returnsApi, type ReturnableOrder } from "../services/returnsApi";
import { checkReturnForm, clampQuantity, estimateRefund, selectedItems } from "../utils/returnForm";

const money = (value: number) => `Rs. ${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

export const NewReturnScreen = () => {
  const router = useRouter();
  const { orderId: orderIdParam } = useLocalSearchParams<{ orderId?: string }>();
  const orderId = Number(orderIdParam);

  const [order, setOrder] = useState<ReturnableOrder | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [picked, setPicked] = useState<Record<number, number>>({});
  const [reasonCode, setReasonCode] = useState(0);
  const [resolution, setResolution] = useState(1);
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setLoadError("Open this screen from one of your delivered orders.");
      return;
    }
    returnsApi
      .getReturnableOrder(orderId)
      .then(setOrder)
      .catch((e) => setLoadError(e?.response?.status === 404 ? "This order was not found, or returns are not available yet." : apiErrorMessage(e, "Could not load this order.")));
  }, [orderId]);

  const submit = async () => {
    if (!order) return;
    const check = checkReturnForm(order.items, picked, reasonCode, comments);
    if (!check.ok) {
      Alert.alert("Check your request", check.message);
      return;
    }

    setSubmitting(true);
    try {
      const created = await returnsApi.createReturn({ orderId, reasonCode, resolution, comments, items: selectedItems(order.items, picked) });
      Alert.alert("Return requested", `Your reference is ${created.reference}.`, [{ text: "OK", onPress: () => router.replace("/(refNull)/returns") }]);
    } catch (e) {
      Alert.alert("Could not request this return", apiErrorMessage(e, "Please try again."));
    } finally {
      setSubmitting(false);
    }
  };

  if (loadError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{loadError}</Text>
      </View>
    );
  }
  if (!order) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }
  if (!order.canReturn) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>This order cannot be returned</Text>
        <Text style={styles.meta}>{order.reason}</Text>
      </View>
    );
  }

  const anyLeft = order.items.some((i) => i.returnable > 0);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Return items from order {order.orderNumber}</Text>
      {!!order.returnByDate && (
        <Text style={styles.meta}>
          You can return items until {new Date(order.returnByDate).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}.
        </Text>
      )}

      <Text style={styles.section}>Which items?</Text>
      {!anyLeft && <Text style={styles.meta}>Everything in this order has already been returned or is in another return.</Text>}
      {order.items.map((item) => {
        const qty = picked[item.orderProductId] ?? 0;
        return (
          <View key={item.orderProductId} style={styles.itemRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName} numberOfLines={2}>{item.productName ?? "Item"}</Text>
              <Text style={styles.meta}>
                {money(item.unitAmount)} each · ordered {item.ordered}
                {item.alreadyRequested > 0 ? ` · ${item.alreadyRequested} already in a return` : ""}
              </Text>
            </View>
            {item.returnable > 0 ? (
              <View style={styles.stepper}>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => setPicked((p) => ({ ...p, [item.orderProductId]: clampQuantity(qty - 1, item.returnable) }))}
                  accessibilityLabel="Return one less"
                >
                  <Ionicons name="remove" size={16} color={Colors.textMain} />
                </TouchableOpacity>
                <Text style={styles.stepValue}>{qty}</Text>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => setPicked((p) => ({ ...p, [item.orderProductId]: clampQuantity(qty + 1, item.returnable) }))}
                  accessibilityLabel="Return one more"
                >
                  <Ionicons name="add" size={16} color={Colors.textMain} />
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.meta}>Not returnable</Text>
            )}
          </View>
        );
      })}

      <Text style={styles.section}>Why are you returning it?</Text>
      <View style={styles.chips}>
        {order.reasons.map((r) => (
          <TouchableOpacity key={r.code} style={[styles.chip, reasonCode === r.code && styles.chipActive]} onPress={() => setReasonCode(r.code)} accessibilityRole="button" accessibilityState={{ selected: reasonCode === r.code }}>
            <Text style={[styles.chipText, reasonCode === r.code && styles.chipTextActive]}>{r.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.section}>What would you like?</Text>
      {RESOLUTIONS.map((r) => (
        <TouchableOpacity key={r.value} style={styles.radioRow} onPress={() => setResolution(r.value)} accessibilityRole="radio" accessibilityState={{ selected: resolution === r.value }}>
          <Ionicons name={resolution === r.value ? "radio-button-on" : "radio-button-off"} size={20} color={Colors.accent} />
          <Text style={styles.radioText}>
            <Text style={{ fontWeight: "700" }}>{r.label}</Text> · {r.hint}
          </Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.section}>Anything we should know? (optional)</Text>
      <TextInput style={styles.input} multiline maxLength={1000} value={comments} onChangeText={setComments} placeholder="For example: the zip is broken" placeholderTextColor={Colors.tertiary} />

      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          {resolution === 2 ? "A replacement will be sent." : `Value of the items: ${money(estimateRefund(order.items, picked))}`}
        </Text>
        <Text style={styles.meta}>The shop confirms the final amount after it receives the items.</Text>
      </View>

      <TouchableOpacity style={[styles.submit, (submitting || !anyLeft) && styles.submitDisabled]} onPress={submit} disabled={submitting || !anyLeft} accessibilityRole="button">
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Request return</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { padding: 16, paddingBottom: 48, gap: 8 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 8 },
  title: { fontSize: 18, fontWeight: "800", color: Colors.textMain },
  meta: { fontSize: 12.5, color: Colors.tertiary, lineHeight: 18 },
  errorText: { color: Colors.error, textAlign: "center" },
  section: { fontSize: 14, fontWeight: "800", color: Colors.textMain, marginTop: 14 },
  itemRow: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: Colors.white, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: "#E2E8F0" },
  itemName: { fontSize: 14, fontWeight: "700", color: Colors.textMain },
  stepper: { flexDirection: "row", alignItems: "center", gap: 10 },
  stepBtn: { width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: "#CBD5E1", alignItems: "center", justifyContent: "center" },
  stepValue: { minWidth: 20, textAlign: "center", fontWeight: "800", color: Colors.textMain },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: "#E2E8F0", backgroundColor: Colors.white },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 12.5, fontWeight: "600", color: Colors.textMain },
  chipTextActive: { color: "#fff" },
  radioRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 },
  radioText: { flex: 1, fontSize: 13.5, color: Colors.textMain },
  input: { minHeight: 90, backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0", padding: 12, textAlignVertical: "top", color: Colors.textMain },
  summary: { backgroundColor: "#F1F5F9", borderRadius: 12, padding: 14, marginTop: 14, gap: 4 },
  summaryText: { fontSize: 14, fontWeight: "700", color: Colors.textMain },
  submit: { marginTop: 14, backgroundColor: Colors.primary, borderRadius: 14, height: 50, alignItems: "center", justifyContent: "center" },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: "#fff", fontWeight: "800", fontSize: 15 },
});
