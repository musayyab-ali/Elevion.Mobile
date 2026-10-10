import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../../constants/Theme";
import { apiErrorMessage } from "../../../utils/apiError";
import { giftCardsApi, type GiftCard } from "../services/giftCardsApi";
import { formatCodeInput, looksLikeCompleteCode } from "../utils/giftCardForm";

const money = (value: number) => `Rs. ${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

const formatDate = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(/Z|[+-]\d\d:?\d\d$/.test(iso) ? iso : `${iso}Z`);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
};

const CardView = ({ card }: { card: GiftCard }) => {
  const [open, setOpen] = useState(false);
  const active = card.statusName === "Active" && card.balance > 0;
  return (
    <View style={[styles.card, !card.isUsable && { opacity: 0.7 }]}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.code}>{card.maskedCode}</Text>
          <Text style={styles.balance}>{money(card.balance)}</Text>
          <Text style={styles.meta}>
            of {money(card.initialAmount)}
            {card.expiresOn ? ` · valid until ${formatDate(card.expiresOn)}` : " · no expiry"}
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: active ? "#DCFCE7" : "#F1F5F9" }]}>
          <Text style={[styles.badgeText, { color: active ? "#15803D" : "#64748B" }]}>
            {card.balance <= 0 && card.statusName === "Active" ? "Used up" : card.statusName}
          </Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => setOpen((v) => !v)} accessibilityRole="button" accessibilityState={{ expanded: open }}>
        <Text style={styles.link}>{open ? "Hide history" : "Show history"}</Text>
      </TouchableOpacity>
      {open &&
        card.transactions.map((t, i) => (
          <View key={i} style={styles.txRow}>
            <Text style={styles.tx}>
              {t.typeName} · {formatDate(t.createdOn)}
            </Text>
            <Text style={[styles.tx, { color: t.amount < 0 ? Colors.tertiary : "#15803D", fontWeight: "700" }]}>
              {t.amount < 0 ? "-" : "+"}
              {money(Math.abs(t.amount))}
            </Text>
          </View>
        ))}
    </View>
  );
};

export const GiftCardsScreen = () => {
  const [cards, setCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [adding, setAdding] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      setCards(await giftCardsApi.getMyGiftCards());
      setError(null);
    } catch (e: any) {
      setError(e?.response?.status === 404 ? "Gift cards are not available yet." : apiErrorMessage(e, "Could not load your gift cards."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const add = async () => {
    if (!looksLikeCompleteCode(code)) {
      setCodeError("Enter the full code, like GC-ABCD-EFGH-JKLM-NPQR.");
      return;
    }
    setAdding(true);
    setCodeError("");
    try {
      await giftCardsApi.addGiftCard(code);
      setCode("");
      await load(true);
    } catch (e) {
      setCodeError(apiErrorMessage(e, "Could not add this gift card."));
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
    >
      <View style={styles.addBox}>
        <Text style={styles.addTitle}>Add a gift card</Text>
        <Text style={styles.meta}>Type the code printed on your card or sent to you.</Text>
        <TextInput
          style={[styles.input, !!codeError && { borderColor: Colors.error }]}
          value={code}
          onChangeText={(v) => {
            setCode(formatCodeInput(v));
            if (codeError) setCodeError("");
          }}
          placeholder="GC-XXXX-XXXX-XXXX-XXXX"
          placeholderTextColor={Colors.tertiary}
          autoCapitalize="characters"
          autoCorrect={false}
          accessibilityLabel="Gift card code"
        />
        {!!codeError && <Text style={styles.errorText} accessibilityRole="alert">{codeError}</Text>}
        <TouchableOpacity style={[styles.addBtn, (adding || !code) && { opacity: 0.6 }]} onPress={add} disabled={adding || !code} accessibilityRole="button">
          {adding ? <ActivityIndicator color="#fff" /> : <Text style={styles.addBtnText}>Add card</Text>}
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.empty}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => load()} accessibilityRole="button">
            <Text style={styles.link}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : cards.length === 0 ? (
        <Text style={[styles.meta, { textAlign: "center", marginTop: 30 }]}>
          You have no gift cards yet. When you have one, add its code above and use it at the payment step.
        </Text>
      ) : (
        cards.map((card) => <CardView key={card.giftCardId} card={card} />)
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F8FAFC" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: 16, paddingBottom: 40, gap: 12 },
  addBox: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#E2E8F0", gap: 8 },
  addTitle: { fontSize: 15, fontWeight: "800", color: Colors.textMain },
  input: { height: 48, borderRadius: 12, borderWidth: 1, borderColor: "#CBD5E1", paddingHorizontal: 14, letterSpacing: 1, color: Colors.textMain },
  addBtn: { height: 46, borderRadius: 12, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center" },
  addBtnText: { color: "#fff", fontWeight: "800" },
  card: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#E2E8F0", gap: 8 },
  row: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  code: { fontSize: 12.5, color: Colors.tertiary },
  balance: { fontSize: 24, fontWeight: "800", color: Colors.textMain, marginTop: 2 },
  meta: { fontSize: 12.5, color: Colors.tertiary, lineHeight: 18 },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 11.5, fontWeight: "700" },
  link: { color: Colors.accent, fontWeight: "700", fontSize: 13 },
  txRow: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  tx: { fontSize: 12.5, color: Colors.textMain },
  empty: { alignItems: "center", paddingVertical: 40, gap: 8 },
  errorText: { color: Colors.error, textAlign: "center", fontSize: 13 },
});
