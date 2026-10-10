import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../../constants/Theme";
import { apiErrorMessage } from "../../../utils/apiError";
import { returnsApi, type ReturnRequestDto } from "../services/returnsApi";
import { statusColors } from "../utils/returnForm";

const money = (value: number) => `Rs. ${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

const formatDate = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(/Z|[+-]\d\d:?\d\d$/.test(iso) ? iso : `${iso}Z`);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
};

const ReturnCard = ({ item, onChanged }: { item: ReturnRequestDto; onChanged: () => void }) => {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const colors = statusColors(item.statusName);

  const cancel = () =>
    Alert.alert("Cancel this return?", item.reference, [
      { text: "Keep it", style: "cancel" },
      {
        text: "Cancel return",
        style: "destructive",
        onPress: async () => {
          setBusy(true);
          try {
            await returnsApi.cancelReturn(item.returnId);
            onChanged();
          } catch (e) {
            Alert.alert("Could not cancel", apiErrorMessage(e, "Please try again."));
          } finally {
            setBusy(false);
          }
        },
      },
    ]);

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => setOpen((v) => !v)} accessibilityRole="button" accessibilityState={{ expanded: open }}>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.ref}>{item.reference}</Text>
            <Text style={styles.meta}>
              Order {item.orderNumber ?? item.orderId} · {formatDate(item.createdOn)} · {item.resolutionName}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: colors.bg }]}>
            <Text style={[styles.badgeText, { color: colors.fg }]}>{item.statusName}</Text>
          </View>
        </View>
      </TouchableOpacity>

      {item.items.map((line) => (
        <Text key={line.orderProductId} style={styles.line}>
          {line.quantity} × {line.productName ?? "Item"}
        </Text>
      ))}
      <Text style={styles.amount}>
        {item.resolution === 2 ? "Replacement" : item.statusName === "Completed" ? "Amount" : "Expected amount"}:{" "}
        <Text style={{ fontWeight: "800" }}>{item.resolution === 2 ? "—" : money(item.refundAmount)}</Text>
      </Text>

      {open && (
        <View style={styles.details}>
          <Text style={styles.meta}>Reason: {item.reasonName}</Text>
          {!!item.comments && <Text style={styles.comment}>“{item.comments}”</Text>}
          {!!item.decisionNote && (
            <View style={styles.note}>
              <Text style={styles.noteText}>
                <Text style={{ fontWeight: "700" }}>Message from the shop: </Text>
                {item.decisionNote}
              </Text>
            </View>
          )}
          {item.timeline.map((event, i) => (
            <Text key={i} style={styles.event}>
              <Text style={{ fontWeight: "700" }}>{event.statusName}</Text> · {formatDate(event.createdOn)}
              {event.note ? `\n${event.note}` : ""}
            </Text>
          ))}
        </View>
      )}

      {item.canCancel && (
        <TouchableOpacity onPress={cancel} disabled={busy} style={styles.cancelBtn} accessibilityRole="button">
          <Text style={styles.cancelText}>{busy ? "Cancelling..." : "Cancel this return"}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export const ReturnsScreen = () => {
  const [returns, setReturns] = useState<ReturnRequestDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    try {
      setReturns(await returnsApi.getMyReturns());
      setError(null);
    } catch (e: any) {
      setError(e?.response?.status === 404 ? "Returns are not available yet." : apiErrorMessage(e, "Could not load your returns."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
    >
      {error ? (
        <View style={styles.empty}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => load()} accessibilityRole="button">
            <Text style={styles.link}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : returns.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No returns yet</Text>
          <Text style={styles.meta}>To return something, open a delivered order in My Orders and choose “Return items”.</Text>
        </View>
      ) : (
        returns.map((item) => <ReturnCard key={item.returnId} item={item} onChanged={() => load(true)} />)
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F8FAFC" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: 16, paddingBottom: 40, gap: 12 },
  card: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#E2E8F0" },
  row: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  ref: { fontSize: 15, fontWeight: "800", color: Colors.textMain },
  meta: { fontSize: 12.5, color: Colors.tertiary, marginTop: 3, lineHeight: 18 },
  badge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 11.5, fontWeight: "700" },
  line: { fontSize: 13, color: Colors.textMain, marginTop: 6 },
  amount: { fontSize: 13, color: Colors.textMain, marginTop: 8 },
  details: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: "#E2E8F0", gap: 6 },
  comment: { fontSize: 13, color: Colors.textMain },
  note: { backgroundColor: "#F1F5F9", borderRadius: 10, padding: 10 },
  noteText: { fontSize: 13, color: Colors.textMain, lineHeight: 18 },
  event: { fontSize: 12.5, color: Colors.tertiary, lineHeight: 18 },
  cancelBtn: { marginTop: 12, alignSelf: "flex-start" },
  cancelText: { color: Colors.darkError, fontWeight: "700", fontSize: 13 },
  empty: { alignItems: "center", paddingVertical: 60, gap: 8 },
  emptyTitle: { fontSize: 17, fontWeight: "800", color: Colors.textMain },
  errorText: { color: Colors.error, textAlign: "center" },
  link: { color: Colors.accent, fontWeight: "700" },
});
