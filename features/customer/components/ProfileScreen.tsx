import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { useProfile } from "../hooks/useProfile";
import { Colors } from "../../../constants/Theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ErrorMessage } from "@/components/ErrorMessage";
import { useReviews } from "../hooks/useReviews";
import { ReviewItem } from "./ReviewItem";

export const ProfileScreen = () => {
  const router = useRouter();
  const {
    profile,
    loading,
    updating,
    handleUpdate,
    isEditing,
    setIsEditing,
    apiMessage,
  } = useProfile();
  const { reviews, loading: reviewsLoading } = useReviews();
  // Local state for editing fields
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (profile) setFormData(profile);
  }, [profile]);

  const onSave = async () => {
    const result = await handleUpdate(formData);
    if (result.success) {
      Alert.alert("Success", "Profile updated successfully");
    } else {
      Alert.alert("Error", result.error);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.headerOne[0]} />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      {apiMessage && <ErrorMessage>{apiMessage}</ErrorMessage>}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.identityWrapper}>
          {/* THE OVERLAPPING ICON */}
          <View style={styles.iconOverlapContainer}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={40} color={Colors.white} />
            </View>
          </View>

          <View style={styles.identityCard}>
            {isEditing ? (
              <TextInput
                style={styles.editInput}
                value={formData.FullName}
                onChangeText={(txt) =>
                  setFormData({ ...formData, FullName: txt })
                }
                placeholder="Enter Full Name"
              />
            ) : (
              <Text style={styles.nameValue}>{profile?.FullName}</Text>
            )}

            {/* <Text style={styles.emailValue}>{profile?.Email}</Text> */}
            <Text style={styles.emailValue}>thelink@gmail.com</Text>
          </View>
        </View>
        {/* DETAILS SECTION */}
        <View style={styles.sectionCard}>
          <DetailItem
            icon="call-outline"
            label="Phone Number"
            value={formData.PhoneNumber}
            isEditing={isEditing}
            onChange={(txt: string) =>
              setFormData({ ...formData, PhoneNumber: txt })
            }
          />
          <DetailItem
            icon="globe-outline"
            label="Country"
            value={formData.Country}
            isEditing={isEditing}
            onChange={(txt: string) =>
              setFormData({ ...formData, Country: txt })
            }
          />
          <View style={styles.rewardRow}>
            <Ionicons name="trophy-outline" size={20} color="#EAB308" />
            <Text style={styles.rewardText}>
              Earned Reward Points:{" "}
              <Text style={styles.points}>
                {profile?.EarnedRewardPoints ?? 0} pts
              </Text>
            </Text>
          </View>

          {isEditing ? (
            <View style={styles.btnEditStyle}>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={onSave}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnText}>Save</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setIsEditing(false)}
              >
                <Text style={[styles.btnText, { color: Colors.white }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => setIsEditing(true)}
            >
              <Ionicons name="create-outline" size={20} color="#fff" />
              <Text style={styles.btnText}>Update Profile</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ACTION BUTTONS */}
        <View style={styles.buttonContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Reviews</Text>
            <TouchableOpacity
              onPress={() => router.push("/refNull/all-reviews")}
            >
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {reviewsLoading ? (
            <ActivityIndicator color={Colors.primary} />
          ) : reviews.length > 0 ? (
            reviews
              .slice(0, 3)
              .map((item: any) => (
                <ReviewItem key={item.ProductId} item={item} />
              ))
          ) : (
            <View style={styles.emptyReviews}>
              <Text style={styles.emptyText}>
                You haven't posted any reviews yet.
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => router.push("/refNull/settings")}
          >
            <Ionicons
              name="settings-outline"
              size={20}
              color={Colors.headerOne[0]}
            />
            <Text style={styles.settingsBtnText}>Account Settings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const DetailItem = ({ icon, label, value, isEditing, onChange }: any) => (
  <View style={styles.detailItem}>
    <View style={styles.iconBox}>
      <Ionicons name={icon} size={22} color={Colors.headerOne[0]} />
    </View>
    <View style={styles.detailText}>
      <Text style={styles.detailLabel}>{label}</Text>
      {isEditing ? (
        <TextInput
          style={styles.detailInput}
          value={value}
          onChangeText={onChange}
        />
      ) : (
        <Text style={styles.detailValue}>{value || "Not set"}</Text>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    padding: 20,
    // Add this to ensure content clears the floating tab bar
    paddingBottom: 120,
  },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },

  identityWrapper: {
    marginTop: 40, // Space for the half-out icon
    marginBottom: 20,
    alignItems: "center",
    width: "100%",
  },
  iconOverlapContainer: {
    position: "absolute",
    top: -40, // Half of the avatar height (80/2)
    zIndex: 10,
    // Shadow for the icon to make it pop
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.headerOne[0],
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: Colors.white, // Professional white ring around the icon
  },
  identityCard: {
    backgroundColor: Colors.white,
    width: "100%",
    paddingTop: 50, // Extra padding to clear the icon
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: "center",
    // THE 4px TOP BORDER
    borderTopWidth: 4,
    borderTopColor: Colors.primary, // Or use a specific accent color
    // Professional Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  nameValue: {
    fontSize: 18, // Reduced size as requested
    fontWeight: "700",
    color: Colors.textMain,
    marginTop: 5,
  },
  emailValue: {
    fontSize: 13,
    color: Colors.tertiary,
    marginTop: 2,
  },
  editInput: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.headerOne[0],
    borderBottomWidth: 1,
    borderColor: Colors.primary,
    width: "80%",
    textAlign: "center",
    paddingVertical: 2,
  },

  nameLabel: {
    fontSize: 12,
    color: Colors.tertiary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  sectionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 15,
    marginBottom: 25,
  },
  detailItem: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  iconBox: {
    width: 45,
    height: 45,
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  detailText: { marginLeft: 15, flex: 1 },
  detailLabel: { fontSize: 12, color: Colors.tertiary },
  detailValue: { fontSize: 16, fontWeight: "600", color: Colors.textMain },
  detailInput: {
    fontSize: 16,
    borderBottomWidth: 1,
    borderColor: "#CBD5E1",
    color: Colors.headerOne[0],
    paddingVertical: 2,
  },

  rewardRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEFCE8",
    padding: 12,
    marginBottom: 25,
    borderRadius: 12,
  },
  rewardText: { marginLeft: 10, fontSize: 14, color: "#854D0E" },
  points: { fontWeight: "800" },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 15,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: Colors.textMain },
  viewAllText: { fontSize: 13, color: Colors.primary, fontWeight: "600" },
  emptyReviews: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  emptyText: { color: Colors.tertiary, fontSize: 13 },

  // Buttons
  buttonContainer: {
    marginTop: 10,
    paddingHorizontal: 10,
  },
  btnEditStyle: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  editBtn: {
    flexDirection: "row",
    backgroundColor: Colors.accent,
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  saveBtn: {
    backgroundColor: "#10B981",
    height: 55,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    width: "40%",
  },
  cancelBtn: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.error,
    borderRadius: 12,
    width: "40%",
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  settingsBtn: {
    flexDirection: "row",
    height: 55,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.headerOne[0],
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    gap: 8,
  },
  settingsBtnText: { color: Colors.headerOne[0], fontWeight: "700" },
});
