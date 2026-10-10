import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Colors } from "../../../constants/Theme";
import {
  ConsentChoice,
  consentLabel,
  privacyApi,
  privacyErrorMessage,
} from "../services/privacyApi";
import { OfflineBanner } from "../../../components/OfflineBanner";
import { isOfflineError, readCache, writeCache } from "../../../services/cache/offlineCache";

const CACHE_KEY = "privacy-consents";

const formatDate = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso.endsWith("Z") || iso.includes("+") ? iso : `${iso}Z`);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
};

export const PrivacyScreen = () => {
  const [consents, setConsents] = useState<ConsentChoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingType, setSavingType] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [staleSince, setStaleSince] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const fresh = await privacyApi.getConsents();
      setConsents(fresh);
      setStaleSince(null);
      setError(null);
      void writeCache(CACHE_KEY, fresh);
    } catch (e) {
      // No connection: show the last saved choices (read-only in practice, saving needs the server).
      const saved = isOfflineError(e) ? await readCache<ConsentChoice[]>(CACHE_KEY) : null;
      if (saved) {
        setConsents(saved.data);
        setStaleSince(saved.savedAt);
        setError(null);
      } else {
        setError(privacyErrorMessage(e, "Could not load your privacy choices."));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Each switch is saved on its own, right away: withdrawing consent must be as easy as giving it.
  const toggle = async (choice: ConsentChoice, value: boolean) => {
    if (savingType !== null) return;
    if (staleSince !== null) {
      Alert.alert("You are offline", "Connect to the internet to change your choices, so they are saved correctly.");
      return;
    }
    setSavingType(choice.type);
    setConsents((list) => list.map((c) => (c.type === choice.type ? { ...c, isGranted: value } : c)));
    try {
      const saved = await privacyApi.saveConsent(choice.type, value);
      setConsents(saved);
      void writeCache(CACHE_KEY, saved);
    } catch (e) {
      setConsents((list) => list.map((c) => (c.type === choice.type ? { ...c, isGranted: choice.isGranted } : c)));
      Alert.alert("Could not save", privacyErrorMessage(e, "Please try again."));
    } finally {
      setSavingType(null);
    }
  };

  const exportData = async () => {
    setExporting(true);
    try {
      const json = await privacyApi.exportMyData();
      await Share.share({ title: "My data", message: json });
    } catch (e) {
      Alert.alert("Could not export", privacyErrorMessage(e, "Please try again."));
    } finally {
      setExporting(false);
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
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={async () => {
            setRefreshing(true);
            await load();
            setRefreshing(false);
          }}
        />
      }
    >
      <OfflineBanner since={staleSince} />
      <Text style={styles.heading}>Your choices</Text>
      <Text style={styles.sub}>Decide how we may contact you and use your data. You can change your mind at any time.</Text>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={load} accessibilityRole="button">
            <Text style={styles.retry}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        consents.map((choice) => {
          const label = consentLabel(choice);
          return (
            <View key={choice.type} style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{label.title}</Text>
                {!!label.description && <Text style={styles.rowDesc}>{label.description}</Text>}
                {!!choice.updatedOn && <Text style={styles.rowMeta}>Last changed {formatDate(choice.updatedOn)}</Text>}
              </View>
              <Switch
                value={choice.isGranted}
                disabled={savingType === choice.type}
                onValueChange={(value) => toggle(choice, value)}
                trackColor={{ true: Colors.primary }}
                accessibilityLabel={label.title}
              />
            </View>
          );
        })
      )}

      <View style={styles.card}>
        <Text style={styles.heading}>Download my data</Text>
        <Text style={styles.sub}>Get a copy of everything we hold about you (profile, addresses, orders, consents).</Text>
        <TouchableOpacity
          style={[styles.button, exporting && styles.buttonDisabled]}
          onPress={exportData}
          disabled={exporting}
          accessibilityRole="button"
        >
          {exporting ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Export my data</Text>}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F8FAFC" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: 16, paddingBottom: 40 },
  heading: { fontSize: 18, fontWeight: "800", color: Colors.textMain },
  sub: { fontSize: 13, color: Colors.tertiary, marginTop: 6, marginBottom: 14, lineHeight: 19 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: Colors.white, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "#E2E8F0" },
  rowTitle: { fontSize: 15, fontWeight: "700", color: Colors.textMain },
  rowDesc: { fontSize: 12, color: Colors.tertiary, marginTop: 2 },
  rowMeta: { fontSize: 11, color: "#94A3B8", marginTop: 4 },
  errorBox: { alignItems: "center", paddingVertical: 24, gap: 10 },
  errorText: { color: Colors.error, textAlign: "center" },
  retry: { color: Colors.accent, fontWeight: "700" },
  card: { backgroundColor: Colors.white, borderRadius: 16, padding: 16, marginTop: 20, borderWidth: 1, borderColor: "#E2E8F0" },
  button: { backgroundColor: Colors.primary, borderRadius: 12, height: 48, alignItems: "center", justifyContent: "center" },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
