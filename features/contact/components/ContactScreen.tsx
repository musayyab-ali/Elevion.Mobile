import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/Theme";
import { useBranding } from "../../branding/hooks/BrandingProvider";
import { mailUrl, telUrl } from "../../branding/utils/brandingModel";
import { contactErrorMessage, sendContactMessage } from "../services/contactApi";
import {
  CONTACT_LIMITS,
  CONTACT_TYPES,
  ContactErrors,
  hasErrors,
  messageCounter,
  validateContact,
} from "../utils/contactForm";

const open = (url: string | null) => {
  if (!url) return;
  Linking.openURL(url).catch(() => Alert.alert("Could not open", "Your phone could not open this link."));
};

const SOCIAL_ICON: Record<string, keyof typeof Ionicons.glyphMap> = {
  facebook: "logo-facebook",
  instagram: "logo-instagram",
  twitter: "logo-twitter",
  youtube: "logo-youtube",
  pinterest: "logo-pinterest",
  linkedin: "logo-linkedin",
  snapchat: "logo-snapchat",
  whatsapp: "logo-whatsapp",
  tiktok: "logo-tiktok",
  google: "logo-google",
};

export const ContactScreen = () => {
  const { branding } = useBranding();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<number>(CONTACT_TYPES[0].value);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [sending, setSending] = useState(false);
  const [sentText, setSentText] = useState<string | null>(null);

  const submit = async () => {
    if (sending) return;
    const found = validateContact({ name, email, phone, message, type });
    setErrors(found);
    setSentText(null);
    if (hasErrors(found)) return;

    setSending(true);
    try {
      const text = await sendContactMessage({ name, email, phone, message, type });
      setSentText(text);
      setMessage("");
      setErrors({});
    } catch (error) {
      Alert.alert("Message not sent", contactErrorMessage(error));
    } finally {
      setSending(false);
    }
  };

  const hasDetails = Boolean(branding.email || branding.phone || branding.address || branding.social.length > 0);

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={styles.flex} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>Contact {branding.shopName}</Text>

        {hasDetails && (
          <View style={styles.card}>
            {branding.phone && (
              <TouchableOpacity style={styles.detailRow} onPress={() => open(telUrl(branding.phone))} disabled={!telUrl(branding.phone)} accessibilityRole="button">
                <Ionicons name="call-outline" size={18} color={Colors.primary} />
                <Text style={styles.detailText}>{branding.phone}</Text>
              </TouchableOpacity>
            )}
            {branding.email && (
              <TouchableOpacity style={styles.detailRow} onPress={() => open(mailUrl(branding.email))} disabled={!mailUrl(branding.email)} accessibilityRole="button">
                <Ionicons name="mail-outline" size={18} color={Colors.primary} />
                <Text style={styles.detailText}>{branding.email}</Text>
              </TouchableOpacity>
            )}
            {branding.address && (
              <View style={styles.detailRow}>
                <Ionicons name="location-outline" size={18} color={Colors.primary} />
                <Text style={styles.detailText}>{branding.address}</Text>
              </View>
            )}
            {branding.social.length > 0 && (
              <View style={styles.socialRow}>
                {branding.social.map((link) => (
                  <TouchableOpacity key={link.platform} onPress={() => open(link.url)} accessibilityRole="link" accessibilityLabel={link.name} style={styles.socialBtn}>
                    <Ionicons name={SOCIAL_ICON[link.platform] ?? "globe-outline"} size={22} color={Colors.primary} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        <Text style={styles.sectionTitle}>Send us a message</Text>

        <Text style={styles.label}>What is it about?</Text>
        <View style={styles.chips}>
          {CONTACT_TYPES.map((option) => {
            const selected = option.value === type;
            return (
              <TouchableOpacity
                key={option.value}
                style={[styles.chip, selected && styles.chipOn]}
                onPress={() => setType(option.value)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <Text style={[styles.chipText, selected && styles.chipTextOn]}>{option.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>Your name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} maxLength={CONTACT_LIMITS.name} autoComplete="name" editable={!sending} />
        {errors.name && <Text style={styles.error}>{errors.name}</Text>}

        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} maxLength={CONTACT_LIMITS.email} keyboardType="email-address" autoCapitalize="none" autoComplete="email" editable={!sending} />
        {errors.email && <Text style={styles.error}>{errors.email}</Text>}

        <Text style={styles.label}>Phone</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} maxLength={CONTACT_LIMITS.phone} keyboardType="phone-pad" autoComplete="tel" editable={!sending} />
        {errors.phone && <Text style={styles.error}>{errors.phone}</Text>}

        <Text style={styles.label}>Message</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={message}
          onChangeText={setMessage}
          maxLength={CONTACT_LIMITS.messageMax}
          multiline
          textAlignVertical="top"
          editable={!sending}
        />
        <View style={styles.counterRow}>
          <Text style={styles.error}>{errors.message ?? ""}</Text>
          <Text style={styles.counter}>{messageCounter(message)}</Text>
        </View>

        {sentText && <Text style={styles.sent}>{sentText}</Text>}

        <TouchableOpacity style={[styles.send, sending && styles.sendBusy]} onPress={submit} disabled={sending} accessibilityRole="button">
          {sending ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.sendText}>Send message</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.white },
  content: { padding: 20, paddingBottom: 40 },
  heading: { fontSize: 22, fontWeight: "800", color: Colors.textMain, marginBottom: 14 },
  card: { backgroundColor: Colors.secondary, borderRadius: 14, padding: 14, marginBottom: 20, gap: 12 },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  detailText: { flex: 1, fontSize: 14, color: Colors.textMain },
  socialRow: { flexDirection: "row", gap: 10, flexWrap: "wrap", marginTop: 2 },
  socialBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.white, alignItems: "center", justifyContent: "center" },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: Colors.textMain, marginBottom: 6 },
  label: { fontSize: 12.5, fontWeight: "600", color: Colors.tertiary, marginTop: 12, marginBottom: 6 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: "#E2E8F0", backgroundColor: Colors.white },
  chipOn: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 13, color: Colors.textMain, fontWeight: "600" },
  chipTextOn: { color: Colors.white },
  input: { borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: Colors.textMain, backgroundColor: Colors.white },
  textArea: { minHeight: 120 },
  error: { color: Colors.darkError, fontSize: 12, marginTop: 4, flex: 1 },
  counterRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  counter: { fontSize: 12, color: Colors.tertiary },
  sent: { marginTop: 14, color: Colors.success, fontWeight: "600" },
  send: { marginTop: 18, backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  sendBusy: { opacity: 0.7 },
  sendText: { color: Colors.white, fontWeight: "700", fontSize: 15 },
});
