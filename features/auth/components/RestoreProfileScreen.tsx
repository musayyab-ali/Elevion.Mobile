import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { AuthContainer } from "@/components/AuthContainer";
import { AppInput } from "@/components/AppInput";
import { AppButton } from "@/components/AppButton";
import { authApi } from "../services/authApi"; // adjust base layout import path reference
import { Colors } from "@/constants/Theme";

type CountryOption = {
  label: string;
  code: string;
  flag: string;
};

const COUNTRIES: CountryOption[] = [
  { label: "Pakistan", code: "92", flag: "🇵🇰" },
  { label: "United Kingdom", code: "44", flag: "🇬🇧" },
];

export default function RestoreProfileScreen() {
  const router = useRouter();
  const { userName, token } = useLocalSearchParams<{
    userName: string;
    token: string;
  }>();

  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(
    COUNTRIES[0],
  );
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uiError, setUiError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const handleVerifyIdentity = async () => {
    setUiError(null);
    setFieldError(null);
    if (!phoneNumber) {
      setFieldError("Enter your registered phone.");
      return;
    }

    // Clean whitespace/dashes for exact checking
    const trimmedNumber = phoneNumber.trim();

    // STRICTOR VALIDATION RULES: Trigger explicit UI errors if invalid formatting is found
    if (trimmedNumber.startsWith("0")) {
      setFieldError(
        "Phone number must not start with a 0. Please enter the raw number.",
      );
      return;
    }

    if (trimmedNumber.startsWith(selectedCountry.code)) {
      setFieldError(
        `Phone number must not include the country code (+${selectedCountry.code}) again.`,
      );
      return;
    }

    // Ensure it contains only numbers
    if (!/^\d+$/.test(trimmedNumber)) {
      setFieldError(
        "Please enter a valid phone number containing only digits.",
      );
      return;
    }

    setLoading(true);

    try {
      // 1. Verify specific profile link fields
      const checkPhone = await authApi.verifyDeletedPhone({
        UserName: userName,
        PhoneCode: selectedCountry.code,
        PhoneNumber: trimmedNumber,
      });

      if (checkPhone?.Data?.IsUnique === true) {
        // 2. Dispatch authorization pins
        const sendOtp = await authApi.sendOtpToPhone({
          PhoneNumber: trimmedNumber,
          PhoneCode: parseInt(selectedCountry.code, 10),
        });

        if (sendOtp?.StatusCode === 200) {
          router.push({
            pathname: "/(unauthorized)/otp-verification",
            params: {
              userName: userName,
              phoneNumber: trimmedNumber,
              phoneCode: selectedCountry.code,
              restorationToken: token,
              flowType: "restoration",
              message:
                "Security code dispatched. Enter token code below to complete profile validation.",
            },
          });
        }
      } else {
        setUiError(
          "Provided contact records do not match this archived workspace identity.",
        );
      }
    } catch (err: any) {
      setUiError(err?.Message || "Verification payload failure exception.");
    } finally {
      setLoading(false);
      setTimeout(() => {
        setUiError(null);
      }, 3000);
    }
  };

  return (
    <AuthContainer title="Identity Verification" apiMessage={uiError}>
      <View style={styles.formCard}>
        <Text style={styles.infoLabel}>
          To protect your privacy parameters, verify the contact details
          registered to account username:{" "}
          <Text style={{ fontWeight: "700" }}>{userName}</Text>
        </Text>

        <View style={styles.phoneInputRow}>
          {/* Professional Dropdown Trigger */}
          <View style={styles.codeColumn}>
            <Text style={styles.fieldLabel}>Code</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.dropdownTrigger}
              onPress={() => setDropdownVisible(true)}
            >
              <Text style={styles.dropdownTriggerText}>
                {selectedCountry.flag} +{selectedCountry.code}
              </Text>
              <Text style={styles.arrowIcon}>▼</Text>
            </TouchableOpacity>
          </View>

          {/* Raw Phone Number Input Field */}
          <View style={styles.numberColumn}>
            <AppInput
              label="Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              placeholder={
                selectedCountry.code === "92" ? "3001234567" : "7123456789"
              }
              error={fieldError}
            />
          </View>
        </View>

        <AppButton
          title={loading ? "Verifying..." : "SEND VERIFICATION CODE"}
          onPress={handleVerifyIdentity}
          disabled={loading}
          style={styles.actionButton}
        />
      </View>

      {/* Elegant Selector Dropdown Modal Overlay */}
      <Modal
        visible={dropdownVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setDropdownVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.dropdownMenu}>
              <FlatList
                data={COUNTRIES}
                keyExtractor={(item) => item.code}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.dropdownItem,
                      item.code === selectedCountry.code &&
                        styles.dropdownItemActive,
                    ]}
                    onPress={() => {
                      setSelectedCountry(item);
                      setDropdownVisible(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>
                      {item.flag} {item.label} (+{item.code})
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </AuthContainer>
  );
}

const styles = StyleSheet.create({
  formCard: {
    width: "100%",
    maxWidth: 500,
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  infoLabel: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 22,
    marginBottom: 24,
  },
  phoneInputRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    justifyContent: "center",
    alignItems: "flex-start",
  },

  fieldLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#475569",
    marginBottom: 8,
  },
  dropdownTrigger: {
    height: 48,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  dropdownTriggerText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1E293B",
    flex: 1,
  },
  arrowIcon: {
    fontSize: 10,
    color: "#64748B",
    marginLeft: 4,
  },
  codeColumn: {
    width: "32%",
  },
  numberColumn: {
    flex: 1,
  },
  actionButton: {
    marginTop: 24,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accent,
  },
  /* Modal Overlay Styling */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.3)", // subtle dark backdrop tint
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownMenu: {
    width: "80%",
    maxWidth: 320,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  dropdownItemActive: {
    backgroundColor: "#F1F5F9",
  },
  dropdownItemText: {
    fontSize: 15,
    color: "#334155",
    fontWeight: "500",
  },
});
