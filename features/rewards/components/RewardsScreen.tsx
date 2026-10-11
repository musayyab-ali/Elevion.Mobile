import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/Theme";
import { useRewards } from "../hooks/useRewards";
import { OfflineBanner } from "../../../components/OfflineBanner";
import { expiryHint } from "../utils/voucherExpiry";
import type { Loyalty, MyReferral, Voucher } from "../services/rewardsApi";
import { useBranding } from "../../branding/hooks/BrandingProvider";

type Tab = "vouchers" | "membership" | "invite";

const money = (value: number) =>
  `Rs. ${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

const formatDate = (iso: string | null) => {
  if (!iso) return "";
  const date = new Date(iso.endsWith("Z") || iso.includes("+") ? iso : `${iso}Z`);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
};

const STATUS_STYLE: Record<string, { bg: string; fg: string }> = {
  Issued: { bg: "#E0F2FE", fg: "#0369A1" },
  Delivered: { bg: "#E0F2FE", fg: "#0369A1" },
  Viewed: { bg: "#EDE9FE", fg: "#6D28D9" },
  Redeemed: { bg: "#DCFCE7", fg: "#15803D" },
  Expired: { bg: "#F1F5F9", fg: "#64748B" },
  Revoked: { bg: "#FEE2E2", fg: "#B91C1C" },
  Cancelled: { bg: "#FEE2E2", fg: "#B91C1C" },
};

const isUsable = (v: Voucher) => ["Issued", "Delivered", "Viewed"].includes(v.statusName);

// ---------------------------------------------------------------------------------------------------------------
// Vouchers
// ---------------------------------------------------------------------------------------------------------------

const VoucherCard = ({ voucher }: { voucher: Voucher }) => {
  const usable = isUsable(voucher);
  const status = STATUS_STYLE[voucher.statusName] ?? STATUS_STYLE.Expired;

  const share = () =>
    Share.share({
      message: `My ${voucher.partnerName} voucher code: ${voucher.code}`,
    }).catch(() => undefined);

  return (
    <View style={[styles.voucher, !usable && styles.dimmed]}>
      <View style={styles.voucherTop}>
        <View style={styles.voucherBadge}>
          <Ionicons name="gift-outline" size={20} color={Colors.accent} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.voucherPartner}>{voucher.partnerName}</Text>
          <Text style={styles.voucherValue}>{money(voucher.value)} voucher</Text>
        </View>
        <View style={[styles.chip, { backgroundColor: status.bg }]}>
          <Text style={[styles.chipText, { color: status.fg }]}>{voucher.statusName}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.codeBox}
        onPress={share}
        disabled={!usable}
        accessibilityRole="button"
        accessibilityLabel={`Share voucher code ${voucher.code}`}
      >
        <Text selectable style={styles.codeText}>
          {voucher.code}
        </Text>
        {usable && <Ionicons name="share-social-outline" size={18} color={Colors.tertiary} />}
      </TouchableOpacity>

      {usable && !!expiryHint(voucher.expiresOn) && (
        <View style={styles.expiryBadge}>
          <Text style={styles.expiryText}>{expiryHint(voucher.expiresOn)}</Text>
        </View>
      )}
      <Text style={styles.meta}>
        {voucher.expiresOn ? `Valid until ${formatDate(voucher.expiresOn)}` : "No expiry date"}
        {voucher.redeemedOn ? `  ·  Used ${formatDate(voucher.redeemedOn)}` : ""}
      </Text>
      {!!voucher.terms && <Text style={styles.terms}>{voucher.terms}</Text>}
    </View>
  );
};

const VouchersTab = ({ vouchers, error }: { vouchers: Voucher[]; error: string | null }) => {
  if (error) return <Notice icon="alert-circle-outline" text={error} />;
  if (!vouchers.length)
    return (
      <Notice
        icon="gift-outline"
        text="No vouchers yet. Complete an order and your rewards will appear here."
      />
    );

  const usable = vouchers.filter(isUsable);
  const past = vouchers.filter((v) => !isUsable(v));
  return (
    <>
      {usable.length > 0 && <Text style={styles.sectionTitle}>Ready to use ({usable.length})</Text>}
      {usable.map((v) => (
        <VoucherCard key={v.voucherId} voucher={v} />
      ))}
      {past.length > 0 && <Text style={styles.sectionTitle}>History</Text>}
      {past.map((v) => (
        <VoucherCard key={v.voucherId} voucher={v} />
      ))}
    </>
  );
};

// ---------------------------------------------------------------------------------------------------------------
// Membership
// ---------------------------------------------------------------------------------------------------------------

const MembershipTab = ({ loyalty, error }: { loyalty: Loyalty | null; error: string | null }) => {
  if (error) return <Notice icon="alert-circle-outline" text={error} />;
  if (!loyalty) return null;

  return (
    <>
      <View style={styles.pointsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{money(loyalty.lifetimeSpend)}</Text>
          <Text style={styles.statLabel}>Total spent</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{Number(loyalty.rewardPoints || 0).toLocaleString()}</Text>
          <Text style={styles.statLabel}>Reward points</Text>
        </View>
      </View>

      {!loyalty.tiersEnabled || !loyalty.tier ? (
        <Notice icon="ribbon-outline" text="Membership levels are not available yet." />
      ) : (
        <View style={[styles.tierCard, { borderColor: loyalty.tierColor || Colors.accent }]}>
          <View style={styles.tierHeader}>
            <View style={[styles.tierDot, { backgroundColor: loyalty.tierColor || Colors.accent }]}>
              <Ionicons name="ribbon" size={20} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.tierLabel}>Your level</Text>
              <Text style={styles.tierName}>{loyalty.tier}</Text>
            </View>
          </View>
          {!!loyalty.benefits && <Text style={styles.tierBenefits}>{loyalty.benefits}</Text>}

          <View style={styles.track}>
            <View
              style={[
                styles.trackFill,
                { width: `${Math.min(100, Math.max(0, loyalty.progress))}%`, backgroundColor: loyalty.tierColor || Colors.accent },
              ]}
            />
          </View>
          <Text style={styles.trackText}>
            {loyalty.nextTier
              ? `${money(loyalty.spendToNextTier)} more to reach ${loyalty.nextTier}`
              : "You are at the top level. Thank you!"}
          </Text>
        </View>
      )}

      {loyalty.tiersEnabled && loyalty.levels.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>All levels</Text>
          {loyalty.levels.map((level) => (
            <View key={level.name} style={[styles.level, level.current && styles.levelCurrent]}>
              <View style={[styles.levelDot, { backgroundColor: level.color || Colors.tertiary, opacity: level.reached ? 1 : 0.35 }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.levelName}>
                  {level.name}
                  {level.current ? "  (you)" : ""}
                </Text>
                <Text style={styles.levelMeta}>
                  {level.minSpend > 0 ? `From ${money(level.minSpend)} total spend` : "Everyone starts here"}
                </Text>
                {!!level.benefits && <Text style={styles.levelMeta}>{level.benefits}</Text>}
              </View>
              {level.reached && <Ionicons name="checkmark-circle" size={20} color={Colors.success} />}
            </View>
          ))}
        </>
      )}
    </>
  );
};

// ---------------------------------------------------------------------------------------------------------------
// Invite friends
// ---------------------------------------------------------------------------------------------------------------

const InviteTab = ({
  referral,
  error,
  applyCode,
}: {
  referral: MyReferral | null;
  error: string | null;
  applyCode: (code: string) => Promise<{ ok: boolean; message: string }>;
}) => {
  const { branding } = useBranding();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  if (error) return <Notice icon="alert-circle-outline" text={error} />;
  if (!referral) return null;

  const share = () =>
    Share.share({
      message: `Join me on ${branding.shopName} and use my referral code ${referral.code} on your first order to get a reward.`,
    }).catch(() => undefined);

  const submit = async () => {
    if (!code.trim() || busy) return;
    setBusy(true);
    setFeedback(null);
    const result = await applyCode(code);
    setFeedback({ ok: result.ok, text: result.message });
    if (result.ok) setCode("");
    setBusy(false);
  };

  return (
    <>
      <View style={styles.inviteCard}>
        <Text style={styles.inviteTitle}>Invite friends, earn rewards</Text>
        <Text style={styles.inviteBody}>
          Share your code. When a friend places their first order, you both get a reward.
        </Text>
        <Text selectable style={styles.inviteCode}>
          {referral.code}
        </Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={share} accessibilityRole="button">
          <Ionicons name="share-social" size={18} color="#fff" />
          <Text style={styles.primaryBtnText}>Share my code</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.pointsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{referral.invited}</Text>
          <Text style={styles.statLabel}>Invited</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{referral.pending}</Text>
          <Text style={styles.statLabel}>Waiting</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{referral.qualified}</Text>
          <Text style={styles.statLabel}>Joined</Text>
        </View>
      </View>

      {referral.canApplyCode ? (
        <View style={styles.applyCard}>
          <Text style={styles.sectionTitle}>Have a friend's code?</Text>
          <TextInput
            style={styles.input}
            value={code}
            onChangeText={setCode}
            placeholder="REF-0000-00"
            autoCapitalize="characters"
            autoCorrect={false}
            placeholderTextColor="#94A3B8"
            accessibilityLabel="Referral code"
          />
          <TouchableOpacity
            style={[styles.primaryBtn, (!code.trim() || busy) && styles.btnDisabled]}
            onPress={submit}
            disabled={!code.trim() || busy}
            accessibilityRole="button"
          >
            {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Apply code</Text>}
          </TouchableOpacity>
          {feedback && (
            <Text style={[styles.feedback, { color: feedback.ok ? Colors.success : Colors.error }]}>{feedback.text}</Text>
          )}
        </View>
      ) : referral.wasReferred ? (
        <Text style={styles.footnote}>You joined with a friend's referral code. Your reward comes after your first order.</Text>
      ) : null}
    </>
  );
};

const Notice = ({ icon, text }: { icon: keyof typeof Ionicons.glyphMap; text: string }) => (
  <View style={styles.notice}>
    <Ionicons name={icon} size={34} color="#94A3B8" />
    <Text style={styles.noticeText}>{text}</Text>
  </View>
);

// ---------------------------------------------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------------------------------------------

const TABS: { key: Tab; label: string }[] = [
  { key: "vouchers", label: "Vouchers" },
  { key: "membership", label: "Membership" },
  { key: "invite", label: "Invite" },
];

export const RewardsScreen = () => {
  const { vouchers, loyalty, referral, loading, refreshing, refresh, applyCode } = useRewards();
  const [tab, setTab] = useState<Tab>("vouchers");

  const staleSince = tab === "vouchers" ? vouchers.staleSince : tab === "membership" ? loyalty.staleSince : referral.staleSince;

  const usableCount = useMemo(() => vouchers.data.filter(isUsable).length, [vouchers.data]);

  return (
    <View style={styles.screen}>
      <View style={styles.tabs}>
        {TABS.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, tab === t.key && styles.tabActive]}
            onPress={() => setTab(t.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === t.key }}
          >
            <Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>
              {t.label}
              {t.key === "vouchers" && usableCount > 0 ? `  (${usableCount})` : ""}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
        >
          <OfflineBanner since={staleSince} />
          {tab === "vouchers" && <VouchersTab vouchers={vouchers.data} error={vouchers.error} />}
          {tab === "membership" && <MembershipTab loyalty={loyalty.data} error={loyalty.error} />}
          {tab === "invite" && <InviteTab referral={referral.data} error={referral.error} applyCode={applyCode} />}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F8FAFC" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: 16, paddingBottom: 40 },
  tabs: { flexDirection: "row", backgroundColor: Colors.white, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: "#E2E8F0" },
  tab: { flex: 1, paddingVertical: 14, alignItems: "center", borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabActive: { borderBottomColor: Colors.accent },
  tabText: { fontSize: 14, fontWeight: "600", color: Colors.tertiary },
  tabTextActive: { color: Colors.accent },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: Colors.textMain, marginTop: 6, marginBottom: 10 },

  voucher: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#E2E8F0" },
  dimmed: { opacity: 0.6 },
  expiryBadge: { alignSelf: "flex-start", backgroundColor: "#FEF3C7", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, marginTop: 8 },
  expiryText: { fontSize: 11.5, fontWeight: "700", color: "#92400E" },
  voucherTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  voucherBadge: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#E0F2FE", alignItems: "center", justifyContent: "center" },
  voucherPartner: { fontSize: 16, fontWeight: "700", color: Colors.textMain },
  voucherValue: { fontSize: 13, color: Colors.tertiary, marginTop: 2 },
  chip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  chipText: { fontSize: 11, fontWeight: "700" },
  codeBox: { marginTop: 14, borderWidth: 2, borderStyle: "dashed", borderColor: "#BAE6FD", borderRadius: 12, paddingVertical: 14, paddingHorizontal: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#F0F9FF" },
  codeText: { fontSize: 18, fontWeight: "800", letterSpacing: 1.5, color: Colors.container },
  meta: { marginTop: 10, fontSize: 12, color: Colors.tertiary },
  terms: { marginTop: 6, fontSize: 11, color: "#94A3B8" },

  pointsRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  stat: { flex: 1, backgroundColor: Colors.white, borderRadius: 14, paddingVertical: 16, alignItems: "center", borderWidth: 1, borderColor: "#E2E8F0" },
  statValue: { fontSize: 18, fontWeight: "800", color: Colors.textMain },
  statLabel: { fontSize: 12, color: Colors.tertiary, marginTop: 4 },

  tierCard: { backgroundColor: Colors.white, borderRadius: 18, padding: 18, borderWidth: 2, marginBottom: 18 },
  tierHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  tierDot: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  tierLabel: { fontSize: 12, color: Colors.tertiary },
  tierName: { fontSize: 22, fontWeight: "800", color: Colors.textMain },
  tierBenefits: { marginTop: 12, fontSize: 13, color: "#475569" },
  track: { height: 10, borderRadius: 10, backgroundColor: "#E2E8F0", marginTop: 16, overflow: "hidden" },
  trackFill: { height: "100%", borderRadius: 10 },
  trackText: { marginTop: 8, fontSize: 12, color: Colors.tertiary },

  level: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: Colors.white, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: "#E2E8F0" },
  levelCurrent: { borderColor: Colors.accent },
  levelDot: { width: 14, height: 14, borderRadius: 7 },
  levelName: { fontSize: 15, fontWeight: "700", color: Colors.textMain },
  levelMeta: { fontSize: 12, color: Colors.tertiary, marginTop: 2 },

  inviteCard: { backgroundColor: Colors.container, borderRadius: 18, padding: 20, marginBottom: 14 },
  inviteTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  inviteBody: { color: "#CBD5E1", fontSize: 13, marginTop: 6, lineHeight: 19 },
  inviteCode: { color: "#fff", fontSize: 26, fontWeight: "800", letterSpacing: 2, textAlign: "center", marginVertical: 18 },
  primaryBtn: { backgroundColor: Colors.primary, borderRadius: 12, height: 48, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  primaryBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  btnDisabled: { opacity: 0.5 },
  applyCard: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#E2E8F0" },
  input: { backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12, height: 48, paddingHorizontal: 14, fontSize: 16, color: Colors.textMain, marginBottom: 12, letterSpacing: 1 },
  feedback: { marginTop: 10, fontSize: 13, textAlign: "center" },
  footnote: { fontSize: 13, color: Colors.tertiary, textAlign: "center", marginTop: 6 },

  notice: { alignItems: "center", paddingVertical: 50, paddingHorizontal: 24, gap: 12 },
  noticeText: { textAlign: "center", color: Colors.tertiary, fontSize: 14, lineHeight: 20 },
});
