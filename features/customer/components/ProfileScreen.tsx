import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Modal,
} from "react-native";
import { MotiView } from "moti";
import { useProfile } from "../hooks/useProfile";
import { Colors } from "../../../constants/Theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { CustomErrorMessage } from "@/components/CustomErrorMessage";
import { useReviews } from "../hooks/useReviews";
import { ReviewItem } from "./ReviewItem";
import { useAuth } from "@/store/AuthContext";
import { PremiumGuestGate } from "@/components/PremiumGuestGate";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Platform } from "react-native";
// Helper helper functions to display gender text inside view modes
const getGenderLabel = (value: number) => {
  if (value === 1) return "Male";
  if (value === 2) return "Female";
  return "Not Set";
};
export const ProfileScreen = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const {
    profile,
    loading,
    updating,
    handleUpdate,
    isEditing,
    setIsEditing,
    profileMessage,
    setProfileMessage,
  } = useProfile();

  const { reviews, loading: reviewsLoading } = useReviews();
  const [formData, setFormData] = useState<any>({});

  // High-fidelity validation feedback states
  const [errors, setErrors] = useState<{
    fullName?: string;
    phone?: string;
    country?: string;
    dob?: string;
  }>({});
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [countryDropdownVisible, setCountryDropdownVisible] = useState(false);
  const [genderDropdownVisible, setGenderDropdownVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  useEffect(() => {
    if (profile) setFormData(profile);
  }, [profile]);

  const onSave = async () => {
    setErrors({});
    setProfileMessage(null);

    const result = await handleUpdate(formData);

    if (!result.success) {
      if (result.fieldErrors) {
        setErrors(result.fieldErrors);
      } else {
        setProfileMessage(result.error || "Could not update profile details.");
        setTimeout(() => setProfileMessage(null), 3000);
      }
      return;
    }

    // Trigger the production-ready custom popup confirmation
    setSuccessModalVisible(true);
  };

  const handleCountrySelect = (selectedCountry: string) => {
    const nextCode = selectedCountry === "Pakistan" ? "92" : "44";
    setFormData({
      ...formData,
      Country: selectedCountry,
      PhoneCode: nextCode,
      PhoneNumber: "",
    });
    setErrors({ ...errors, country: undefined, phone: undefined });
    setCountryDropdownVisible(false);
  };

  const handleGenderSelect = (genderValue: number) => {
    setFormData({ ...formData, Gender: genderValue });
    setGenderDropdownVisible(false);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <PremiumGuestGate screenType="profile" />;
  }

  return (
    <View style={styles.mainContainer}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HERO PASSPORT HEADER */}
        <MotiView
          from={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "timing", duration: 450 }}
          style={styles.identityWrapper}
        >
          <View style={styles.avatarOuterRing}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person-outline" size={36} color="#FFFFFF" />
            </View>
          </View>
          <View style={styles.identityCard}>
            <Text style={styles.nameValue}>
              {user?.UserName || "Guest Profile"}
            </Text>
            <Text style={styles.emailValue}>
              {profile?.Email || "no-email-linked@domain.com"}
            </Text>
            <TouchableOpacity
              style={styles.pointsPill}
              onPress={() => router.push("/(refNull)/rewards")}
              accessibilityRole="button"
              accessibilityLabel="Your reward points"
            >
              <Ionicons name="star" size={14} color="#B45309" />
              <Text style={styles.pointsPillText}>
                {Number(profile?.EarnedRewardPoints) || 0} reward points
              </Text>
            </TouchableOpacity>
          </View>
        </MotiView>

        {/* METRIC INFORMATION BLOCK */}
        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 400, delay: 100 }}
          style={styles.sectionCard}
        >
          <Text style={styles.sectionLabelSummary}>Personal Matrix</Text>

          {/* Full Name Input Block */}
          <View style={styles.inputContainerField}>
            <Text style={styles.fieldHeaderLabel}>Full Name</Text>
            <View
              style={[
                styles.interactiveInputRow,
                isEditing && styles.activeEditingFrame,
                errors.fullName && styles.errorFrameHighlight,
              ]}
            >
              <Ionicons
                name="person-outline"
                size={18}
                color="#0284C7"
                style={styles.leadingRowIcon}
              />
              <TextInput
                style={[
                  styles.coreInputField,
                  !isEditing && styles.lockedInputText,
                ]}
                value={formData.FullName || ""}
                editable={isEditing}
                onChangeText={(txt) => {
                  setFormData({ ...formData, FullName: txt });
                  if (errors.fullName)
                    setErrors({ ...errors, fullName: undefined });
                }}
                placeholder="Enter Full Name"
                placeholderTextColor="#94A3B8"
              />
            </View>
            {errors.fullName && (
              <Text style={styles.inlineErrorFeedback}>{errors.fullName}</Text>
            )}
          </View>

          {/* Locked/Immutable Country Selection Architecture */}
          <View style={styles.inputContainerField}>
            <Text style={styles.fieldHeaderLabel}>Country</Text>
            <TouchableOpacity
              style={[
                styles.interactiveInputRow,
                isEditing && styles.activeEditingFrame,
                errors.country && styles.errorFrameHighlight,
              ]}
              disabled={!isEditing}
              onPress={() => setCountryDropdownVisible(true)}
            >
              <Ionicons
                name="globe-outline"
                size={18}
                color="#0284C7"
                style={styles.leadingRowIcon}
              />
              <Text
                style={[
                  styles.coreInputFieldCountry,
                  !isEditing && styles.lockedInputText,
                  !formData.Country && { color: "#94A3B8" },
                ]}
              >
                {formData.Country || "Select your country location"}
              </Text>
              {isEditing && (
                <Ionicons
                  name="chevron-down"
                  size={16}
                  color="#64748B"
                  style={{ marginLeft: "auto" }}
                />
              )}
            </TouchableOpacity>
            {errors.country && (
              <Text style={styles.inlineErrorFeedback}>{errors.country}</Text>
            )}
          </View>

          {/* Contextual Phone Code Suffix Mapping */}
          <View style={styles.inputContainerField}>
            <Text style={styles.fieldHeaderLabel}>Phone Number</Text>
            <View
              style={[
                styles.interactiveInputRow,
                isEditing && styles.activeEditingFrame,
                errors.phone && styles.errorFrameHighlight,
              ]}
            >
              <Ionicons
                name="call-outline"
                size={18}
                color="#0284C7"
                style={styles.leadingRowIcon}
              />

              {formData.Country && (
                <View style={styles.countryCodeBadge}>
                  <Text style={styles.countryCodeText}>
                    {formData.Country === "Pakistan" ? "+92" : "+44"}
                  </Text>
                </View>
              )}

              <TextInput
                style={[
                  styles.coreInputField,
                  !isEditing && styles.lockedInputText,
                ]}
                value={formData.PhoneNumber || ""}
                editable={isEditing && !!formData.Country}
                keyboardType="number-pad"
                onChangeText={(txt) => {
                  setFormData({ ...formData, PhoneNumber: txt });
                  if (errors.phone) setErrors({ ...errors, phone: undefined });
                }}
                placeholder={
                  formData.Country
                    ? formData.Country === "Pakistan"
                      ? "3xxxxxxxxx"
                      : "7xxxxxxxxx"
                    : "Select Country First"
                }
                placeholderTextColor="#94A3B8"
              />
            </View>
            {errors.phone && (
              <Text style={styles.inlineErrorFeedback}>{errors.phone}</Text>
            )}
          </View>

          {/* NEW FIELD: Date of Birth (DOB) Picker Architecture */}
          <View style={styles.inputContainerField}>
            <Text style={styles.fieldHeaderLabel}>Date of Birth</Text>
            <TouchableOpacity
              style={[
                styles.interactiveInputRow,
                isEditing && styles.activeEditingFrame,
                errors.dob && styles.errorFrameHighlight,
              ]}
              disabled={!isEditing}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons
                name="calendar-outline"
                size={18}
                color="#0284C7"
                style={styles.leadingRowIcon}
              />
              <Text
                style={[
                  styles.coreInputFieldCountry, // Uses text layout styling instead of TextInput
                  !isEditing && styles.lockedInputText,
                  !formData.DOB && { color: "#94A3B8" },
                ]}
              >
                {formData.DOB
                  ? formData.DOB.substring(0, 10)
                  : "Select Date of Birth"}
              </Text>
            </TouchableOpacity>
            {errors.dob && (
              <Text style={styles.inlineErrorFeedback}>{errors.dob}</Text>
            )}
          </View>

          {/* NATIVE CALENDAR INTERFACE LAYER */}
          {showDatePicker && (
            <DateTimePicker
              value={formData.DOB ? new Date(formData.DOB) : new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              maximumDate={new Date()} // Hardware protection: Prevents picking future dates in the calendar UI
              onChange={(event, selectedDate) => {
                // Hide the picker instantly for Android
                if (Platform.OS !== "ios") {
                  setShowDatePicker(false);
                }

                if (event.type === "set" && selectedDate) {
                  // Formats to YYYY-MM-DD cleanly using local date boundaries
                  const formattedDate = selectedDate
                    .toISOString()
                    .split("T")[0];
                  setFormData({ ...formData, DOB: formattedDate });
                  if (errors.dob) setErrors({ ...errors, dob: undefined });
                } else if (event.type === "dismissed") {
                  setShowDatePicker(false);
                }
              }}
            />
          )}

          {/* iOS Specific Confirmation Controls Layer */}
          {Platform.OS === "ios" && showDatePicker && (
            <TouchableOpacity
              style={{
                alignSelf: "center",
                padding: 10,
                backgroundColor: "#E2E8F0",
                marginTop: 4,
                borderRadius: 8,
              }}
              onPress={() => setShowDatePicker(false)}
            >
              <Text
                style={{
                  color: "#0284C7",
                  fontWeight: "600",
                  textAlign: "center",
                }}
              >
                Confirm Date Selection
              </Text>
            </TouchableOpacity>
          )}

          {/* NEW FIELD: Gender Selector Dropdown Architecture */}
          <View style={styles.inputContainerField}>
            <Text style={styles.fieldHeaderLabel}>Gender</Text>
            <TouchableOpacity
              style={[
                styles.interactiveInputRow,
                isEditing && styles.activeEditingFrame,
              ]}
              disabled={!isEditing}
              onPress={() => setGenderDropdownVisible(true)}
            >
              <Ionicons
                name="transgender-outline"
                size={18}
                color="#0284C7"
                style={styles.leadingRowIcon}
              />
              <Text
                style={[
                  styles.coreInputFieldCountry,
                  !isEditing && styles.lockedInputText,
                ]}
              >
                {getGenderLabel(formData.Gender)}
              </Text>
              {isEditing && (
                <Ionicons
                  name="chevron-down"
                  size={16}
                  color="#64748B"
                  style={{ marginLeft: "auto" }}
                />
              )}
            </TouchableOpacity>
          </View>

          {/* ACTIONS INTERACTION ROWS */}
          {isEditing ? (
            <View style={styles.btnEditStyle}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setFormData(profile || {});
                  setErrors({});
                  setIsEditing(false);
                }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={onSave}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.btnText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => setIsEditing(true)}
            >
              <Ionicons name="create-outline" size={18} color="#FFFFFF" />
              <Text style={styles.btnText}>Update Profile Settings</Text>
            </TouchableOpacity>
          )}
        </MotiView>

        {/* REVIEWS LOGGER ELEMENT */}
        <MotiView
          from={{ opacity: 0, translateY: 15 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 400, delay: 200 }}
          style={styles.buttonContainer}
        >
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Contributions</Text>
            <TouchableOpacity
              onPress={() => router.push("/(refNull)/all-reviews")}
              style={styles.viewAllTouchTarget}
            >
              <Text style={styles.viewAllText}>View All</Text>
              <Ionicons name="chevron-forward" size={14} color="#0284C7" />
            </TouchableOpacity>
          </View>

          {reviewsLoading ? (
            <View style={styles.reviewLoaderFrame}>
              <ActivityIndicator color="#0284C7" size="small" />
            </View>
          ) : reviews.length > 0 ? (
            reviews
              .slice(0, 3)
              .map((item: any) => (
                <ReviewItem key={item.ProductId} item={item} />
              ))
          ) : (
            <View style={styles.emptyReviews}>
              <Ionicons
                name="chatbox-ellipses-outline"
                size={32}
                color="#94A3B8"
              />
              <Text style={styles.emptyText}>
                Your editorial item reviews or feedback logs will populate here.
              </Text>
            </View>
          )}

          {/* REWARDS: vouchers, membership level and invite friends */}
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => router.push("/(refNull)/rewards")}
            accessibilityRole="button"
          >
            <Ionicons name="gift-outline" size={18} color="#1E293B" />
            <Text style={styles.settingsBtnText}>Rewards & Vouchers</Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color="#94A3B8"
              style={styles.rightChevronTrailing}
            />
          </TouchableOpacity>

          {/* RETURNS and GIFT CARDS */}
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => router.push("/(refNull)/returns")}
            accessibilityRole="button"
          >
            <Ionicons name="return-down-back-outline" size={18} color="#1E293B" />
            <Text style={styles.settingsBtnText}>My Returns</Text>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" style={styles.rightChevronTrailing} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => router.push("/(refNull)/gift-cards")}
            accessibilityRole="button"
          >
            <Ionicons name="wallet-outline" size={18} color="#1E293B" />
            <Text style={styles.settingsBtnText}>Gift Cards</Text>
            <Ionicons name="chevron-forward" size={16} color="#94A3B8" style={styles.rightChevronTrailing} />
          </TouchableOpacity>

          {/* PRIVACY: consent choices and data export */}
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => router.push("/(refNull)/privacy")}
            accessibilityRole="button"
          >
            <Ionicons name="shield-checkmark-outline" size={18} color="#1E293B" />
            <Text style={styles.settingsBtnText}>Privacy & Data</Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color="#94A3B8"
              style={styles.rightChevronTrailing}
            />
          </TouchableOpacity>

          {/* UTILITY PREFERENCE AND SYSTEM TERMINATION FLOWS */}
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => router.push("/(refNull)/settings")}
          >
            <Ionicons name="settings-outline" size={18} color="#1E293B" />
            <Text style={styles.settingsBtnText}>Account Settings</Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color="#94A3B8"
              style={styles.rightChevronTrailing}
            />
          </TouchableOpacity>
        </MotiView>
      </ScrollView>

      {/* DROPDOWN REGIONAL INTERFACE MODAL */}
      <Modal visible={countryDropdownVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.dropdownModalOverlay}
          activeOpacity={1}
          onPress={() => setCountryDropdownVisible(false)}
        >
          <View style={styles.dropdownCardContainer}>
            <Text style={styles.dropdownTitleLabel}>Select Region Context</Text>
            <TouchableOpacity
              style={styles.dropdownOptionRow}
              onPress={() => handleCountrySelect("Pakistan")}
            >
              <Text style={styles.dropdownOptionText}>Pakistan (+92)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dropdownOptionRow}
              onPress={() => handleCountrySelect("United Kingdom")}
            >
              <Text style={styles.dropdownOptionText}>
                United Kingdom (+44)
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      <Modal visible={genderDropdownVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.dropdownModalOverlay}
          activeOpacity={1}
          onPress={() => setGenderDropdownVisible(false)}
        >
          <View style={styles.dropdownCardContainer}>
            <Text style={styles.dropdownTitleLabel}>Select Gender</Text>
            <TouchableOpacity
              style={styles.dropdownOptionRow}
              onPress={() => handleGenderSelect(1)}
            >
              <Text style={styles.dropdownOptionText}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dropdownOptionRow}
              onPress={() => handleGenderSelect(2)}
            >
              <Text style={styles.dropdownOptionText}>Female</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* SUCCESS POPUP MODAL */}
      <Modal visible={successModalVisible} transparent animationType="fade">
        <View style={styles.successModalOverlay}>
          <View style={styles.successCard}>
            <View style={styles.successBadgeCircle}>
              <Ionicons name="shield-checkmark" size={32} color="#10B981" />
            </View>
            <Text style={styles.successModalTitle}>Matrix Synchronized</Text>
            <Text style={styles.successModalBody}>
              Your personal profile identity and verified tracking dimensions
              have updated accurately within our backend cluster database core
              layers.
            </Text>
            <TouchableOpacity
              style={styles.successDismissBtn}
              onPress={() => setSuccessModalVisible(false)}
            >
              <Text style={styles.successDismissBtnText}>ACKNOWLEDGE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {profileMessage && (
        <CustomErrorMessage>{profileMessage}</CustomErrorMessage>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#FFFFFF" },
  scrollContent: { padding: 20, paddingBottom: 60, backgroundColor: "#F8FAFC" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  identityWrapper: {
    alignItems: "center",
    width: "100%",
    marginTop: 24,
    marginBottom: 20,
  },

  avatarOuterRing: { zIndex: 10, position: "relative" },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#0284C7",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  identityCard: {
    backgroundColor: "#FFFFFF",
    width: "100%",
    marginTop: -45,
    paddingTop: 65,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  nameValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  pointsPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "center",
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#FEF3C7",
  },
  pointsPillText: { fontSize: 12.5, fontWeight: "700", color: "#92400E" },
  emailValue: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "500",
    marginTop: 4,
  },

  // High-fidelity Input Form Framework
  inputContainerField: { marginBottom: 18, width: "100%" },
  fieldHeaderLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 6,
    paddingLeft: 2,
  },
  interactiveInputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    height: 54,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
  },
  activeEditingFrame: { borderColor: "#0284C7", backgroundColor: "#F8FAFC" },
  errorFrameHighlight: { borderColor: "#EF4444", backgroundColor: "#FEF2F2" },
  leadingRowIcon: { marginRight: 10 },
  coreInputField: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "600",
    height: "100%",
  },
  coreInputFieldCountry: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "600",
  },
  lockedInputText: { color: "#64748B" },
  inlineErrorFeedback: {
    fontSize: 11,
    color: "#EF4444",
    fontWeight: "600",
    marginTop: 5,
    paddingLeft: 4,
  },

  // Country Code Badge Box
  countryCodeBadge: {
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  countryCodeText: { color: "#0284C7", fontWeight: "700", fontSize: 13 },

  // Dropdown Layout Modal Styles
  dropdownModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownCardContainer: {
    width: "85%",
    maxWidth: 320,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    elevation: 5,
  },
  dropdownTitleLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 14,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dropdownOptionRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  dropdownOptionText: { fontSize: 15, fontWeight: "600", color: "#334155" },

  // Success Modal Design Frameworks
  successModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  successCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 26,
    alignItems: "center",
  },
  successBadgeCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  successModalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
  },
  successModalBody: {
    fontSize: 13,
    color: "#475569",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 22,
  },
  successDismissBtn: {
    width: "100%",
    height: 48,
    borderRadius: 12,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
  },
  successDismissBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: 0.5,
  },

  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  sectionLabelSummary: {
    fontSize: 11,
    fontWeight: "800",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 16,
  },
  buttonContainer: { width: "100%" },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.2,
  },
  viewAllTouchTarget: { flexDirection: "row", alignItems: "center", gap: 2 },
  viewAllText: { fontSize: 13, color: "#0284C7", fontWeight: "700" },
  reviewLoaderFrame: { padding: 32, alignItems: "center" },
  emptyReviews: {
    padding: 24,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    gap: 8,
  },
  emptyText: {
    color: "#64748B",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
  btnEditStyle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    gap: 12,
  },
  editBtn: {
    flexDirection: "row",
    backgroundColor: "#0284C7",
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: "#10B981",
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelBtn: {
    flex: 1,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EF4444",
    borderRadius: 14,
  },
  btnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  cancelBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  settingsBtn: {
    flexDirection: "row",
    height: 54,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 12,
  },
  settingsBtnText: {
    color: "#1E293B",
    fontWeight: "700",
    fontSize: 14,
    flex: 1,
  },
  rightChevronTrailing: { marginLeft: "auto" },

  // Custom Disconnection Actions
  logoutBtnAction: {
    flexDirection: "row",
    height: 54,
    borderRadius: 16,
    backgroundColor: "#FEF2F2",
    borderWidth: 1.5,
    borderColor: "#FEE2E2",
    alignItems: "center",
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 12,
  },
  logoutBtnText: { color: "#EF4444", fontWeight: "700", fontSize: 14, flex: 1 },
});
