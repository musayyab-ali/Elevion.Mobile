// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ActivityIndicator,
//   ScrollView,
//   TouchableOpacity,
//   TextInput,
//   Alert,
//   Dimensions,
// } from "react-native";
// import { MotiView } from "moti";
// import { useProfile } from "../hooks/useProfile";
// import { Colors } from "../../../constants/Theme";
// import { Ionicons } from "@expo/vector-icons";
// import { useRouter } from "expo-router";
// import { CustomErrorMessage } from "@/components/CustomErrorMessage";
// import { useReviews } from "../hooks/useReviews";
// import { ReviewItem } from "./ReviewItem";
// import { useAuth } from "@/store/AuthContext";
// import { PremiumGuestGate } from "@/components/PremiumGuestGate";

// const { width } = Dimensions.get("window");

// export const ProfileScreen = () => {
//   const { isAuthenticated, user } = useAuth();
//   const router = useRouter();
//   const {
//     profile,
//     loading,
//     updating,
//     handleUpdate,
//     isEditing,
//     setIsEditing,
//     profileMessage,
//     setProfileMessage,
//   } = useProfile();

//   const { reviews, loading: reviewsLoading } = useReviews();
//   const [formData, setFormData] = useState<any>({});

//   useEffect(() => {
//     if (profile) setFormData(profile);
//   }, [profile]);

//   const onSave = async () => {
//     setProfileMessage(null);
//     try {
//       const result = await handleUpdate(formData);
//       if (!result || !result.success) {
//         const apiError =
//           result?.message || "Could not update profile. Please try again.";
//         setProfileMessage(apiError);
//         return;
//       }
//       Alert.alert("Success", "Profile details updated successfully.");
//     } catch (err) {
//       console.log("Error while updating profile:", err);
//       setProfileMessage("Network error. Please check your connection.");
//     } finally {
//       setTimeout(() => setProfileMessage(null), 4000);
//     }
//   };

//   if (loading) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="small" color="#0284C7" />
//       </View>
//     );
//   }

//   if (!isAuthenticated) {
//     return <PremiumGuestGate screenType="profile" />;
//   }

//   return (
//     <View style={styles.mainContainer}>
//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={styles.scrollContent}
//       >
//         {/* HERO PASSPORT HEADER */}
//         <MotiView
//           from={{ opacity: 0, scale: 0.95 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ type: "timing", duration: 450 }}
//           style={styles.identityWrapper}
//         >
//           <View style={styles.avatarOuterRing}>
//             <View style={styles.avatarCircle}>
//               <Ionicons name="person-outline" size={36} color="#FFFFFF" />
//             </View>
//             {isEditing && (
//               <View style={styles.avatarEditBadge}>
//                 <Ionicons name="camera" size={12} color="#FFFFFF" />
//               </View>
//             )}
//           </View>

//           {/* <View style={styles.identityCard}>
//             {isEditing ? (
//               <View style={styles.editingInputWrapper}>
//                 <TextInput
//                   style={styles.editInput}
//                   value={formData.FullName}
//                   onChangeText={(txt) =>
//                     setFormData({ ...formData, FullName: txt })
//                   }
//                   placeholder="Enter Full Name"
//                   placeholderTextColor="#94A3B8"
//                   selectionColor="#0284C7"
//                 />
//                 <Ionicons
//                   name="pencil"
//                   size={14}
//                   color="#0284C7"
//                   style={styles.inputInnerIcon}
//                 />
//               </View>
//             ) : (
//               <Text style={styles.nameValue}>
//                 {profile?.FullName || "Guest Profile"}
//               </Text>
//             )}
//             <Text style={styles.emailValue}>
//               {profile?.Email || "no-email-linked@domain.com"}
//             </Text>
//           </View> */}
//           <View style={styles.identityCard}>
//             <Text style={styles.nameValue}>
//               {user?.UserName || "Guest Profile"}
//             </Text>
//             <Text style={styles.emailValue}>
//               {profile?.Email || "no-email-linked@domain.com"}
//             </Text>
//           </View>
//         </MotiView>

//         {/* METRIC INFORMATION BLOCK */}
//         <MotiView
//           from={{ opacity: 0, translateY: 15 }}
//           animate={{ opacity: 1, translateY: 0 }}
//           transition={{ type: "timing", duration: 400, delay: 100 }}
//           style={styles.sectionCard}
//         >
//           <Text style={styles.sectionLabelSummary}>Personal Matrix</Text>
//           <DetailItem
//             icon="user-outline"
//             label="Full Name"
//             value={formData.FullName}
//             isEditing={isEditing}
//             keyboardType="phone-pad"
//             onChange={(txt: string) =>
//               setFormData({ ...formData, FullName: txt })
//             }
//           />

//           <DetailItem
//             icon="call-outline"
//             label="Phone Number"
//             value={formData.PhoneNumber}
//             isEditing={isEditing}
//             keyboardType="phone-pad"
//             onChange={(txt: string) =>
//               setFormData({ ...formData, PhoneNumber: txt })
//             }
//           />

//           <DetailItem
//             icon="globe-outline"
//             label="Country"
//             value={formData.Country}
//             isEditing={isEditing}
//             onChange={(txt: string) =>
//               setFormData({ ...formData, Country: txt })
//             }
//           />

//           {/* LOYALTY MILESTONE PRESETS */}
//           <View style={styles.rewardRow}>
//             <View style={styles.rewardIconFrame}>
//               <Ionicons name="trophy" size={18} color="#CA8A04" />
//             </View>
//             <View style={styles.rewardTextFrame}>
//               <Text style={styles.rewardLabel}>Loyalty Tiers Balance</Text>
//               <Text style={styles.rewardText}>
//                 Earned Reward Points:{" "}
//                 <Text style={styles.points}>
//                   {profile?.EarnedRewardPoints ?? 0} pts
//                 </Text>
//               </Text>
//             </View>
//           </View>

//           {/* CORE UPDATE PROFILE INTERACTIONS */}
//           {isEditing ? (
//             <View style={styles.btnEditStyle}>
//               <TouchableOpacity
//                 style={styles.cancelBtn}
//                 activeOpacity={0.8}
//                 onPress={() => {
//                   setFormData(profile || {});
//                   setIsEditing(false);
//                 }}
//               >
//                 <Text style={styles.cancelBtnText}>Cancel</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={styles.saveBtn}
//                 activeOpacity={0.8}
//                 onPress={onSave}
//                 disabled={updating}
//               >
//                 {updating ? (
//                   <ActivityIndicator color="#FFFFFF" size="small" />
//                 ) : (
//                   <Text style={styles.btnText}>Save Changes</Text>
//                 )}
//               </TouchableOpacity>
//             </View>
//           ) : (
//             <TouchableOpacity
//               style={styles.editBtn}
//               activeOpacity={0.85}
//               onPress={() => setIsEditing(true)}
//             >
//               <Ionicons name="create-outline" size={18} color="#FFFFFF" />
//               <Text style={styles.btnText}>Update Profile Settings</Text>
//             </TouchableOpacity>
//           )}
//         </MotiView>

//         {/* FEEDBACK REVIEWS CAROUSEL CONTAINER */}
//         <MotiView
//           from={{ opacity: 0, translateY: 15 }}
//           animate={{ opacity: 1, translateY: 0 }}
//           transition={{ type: "timing", duration: 400, delay: 200 }}
//           style={styles.buttonContainer}
//         >
//           <View style={styles.sectionHeader}>
//             <Text style={styles.sectionTitle}>Recent Contributions</Text>
//             <TouchableOpacity
//               activeOpacity={0.7}
//               onPress={() => router.push("/refNull/all-reviews")}
//               style={styles.viewAllTouchTarget}
//             >
//               <Text style={styles.viewAllText}>View All</Text>
//               <Ionicons name="chevron-forward" size={14} color="#0284C7" />
//             </TouchableOpacity>
//           </View>

//           {reviewsLoading ? (
//             <View style={styles.reviewLoaderFrame}>
//               <ActivityIndicator color="#0284C7" size="small" />
//             </View>
//           ) : reviews.length > 0 ? (
//             reviews
//               .slice(0, 3)
//               .map((item: any) => (
//                 <ReviewItem key={item.ProductId} item={item} />
//               ))
//           ) : (
//             <View style={styles.emptyReviews}>
//               <Ionicons
//                 name="chatbox-ellipses-outline"
//                 size={32}
//                 color="#94A3B8"
//               />
//               <Text style={styles.emptyText}>
//                 Your editorial item reviews or feedback logs will populate here.
//               </Text>
//             </View>
//           )}

//           {/* UTILITY CORE SETTINGS TERMINAL NAVIGATION TARGET */}
//           <TouchableOpacity
//             style={styles.settingsBtn}
//             activeOpacity={0.8}
//             onPress={() => router.push("/refNull/settings")}
//           >
//             <Ionicons name="settings-outline" size={18} color="#1E293B" />
//             <Text style={styles.settingsBtnText}>
//               Account Preference Management
//             </Text>
//             <Ionicons
//               name="chevron-forward"
//               size={16}
//               color="#94A3B8"
//               style={styles.rightChevronTrailing}
//             />
//           </TouchableOpacity>
//         </MotiView>
//       </ScrollView>

//       {profileMessage && (
//         <CustomErrorMessage>{profileMessage}</CustomErrorMessage>
//       )}
//     </View>
//   );
// };

// const DetailItem = ({
//   icon,
//   label,
//   value,
//   isEditing,
//   onChange,
//   keyboardType = "default",
// }: any) => (
//   <View style={[styles.detailItem, isEditing && styles.detailItemEditing]}>
//     <View style={styles.iconBox}>
//       <Ionicons name={icon} size={18} color="#0284C7" />
//     </View>
//     <View style={styles.detailText}>
//       <Text style={styles.detailLabel}>{label}</Text>
//       {isEditing ? (
//         <TextInput
//           style={styles.detailInput}
//           value={value}
//           onChangeText={onChange}
//           keyboardType={keyboardType}
//           selectionColor="#0284C7"
//         />
//       ) : (
//         <Text style={styles.detailValue}>{value || "Unconfigured Value"}</Text>
//       )}
//     </View>
//   </View>
// );

// const styles = StyleSheet.create({
//   mainContainer: {
//     flex: 1,
//     backgroundColor: "#FFFFFF",
//   },
//   scrollContent: {
//     padding: 20,
//     paddingBottom: 60,
//     backgroundColor: "#F8FAFC", // Sleek modern surface canvas background
//   },
//   centered: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#F8FAFC",
//   },
//   identityWrapper: {
//     alignItems: "center",
//     width: "100%",
//     marginTop: 24,
//     marginBottom: 20,
//   },
//   avatarOuterRing: {
//     zIndex: 10,
//     position: "relative",
//     shadowColor: "#0F172A",
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.12,
//     shadowRadius: 12,
//     elevation: 8,
//   },
//   avatarCircle: {
//     width: 90,
//     height: 90,
//     borderRadius: 45,
//     backgroundColor: "#0284C7", // Explicit deep brand tone alignment
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 4,
//     borderColor: "#FFFFFF",
//   },
//   avatarEditBadge: {
//     position: "absolute",
//     bottom: 2,
//     right: 2,
//     backgroundColor: "#0F172A",
//     width: 26,
//     height: 26,
//     borderRadius: 13,
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 2,
//     borderColor: "#FFFFFF",
//   },
//   identityCard: {
//     backgroundColor: "#FFFFFF",
//     width: "100%",
//     marginTop: -45,
//     paddingTop: 65,
//     paddingBottom: 24,
//     paddingHorizontal: 24,
//     borderRadius: 24,
//     alignItems: "center",
//     shadowColor: "#0F172A",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.04,
//     shadowRadius: 16,
//     elevation: 2,
//     borderWidth: 1,
//     borderColor: "#F1F5F9",
//   },
//   nameValue: {
//     fontSize: 20,
//     fontWeight: "800",
//     color: "#0F172A",
//     letterSpacing: -0.3,
//   },
//   emailValue: {
//     fontSize: 13,
//     color: "#64748B",
//     fontWeight: "500",
//     marginTop: 4,
//   },
//   editingInputWrapper: {
//     width: "90%",
//     position: "relative",
//     justifyContent: "center",
//   },
//   editInput: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: "#0F172A",
//     backgroundColor: "#F1F5F9",
//     borderRadius: 10,
//     width: "100%",
//     textAlign: "center",
//     paddingVertical: 8,
//     paddingHorizontal: 32,
//   },
//   inputInnerIcon: {
//     position: "absolute",
//     right: 12,
//   },
//   sectionCard: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 24,
//     padding: 20,
//     marginBottom: 20,
//     shadowColor: "#0F172A",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.04,
//     shadowRadius: 16,
//     elevation: 2,
//     borderWidth: 1,
//     borderColor: "#F1F5F9",
//   },
//   sectionLabelSummary: {
//     fontSize: 11,
//     fontWeight: "800",
//     color: "#94A3B8",
//     textTransform: "uppercase",
//     letterSpacing: 1.2,
//     marginBottom: 16,
//   },
//   detailItem: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: 16,
//     padding: 4,
//   },
//   detailItemEditing: {
//     backgroundColor: "#F8FAFC",
//     borderRadius: 14,
//     padding: 10,
//     borderWidth: 1,
//     borderColor: "#E2E8F0",
//   },
//   iconBox: {
//     width: 40,
//     height: 40,
//     backgroundColor: "#F0F9FF",
//     borderRadius: 12,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   detailText: {
//     marginLeft: 14,
//     flex: 1,
//   },
//   detailLabel: {
//     fontSize: 11,
//     color: "#64748B",
//     fontWeight: "600",
//     textTransform: "uppercase",
//     letterSpacing: 0.5,
//   },
//   detailValue: {
//     fontSize: 15,
//     fontWeight: "700",
//     color: "#1E293B",
//     marginTop: 2,
//   },
//   detailInput: {
//     fontSize: 15,
//     color: "#0F172A",
//     fontWeight: "700",
//     paddingVertical: 2,
//     borderBottomWidth: 1,
//     borderColor: "#0284C7",
//     marginTop: 2,
//   },
//   rewardRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#FEFCE8",
//     padding: 14,
//     marginVertical: 12,
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: "#FEF08A",
//   },
//   rewardIconFrame: {
//     width: 32,
//     height: 32,
//     borderRadius: 10,
//     backgroundColor: "#FEF08A",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   rewardTextFrame: {
//     marginLeft: 12,
//     flex: 1,
//   },
//   rewardLabel: {
//     fontSize: 11,
//     fontWeight: "700",
//     color: "#A16207",
//     textTransform: "uppercase",
//     letterSpacing: 0.5,
//   },
//   rewardText: {
//     fontSize: 13,
//     color: "#854D0E",
//     fontWeight: "500",
//     marginTop: 1,
//   },
//   points: {
//     fontWeight: "800",
//     color: "#A16207",
//   },
//   buttonContainer: {
//     width: "100%",
//   },
//   sectionHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 14,
//     paddingHorizontal: 4,
//   },
//   sectionTitle: {
//     fontSize: 16,
//     fontWeight: "800",
//     color: "#0F172A",
//     letterSpacing: -0.2,
//   },
//   viewAllTouchTarget: {
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 2,
//   },
//   viewAllText: {
//     fontSize: 13,
//     color: "#0284C7",
//     fontWeight: "700",
//   },
//   reviewLoaderFrame: {
//     padding: 32,
//     alignItems: "center",
//   },
//   emptyReviews: {
//     padding: 24,
//     alignItems: "center",
//     backgroundColor: "#FFFFFF",
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: "#F1F5F9",
//     gap: 8,
//   },
//   emptyText: {
//     color: "#64748B",
//     fontSize: 13,
//     textAlign: "center",
//     lineHeight: 18,
//   },
//   btnEditStyle: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginTop: 8,
//     gap: 12,
//   },
//   editBtn: {
//     flexDirection: "row",
//     backgroundColor: "#0284C7",
//     height: 52,
//     borderRadius: 14,
//     justifyContent: "center",
//     alignItems: "center",
//     gap: 8,
//     marginTop: 8,
//     shadowColor: "#0284C7",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.15,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   saveBtn: {
//     flex: 1,
//     backgroundColor: "#10B981",
//     height: 52,
//     borderRadius: 14,
//     justifyContent: "center",
//     alignItems: "center",
//     shadowColor: "#10B981",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.15,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   cancelBtn: {
//     flex: 1,
//     height: 52,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#EF4444",
//     borderRadius: 14,
//     shadowColor: "#EF4444",
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.15,
//     shadowRadius: 8,
//     elevation: 3,
//   },
//   btnText: {
//     color: "#FFFFFF",
//     fontSize: 14,
//     fontWeight: "700",
//     letterSpacing: 0.2,
//   },
//   cancelBtnText: {
//     color: "#FFFFFF",
//     fontSize: 14,
//     fontWeight: "700",
//   },
//   settingsBtn: {
//     flexDirection: "row",
//     height: 54,
//     borderRadius: 16,
//     backgroundColor: "#FFFFFF",
//     borderWidth: 1.5,
//     borderColor: "#E2E8F0",
//     alignItems: "center",
//     paddingHorizontal: 16,
//     marginTop: 16,
//     gap: 12,
//   },
//   settingsBtnText: {
//     color: "#1E293B",
//     fontWeight: "700",
//     fontSize: 14,
//     flex: 1,
//   },
//   rightChevronTrailing: {
//     marginLeft: "auto",
//   },
// });

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
  }>({});
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [countryDropdownVisible, setCountryDropdownVisible] = useState(false);

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
      }
      return;
    }

    // Trigger the production-ready custom popup confirmation
    setSuccessModalVisible(true);
  };

  const handleCountrySelect = (selectedCountry: string) => {
    setFormData({ ...formData, Country: selectedCountry, PhoneNumber: "" });
    setErrors({ ...errors, country: undefined, phone: undefined });
    setCountryDropdownVisible(false);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="small" color="#0284C7" />
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
              onPress={() => router.push("/refNull/all-reviews")}
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

          {/* UTILITY PREFERENCE AND SYSTEM TERMINATION FLOWS */}
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => router.push("/refNull/settings")}
          >
            <Ionicons name="settings-outline" size={18} color="#1E293B" />
            <Text style={styles.settingsBtnText}>
              Account Preference Management
            </Text>
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
