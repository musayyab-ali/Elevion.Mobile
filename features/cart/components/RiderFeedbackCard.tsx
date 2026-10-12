import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ActivityIndicator } from "react-native";
import { orderApi } from "../services/orderApi";
import { hasRiderFeedback, parseTip, RiderFeedbackState, STAR_WORDS, tipChoices, validStars } from "../utils/riderFeedback";

/**
 * "Rate your rider" after the delivery, and "Add a cash tip" while a cash-on-delivery order is out for delivery.
 * Shown only when the shop allows it (the server decides what the customer may still do).
 */
export function RiderFeedbackCard({ orderId, initial }: { orderId: number | string; initial: RiderFeedbackState | null | undefined }) {
  const [state, setState] = useState<RiderFeedbackState | null | undefined>(initial);
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const [custom, setCustom] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  if (!state || !hasRiderFeedback(state)) return null;
  const who = state.RiderName || "your rider";

  const problem = (e: any, fallback: string) => e?.response?.data?.message || e?.response?.data?.Message || fallback;

  const submitRating = async () => {
    if (!validStars(stars)) {
      setMessage({ ok: false, text: "Choose 1 to 5 stars." });
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      await orderApi.rateRider(Number(orderId), stars, comment.trim());
      setState((s) => (s ? { ...s, CanRate: false, Stars: stars } : s));
      setMessage({ ok: true, text: "Thank you for your feedback!" });
    } catch (e) {
      setMessage({ ok: false, text: problem(e, "Could not save your rating.") });
    } finally {
      setBusy(false);
    }
  };

  const submitTip = async (amount: number) => {
    setBusy(true);
    setMessage(null);
    try {
      await orderApi.setRiderTip(Number(orderId), amount);
      setState((s) => (s ? { ...s, TipAmount: amount } : s));
      setMessage({ ok: true, text: amount > 0 ? `Tip of PKR ${amount} saved. Hand it to the rider with your payment.` : "Tip removed." });
    } catch (e) {
      setMessage({ ok: false, text: problem(e, "Could not save your tip.") });
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.box} accessibilityLabel="Rider feedback">
      {state.CanRate && (
        <View>
          <Text style={styles.title}>How was your delivery?</Text>
          <Text style={styles.hint}>Rate {who}. It helps us look after our riders and customers.</Text>
          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map((n) => (
              <TouchableOpacity key={n} onPress={() => setStars(n)} accessibilityRole="radio" accessibilityState={{ selected: stars === n }} accessibilityLabel={`${n} star${n > 1 ? "s" : ""}`} hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}>
                <Text style={[styles.star, { color: n <= stars ? "#F59E0B" : "#CBD5E1" }]}>★</Text>
              </TouchableOpacity>
            ))}
            <Text style={styles.starWord}>{STAR_WORDS[stars]}</Text>
          </View>
          <TextInput
            style={styles.input}
            value={comment}
            onChangeText={setComment}
            maxLength={300}
            multiline
            placeholder="Anything to add? (optional)"
            placeholderTextColor="#94A3B8"
          />
          <TouchableOpacity style={[styles.primary, (busy || stars === 0) && { opacity: 0.5 }]} disabled={busy || stars === 0} onPress={submitRating}>
            {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Submit rating</Text>}
          </TouchableOpacity>
        </View>
      )}

      {!state.CanRate && !!state.Stars && (
        <Text style={styles.line}>
          You rated {who}: <Text style={{ color: "#F59E0B", fontWeight: "800" }}>{"★".repeat(state.Stars)}</Text>
          <Text style={{ color: "#CBD5E1" }}>{"★".repeat(5 - state.Stars)}</Text>
        </Text>
      )}

      {state.CanTip && (
        <View style={{ marginTop: state.CanRate ? 16 : 0 }}>
          <Text style={styles.title}>Add a tip for {who}</Text>
          <Text style={styles.hint}>A cash tip: you hand it over with your payment at the door. Current tip: PKR {state.TipAmount}.</Text>
          <View style={styles.chips}>
            {tipChoices(state.MaxTip).map((amount) => (
              <TouchableOpacity key={amount} disabled={busy} onPress={() => submitTip(amount)} style={[styles.chip, state.TipAmount === amount && styles.chipOn]} accessibilityState={{ selected: state.TipAmount === amount }}>
                <Text style={[styles.chipText, state.TipAmount === amount && { color: "#fff" }]}>{amount === 0 ? "No tip" : `PKR ${amount}`}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.customRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginTop: 0 }]}
              value={custom}
              onChangeText={(v) => setCustom(v.replace(/\D/g, ""))}
              keyboardType="number-pad"
              placeholder={`Other amount (max ${state.MaxTip})`}
              placeholderTextColor="#94A3B8"
              accessibilityLabel="Other tip amount"
            />
            <TouchableOpacity
              style={[styles.set, (busy || parseTip(custom, state.MaxTip) === null) && { opacity: 0.5 }]}
              disabled={busy || parseTip(custom, state.MaxTip) === null}
              onPress={() => {
                const v = parseTip(custom, state.MaxTip);
                if (v !== null) submitTip(v);
              }}
            >
              <Text style={styles.setText}>Set</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {!state.CanTip && state.TipAmount > 0 && <Text style={[styles.line, { marginTop: state.Stars ? 8 : 0 }]}>Your tip of PKR {state.TipAmount} goes to {who}.</Text>}

      {!!message && <Text style={[styles.message, { color: message.ok ? "#047857" : "#B91C1C" }]}>{message.text}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { backgroundColor: "#F8FAFC", borderColor: "#E5E7EB", borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 12 },
  title: { fontSize: 15, fontWeight: "800", color: "#111827" },
  hint: { fontSize: 12.5, color: "#6B7280", marginTop: 2 },
  starRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 10 },
  star: { fontSize: 32, lineHeight: 38 },
  starWord: { marginLeft: 6, color: "#6B7280", fontSize: 12.5 },
  input: { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 10, padding: 10, marginTop: 10, backgroundColor: "#fff", color: "#111827" },
  primary: { backgroundColor: "#111827", borderRadius: 10, paddingVertical: 12, alignItems: "center", marginTop: 10 },
  primaryText: { color: "#fff", fontWeight: "800" },
  line: { fontSize: 13, color: "#111827" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: "#CBD5E1", backgroundColor: "#fff" },
  chipOn: { backgroundColor: "#111827", borderColor: "#111827" },
  chipText: { fontWeight: "700", color: "#111827" },
  customRow: { flexDirection: "row", gap: 8, alignItems: "center", marginTop: 10 },
  set: { backgroundColor: "#111827", borderRadius: 10, paddingVertical: 11, paddingHorizontal: 16 },
  setText: { color: "#fff", fontWeight: "800" },
  message: { marginTop: 10, fontSize: 12.5, fontWeight: "600" },
});
