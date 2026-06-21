// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   ScrollView,
//   SafeAreaView,
//   Modal,
//   TextInput,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { useAddress } from "../../../features/customer/hooks/useAddress";
// import { useSettings } from "../../../features/customer/hooks/useSettings";
// import { AddressModal } from "../../../features/customer/components/AddressModal";

// const SettingsScreen = () => {
//   const { activeAddress, saveActiveAddress } = useAddress();
//   const {
//     loading: systemLoading,
//     executeConfirmedLogout,
//     handleChangePassword,
//     handleChangeEmail,
//     handleDeleteAccount,
//     handleRestoreAccount,
//   } = useSettings();

//   const [showAddressModal, setShowAddressModal] = useState(false);
//   const [activeModalType, setActiveModalType] = useState<
//     "NONE" | "LOGOUT" | "PASSWORD" | "EMAIL" | "DELETE" | "RESTORE"
//   >("NONE");

//   // Local Field Collectors
//   const [oldPassword, setOldPassword] = useState("");
//   const [newPassword, setNewPassword] = useState("");
//   const [targetEmail, setTargetEmail] = useState("");
//   const [securityKey, setSecurityKey] = useState("");

//   // Status Notification Engine States
//   const [actionFeedback, setActionFeedback] = useState<{
//     isError: boolean;
//     text: string;
//   } | null>(null);

//   const triggerFeedbackMessage = (text: string, isError = false) => {
//     setActionFeedback({ isError, text });
//     setTimeout(() => setActionFeedback(null), 4000);
//   };

//   const closeAndResetForms = () => {
//     setActiveModalType("NONE");
//     setOldPassword("");
//     setNewPassword("");
//     setTargetEmail("");
//     setSecurityKey("");
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView
//         showsVerticalScrollIndicator={false}
//         contentContainerStyle={styles.scrollContent}
//       >
//         {/* SECTION 1: DELIVERIES */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Default Delivery Destination</Text>
//           <View style={styles.addressCard}>
//             <View style={styles.addressInfoRow}>
//               <View style={styles.iconBackgroundRing}>
//                 <Ionicons name="location-sharp" size={20} color="#E11D48" />
//               </View>
//               <View style={{ flex: 1 }}>
//                 <Text style={styles.addressCardBadgeTitle}>
//                   Shipping Address
//                 </Text>
//                 <Text style={styles.addressText} numberOfLines={2}>
//                   {activeAddress?.Address ||
//                     "No default destination selected yet"}
//                 </Text>
//               </View>
//             </View>
//             <TouchableOpacity
//               style={styles.changeBtn}
//               onPress={() => setShowAddressModal(true)}
//             >
//               <Text style={styles.changeBtnText}>
//                 {activeAddress ? "Modify" : "Setup Address"}
//               </Text>
//               <Ionicons
//                 name="chevron-forward-sharp"
//                 size={14}
//                 color="#E11D48"
//               />
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* SECTION 2: IDENTITY CORE MUTATIONS */}
//         <View style={styles.section}>
//           <Text style={styles.sectionTitle}>Security Settings Matrix</Text>

//           <SettingMenuRow
//             icon="key-outline"
//             title="Modify Access Password"
//             color="#0284C7"
//             onPress={() => setActiveModalType("PASSWORD")}
//           />
//           <SettingMenuRow
//             icon="mail-unread-outline"
//             title="Synchronize Email Route"
//             color="#10B981"
//             onPress={() => setActiveModalType("EMAIL")}
//           />
//           <SettingMenuRow
//             icon="trash-bin-outline"
//             title="Schedule Account Purge"
//             color="#EF4444"
//             onPress={() => setActiveModalType("DELETE")}
//           />
//           <SettingMenuRow
//             icon="refresh-circle-outline"
//             title="Restore Cleared Account Profile"
//             color="#F59E0B"
//             onPress={() => setActiveModalType("RESTORE")}
//           />

//           <TouchableOpacity
//             style={styles.logoutBtn}
//             onPress={() => setActiveModalType("LOGOUT")}
//             activeOpacity={0.7}
//           >
//             <View style={styles.logoutLeftSection}>
//               <View
//                 style={[
//                   styles.iconBackgroundRing,
//                   { backgroundColor: "#F1F5F9" },
//                 ]}
//               >
//                 <Ionicons name="log-out-outline" size={20} color="#475569" />
//               </View>
//               <Text style={styles.logoutText}>Terminate Access Session</Text>
//             </View>
//             <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
//           </TouchableOpacity>
//         </View>
//       </ScrollView>

//       {/* DYNAMIC SYSTEM DIALOG LAYER COMPONENTS */}
//       <Modal
//         visible={activeModalType !== "NONE"}
//         transparent
//         animationType="fade"
//         onRequestClose={closeAndResetForms}
//       >
//         <View style={styles.modalOverlay}>
//           <View style={styles.modalCardAlert}>
//             {/* Modal Heading Configuration Matrix */}
//             {activeModalType === "LOGOUT" && (
//               <>
//                 <View
//                   style={[
//                     styles.modalAlertIconWrapper,
//                     { backgroundColor: "#FFF1F2" },
//                   ]}
//                 >
//                   <Ionicons name="power-sharp" size={26} color="#E11D48" />
//                 </View>
//                 <Text style={styles.modalAlertHeadingTitle}>
//                   Confirm System Logout
//                 </Text>
//                 <Text style={styles.modalAlertDescription}>
//                   Are you sure you want to drop your access session constraints
//                   now?
//                 </Text>
//               </>
//             )}

//             {activeModalType === "PASSWORD" && (
//               <>
//                 <View
//                   style={[
//                     styles.modalAlertIconWrapper,
//                     { backgroundColor: "#E0F2FE" },
//                   ]}
//                 >
//                   <Ionicons name="key-outline" size={26} color="#0284C7" />
//                 </View>
//                 <Text style={styles.modalAlertHeadingTitle}>
//                   Update Password Security
//                 </Text>
//                 <TextInput
//                   style={styles.modalInputField}
//                   secureTextEntry
//                   placeholder="Current Token Password"
//                   value={oldPassword}
//                   onChangeText={setOldPassword}
//                   placeholderTextColor="#94A3B8"
//                 />
//                 <TextInput
//                   style={styles.modalInputField}
//                   secureTextEntry
//                   placeholder="Target Core Password"
//                   value={newPassword}
//                   onChangeText={setNewPassword}
//                   placeholderTextColor="#94A3B8"
//                 />
//               </>
//             )}

//             {activeModalType === "EMAIL" && (
//               <>
//                 <View
//                   style={[
//                     styles.modalAlertIconWrapper,
//                     { backgroundColor: "#D1FAE5" },
//                   ]}
//                 >
//                   <Ionicons name="mail-outline" size={26} color="#10B981" />
//                 </View>
//                 <Text style={styles.modalAlertHeadingTitle}>
//                   Update Tracking Email
//                 </Text>
//                 <TextInput
//                   style={styles.modalInputField}
//                   keyboardType="email-address"
//                   autoCapitalize="none"
//                   placeholder="new-email-identity@domain.com"
//                   value={targetEmail}
//                   onChangeText={setTargetEmail}
//                   placeholderTextColor="#94A3B8"
//                 />
//               </>
//             )}

//             {activeModalType === "DELETE" && (
//               <>
//                 <View
//                   style={[
//                     styles.modalAlertIconWrapper,
//                     { backgroundColor: "#FEE2E2" },
//                   ]}
//                 >
//                   <Ionicons name="trash-outline" size={26} color="#EF4444" />
//                 </View>
//                 <Text style={styles.modalAlertHeadingTitle}>
//                   Purge Verification Key
//                 </Text>
//                 <Text style={styles.modalAlertDescription}>
//                   This schedules a destructive baseline removal from active
//                   tracking servers. Provide validation security credentials
//                   below.
//                 </Text>
//                 <TextInput
//                   style={styles.modalInputField}
//                   secureTextEntry
//                   placeholder="API Security Authorization Key"
//                   value={securityKey}
//                   onChangeText={setSecurityKey}
//                   placeholderTextColor="#94A3B8"
//                 />
//               </>
//             )}

//             {activeModalType === "RESTORE" && (
//               <>
//                 <View
//                   style={[
//                     styles.modalAlertIconWrapper,
//                     { backgroundColor: "#FEF3C7" },
//                   ]}
//                 >
//                   <Ionicons name="sync-outline" size={26} color="#D97706" />
//                 </View>
//                 <Text style={styles.modalAlertHeadingTitle}>
//                   Reclaim Profile Space
//                 </Text>
//                 <Text style={styles.modalAlertDescription}>
//                   Provide the historic verification code below to restore
//                   metadata tracks cleanly.
//                 </Text>
//                 <TextInput
//                   style={styles.modalInputField}
//                   secureTextEntry
//                   placeholder="API Security Authorization Key"
//                   value={securityKey}
//                   onChangeText={setSecurityKey}
//                   placeholderTextColor="#94A3B8"
//                 />
//               </>
//             )}

//             {/* SHARED CONTROL SYSTEM INTERACTIONS BUTTON ACTIONS BLOCK */}
//             <View style={styles.modalAlertActionLayoutStack}>
//               <TouchableOpacity
//                 style={styles.cancelAlertButtonAction}
//                 onPress={closeAndResetForms}
//                 disabled={systemLoading}
//               >
//                 <Text style={styles.cancelAlertButtonActionText}>Dismiss</Text>
//               </TouchableOpacity>

//               <TouchableOpacity
//                 style={[
//                   styles.confirmAlertButtonAction,
//                   activeModalType === "PASSWORD" && {
//                     backgroundColor: "#0284C7",
//                   },
//                   activeModalType === "EMAIL" && { backgroundColor: "#10B981" },
//                   activeModalType === "RESTORE" && {
//                     backgroundColor: "#D97706",
//                   },
//                 ]}
//                 disabled={systemLoading}
//                 onPress={async () => {
//                   let operationResult: { success: boolean; message: string } = {
//                     success: false,
//                     message: "",
//                   };

//                   if (activeModalType === "LOGOUT") {
//                     closeAndResetForms();
//                     await executeConfirmedLogout();
//                     return;
//                   }
//                   if (activeModalType === "PASSWORD")
//                     operationResult = await handleChangePassword(
//                       oldPassword,
//                       newPassword,
//                     );
//                   if (activeModalType === "EMAIL")
//                     operationResult = await handleChangeEmail(targetEmail);
//                   if (activeModalType === "DELETE")
//                     operationResult = await handleDeleteAccount();
//                   if (activeModalType === "RESTORE")
//                     operationResult = await handleRestoreAccount();

//                   if (operationResult.success) {
//                     triggerFeedbackMessage(operationResult.message, false);
//                     closeAndResetForms();
//                   } else {
//                     triggerFeedbackMessage(operationResult.message, true);
//                   }
//                 }}
//               >
//                 {systemLoading ? (
//                   <ActivityIndicator color="#FFF" size="small" />
//                 ) : (
//                   <Text style={styles.confirmAlertButtonActionText}>
//                     Execute
//                   </Text>
//                 )}
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>

//       {/* PERSISTENT TRANSIENT FLOATING SYSTEM POPUP MODAL FEEDBACK MESSAGE */}
//       {actionFeedback && (
//         <View
//           style={[
//             styles.floatingToastOverlay,
//             actionFeedback.isError
//               ? styles.toastErrorBg
//               : styles.toastSuccessBg,
//           ]}
//         >
//           <Ionicons
//             name={actionFeedback.isError ? "alert-circle" : "checkmark-circle"}
//             size={18}
//             color="#FFF"
//           />
//           <Text style={styles.floatingToastText}>{actionFeedback.text}</Text>
//         </View>
//       )}

//       <AddressModal
//         visible={showAddressModal}
//         onClose={() => setShowAddressModal(false)}
//         onSelectAddress={(addr) => saveActiveAddress(addr)}
//       />
//     </SafeAreaView>
//   );
// };

// // Extracted Sub-Element Row Component
// const SettingMenuRow = ({
//   icon,
//   title,
//   color,
//   onPress,
// }: {
//   icon: any;
//   title: string;
//   color: string;
//   onPress: () => void;
// }) => (
//   <TouchableOpacity
//     style={styles.settingListItemRow}
//     activeOpacity={0.7}
//     onPress={onPress}
//   >
//     <View
//       style={[styles.iconBackgroundRing, { backgroundColor: `${color}15` }]}
//     >
//       <Ionicons name={icon} size={18} color={color} />
//     </View>
//     <Text style={styles.settingItemTitleLabel}>{title}</Text>
//     <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
//   </TouchableOpacity>
// );

// export default SettingsScreen;

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#F8FAFC" },
//   scrollContent: { padding: 20, paddingBottom: 60 },
//   section: { marginBottom: 24 },
//   sectionTitle: {
//     fontSize: 11,
//     fontWeight: "800",
//     color: "#64748B",
//     textTransform: "uppercase",
//     letterSpacing: 0.8,
//     marginBottom: 12,
//   },
//   addressCard: {
//     backgroundColor: "#fff",
//     padding: 16,
//     borderRadius: 20,
//     borderWidth: 1,
//     borderColor: "#E2E8F0",
//   },
//   addressInfoRow: {
//     flexDirection: "row",
//     alignItems: "flex-start",
//     gap: 14,
//     marginBottom: 16,
//   },
//   iconBackgroundRing: {
//     width: 40,
//     height: 40,
//     borderRadius: 12,
//     backgroundColor: "#FFF1F2",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   addressCardBadgeTitle: {
//     fontSize: 11,
//     fontWeight: "700",
//     color: "#94A3B8",
//     textTransform: "uppercase",
//   },
//   addressText: {
//     fontSize: 14,
//     color: "#1E293B",
//     fontWeight: "600",
//     marginTop: 2,
//     lineHeight: 20,
//   },
//   changeBtn: {
//     backgroundColor: "#F8FAFC",
//     borderWidth: 1,
//     borderColor: "#E2E8F0",
//     paddingVertical: 12,
//     borderRadius: 12,
//     flexDirection: "row",
//     justifyContent: "center",
//     alignItems: "center",
//     gap: 6,
//   },
//   changeBtnText: { color: "#E11D48", fontSize: 13, fontWeight: "700" },

//   // List Item Rows
//   settingListItemRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#FFFFFF",
//     padding: 12,
//     borderRadius: 16,
//     borderBottomWidth: 1,
//     borderColor: "#F1F5F9",
//     marginBottom: 8,
//   },
//   settingItemTitleLabel: {
//     fontSize: 14,
//     fontWeight: "700",
//     color: "#334155",
//     flex: 1,
//     marginLeft: 12,
//   },

//   logoutBtn: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     backgroundColor: "#fff",
//     padding: 12,
//     paddingRight: 16,
//     borderRadius: 16,
//     marginTop: 12,
//     borderWidth: 1,
//     borderColor: "#FEE2E2",
//   },
//   logoutLeftSection: { flexDirection: "row", alignItems: "center", gap: 14 },
//   logoutText: { fontSize: 14, fontWeight: "700", color: "#EF4444" },

//   // Dialog Structural Mechanics
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(15, 23, 42, 0.4)",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   modalCardAlert: {
//     width: "88%",
//     maxWidth: 340,
//     backgroundColor: "#FFF",
//     borderRadius: 24,
//     padding: 22,
//     alignItems: "center",
//   },
//   modalAlertIconWrapper: {
//     width: 54,
//     height: 54,
//     borderRadius: 27,
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 14,
//   },
//   modalAlertHeadingTitle: {
//     fontSize: 16,
//     fontWeight: "800",
//     color: "#0F172A",
//     marginBottom: 12,
//   },
//   modalAlertDescription: {
//     fontSize: 12,
//     color: "#64748B",
//     textAlign: "center",
//     lineHeight: 18,
//     marginBottom: 16,
//     fontWeight: "500",
//   },
//   modalInputField: {
//     width: "100%",
//     height: 48,
//     backgroundColor: "#F8FAFC",
//     borderRadius: 10,
//     borderComplete: 1,
//     borderWidth: 1.5,
//     borderColor: "#E2E8F0",
//     paddingHorizontal: 14,
//     fontSize: 13,
//     color: "#0F172A",
//     fontWeight: "600",
//     marginBottom: 10,
//   },
//   modalAlertActionLayoutStack: {
//     flexDirection: "row",
//     gap: 10,
//     width: "100%",
//     marginTop: 14,
//   },
//   cancelAlertButtonAction: {
//     flex: 1,
//     height: 46,
//     borderRadius: 12,
//     backgroundColor: "#F1F5F9",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   cancelAlertButtonActionText: {
//     color: "#475569",
//     fontSize: 13,
//     fontWeight: "700",
//   },
//   confirmAlertButtonAction: {
//     flex: 1,
//     height: 46,
//     borderRadius: 12,
//     backgroundColor: "#E11D48",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   confirmAlertButtonActionText: {
//     color: "#FFF",
//     fontSize: 13,
//     fontWeight: "700",
//   },

//   // Floating Toast Styles
//   floatingToastOverlay: {
//     position: "absolute",
//     bottom: 40,
//     left: 20,
//     right: 20,
//     padding: 14,
//     borderRadius: 12,
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 10,
//     zIndex: 999,
//   },
//   toastErrorBg: { backgroundColor: "#EF4444" },
//   toastSuccessBg: { backgroundColor: "#10B981" },
//   floatingToastText: {
//     color: "#FFFFFF",
//     fontSize: 13,
//     fontWeight: "700",
//     flex: 1,
//   },
// });

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAddress } from "../../../features/customer/hooks/useAddress";
import { useSettings } from "../../../features/customer/hooks/useSettings";
import { AddressModal } from "../../../features/customer/components/AddressModal";

const SettingsScreen = () => {
  const { activeAddress, saveActiveAddress } = useAddress();
  const {
    loading: systemLoading,
    isSuccess,
    executeConfirmedLogout,
    handleChangePassword,
    handleChangeEmail,
    handleDeleteAccount,
    handleRestoreAccount,
  } = useSettings();

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [activeModalType, setActiveModalType] = useState<
    "NONE" | "LOGOUT" | "PASSWORD" | "EMAIL" | "DELETE" | "RESTORE"
  >("NONE");

  // Local Field Collectors
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [targetEmail, setTargetEmail] = useState("");
  const [restoreUserName, setRestoreUserName] = useState("");
  const [restoreEmail, setRestoreEmail] = useState("");

  // Input Password Mask Toggles
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Modal Specific Alert Message Feedback States
  const [modalFeedback, setModalFeedback] = useState<{
    isError: boolean;
    text: string;
  } | null>(null);

  const closeAndResetForms = () => {
    setActiveModalType("NONE");
    setOldPassword("");
    setNewPassword("");
    setTargetEmail("");
    setRestoreUserName("");
    setRestoreEmail("");
    setShowOldPassword(false);
    setShowNewPassword(false);
    setModalFeedback(null);
  };

  const handleModalExecution = async () => {
    setModalFeedback(null);
    let result: { success: boolean; message: string } = {
      success: false,
      message: "",
    };

    if (activeModalType === "LOGOUT") {
      closeAndResetForms();
      await executeConfirmedLogout();
      return;
    }

    if (activeModalType === "PASSWORD") {
      result = await handleChangePassword(oldPassword, newPassword);
    } else if (activeModalType === "EMAIL") {
      result = await handleChangeEmail(targetEmail);
    } else if (activeModalType === "DELETE") {
      result = await handleDeleteAccount();
    } else if (activeModalType === "RESTORE") {
      result = await handleRestoreAccount(restoreUserName, restoreEmail);
    }

    if (result.success) {
      setModalFeedback({ isError: false, text: result.message });
      // Keep modal open briefly so they see the success message clearly inside it
      setTimeout(() => {
        closeAndResetForms();
      }, 2000);
    } else {
      setModalFeedback({ isError: true, text: result.message });
    }
  };

  return (
    <View style={styles.container}>
      {isSuccess ? (
        <View style={styles.successWrapper}>
          <Ionicons name="checkmark-circle" size={80} color="#10B981" />
          <Text style={styles.successTitle}>Logout Successful!</Text>
          <Text style={styles.successSub}>
            We are redirecting you to our Homepage
          </Text>
          <ActivityIndicator
            size="small"
            color="#0077b6"
            style={{ marginTop: 20 }}
          />
        </View>
      ) : (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* SECTION 1: DELIVERIES */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Default Delivery Destination
              </Text>
              <View style={styles.addressCard}>
                <View style={styles.addressInfoRow}>
                  <View style={styles.iconBackgroundRing}>
                    <Ionicons name="location-sharp" size={20} color="#E11D48" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.addressCardBadgeTitle}>
                      Shipping Address
                    </Text>
                    <Text style={styles.addressText} numberOfLines={2}>
                      {activeAddress?.Address ||
                        "No default destination selected yet"}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.changeBtn}
                  onPress={() => setShowAddressModal(true)}
                >
                  <Text style={styles.changeBtnText}>
                    {activeAddress ? "Modify" : "Setup Address"}
                  </Text>
                  <Ionicons
                    name="chevron-forward-sharp"
                    size={14}
                    color="#E11D48"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* SECTION 2: IDENTITY SECURITY MANAGEMENT */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Security Settings Matrix</Text>

              <SettingMenuRow
                icon="key-outline"
                title="Modify Access Password"
                color="#0284C7"
                onPress={() => setActiveModalType("PASSWORD")}
              />
              <SettingMenuRow
                icon="mail-unread-outline"
                title="Synchronize Email Route"
                color="#10B981"
                onPress={() => setActiveModalType("EMAIL")}
              />
              <SettingMenuRow
                icon="trash-bin-outline"
                title="Schedule Account Purge"
                color="#EF4444"
                onPress={() => setActiveModalType("DELETE")}
              />
              <SettingMenuRow
                icon="refresh-circle-outline"
                title="Restore Cleared Account Profile"
                color="#F59E0B"
                onPress={() => setActiveModalType("RESTORE")}
              />

              <TouchableOpacity
                style={styles.logoutBtn}
                onPress={() => setActiveModalType("LOGOUT")}
                activeOpacity={0.7}
              >
                <View style={styles.logoutLeftSection}>
                  <View
                    style={[
                      styles.iconBackgroundRing,
                      { backgroundColor: "#F1F5F9" },
                    ]}
                  >
                    <Ionicons
                      name="log-out-outline"
                      size={20}
                      color="#475569"
                    />
                  </View>
                  <Text style={styles.logoutText}>
                    Terminate Access Session
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          </ScrollView>
          <Modal
            visible={activeModalType !== "NONE"}
            transparent
            animationType="fade"
            onRequestClose={closeAndResetForms}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.modalOverlay}
            >
              <View style={styles.modalCardAlert}>
                {activeModalType === "LOGOUT" && (
                  <>
                    <View
                      style={[
                        styles.modalAlertIconWrapper,
                        { backgroundColor: "#FFF1F2" },
                      ]}
                    >
                      <Ionicons name="power-sharp" size={26} color="#E11D48" />
                    </View>
                    <Text style={styles.modalAlertHeadingTitle}>
                      Confirm System Logout
                    </Text>
                    <Text style={styles.modalAlertDescription}>
                      Are you sure you want to drop your access session
                      constraints now?
                    </Text>
                  </>
                )}

                {activeModalType === "PASSWORD" && (
                  <>
                    <View
                      style={[
                        styles.modalAlertIconWrapper,
                        { backgroundColor: "#E0F2FE" },
                      ]}
                    >
                      <Ionicons name="key-outline" size={26} color="#0284C7" />
                    </View>
                    <Text style={styles.modalAlertHeadingTitle}>
                      Update Password Security
                    </Text>

                    {/* Old Password Input Container */}
                    <View style={styles.passwordInputContainer}>
                      <TextInput
                        style={styles.passwordInputField}
                        secureTextEntry={!showOldPassword}
                        placeholder="Current Token Password"
                        value={oldPassword}
                        onChangeText={setOldPassword}
                        placeholderTextColor="#94A3B8"
                      />
                      <TouchableOpacity
                        style={styles.eyeIconWrapper}
                        onPress={() => setShowOldPassword(!showOldPassword)}
                      >
                        <Ionicons
                          name={
                            showOldPassword ? "eye-off-outline" : "eye-outline"
                          }
                          size={20}
                          color="#64748B"
                        />
                      </TouchableOpacity>
                    </View>

                    {/* New Password Input Container */}
                    <View style={styles.passwordInputContainer}>
                      <TextInput
                        style={styles.passwordInputField}
                        secureTextEntry={!showNewPassword}
                        placeholder="Target Core Password"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        placeholderTextColor="#94A3B8"
                      />
                      <TouchableOpacity
                        style={styles.eyeIconWrapper}
                        onPress={() => setShowNewPassword(!showNewPassword)}
                      >
                        <Ionicons
                          name={
                            showNewPassword ? "eye-off-outline" : "eye-outline"
                          }
                          size={20}
                          color="#64748B"
                        />
                      </TouchableOpacity>
                    </View>
                  </>
                )}

                {activeModalType === "EMAIL" && (
                  <>
                    <View
                      style={[
                        styles.modalAlertIconWrapper,
                        { backgroundColor: "#D1FAE5" },
                      ]}
                    >
                      <Ionicons name="mail-outline" size={26} color="#10B981" />
                    </View>
                    <Text style={styles.modalAlertHeadingTitle}>
                      Update Tracking Email
                    </Text>
                    <TextInput
                      style={styles.modalInputField}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      placeholder="new-email-identity@domain.com"
                      value={targetEmail}
                      onChangeText={setTargetEmail}
                      placeholderTextColor="#94A3B8"
                    />
                  </>
                )}

                {activeModalType === "DELETE" && (
                  <>
                    <View
                      style={[
                        styles.modalAlertIconWrapper,
                        { backgroundColor: "#FEE2E2" },
                      ]}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={26}
                        color="#EF4444"
                      />
                    </View>
                    <Text style={styles.modalAlertHeadingTitle}>
                      Confirm Account Purge
                    </Text>
                    <Text style={styles.modalAlertDescription}>
                      This schedules a destructive baseline removal from active
                      tracking servers. Are you absolutely sure you want to
                      proceed?
                    </Text>
                  </>
                )}

                {activeModalType === "RESTORE" && (
                  <>
                    <View
                      style={[
                        styles.modalAlertIconWrapper,
                        { backgroundColor: "#FEF3C7" },
                      ]}
                    >
                      <Ionicons name="sync-outline" size={26} color="#D97706" />
                    </View>
                    <Text style={styles.modalAlertHeadingTitle}>
                      Reclaim Profile Space
                    </Text>
                    <Text style={styles.modalAlertDescription}>
                      Provide your account identification metrics to cleanly
                      restore data syncing status.
                    </Text>
                    <TextInput
                      style={styles.modalInputField}
                      placeholder="User Name"
                      autoCapitalize="none"
                      value={restoreUserName}
                      onChangeText={setRestoreUserName}
                      placeholderTextColor="#94A3B8"
                    />
                    <TextInput
                      style={styles.modalInputField}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      placeholder="Account Email"
                      value={restoreEmail}
                      onChangeText={setRestoreEmail}
                      placeholderTextColor="#94A3B8"
                    />
                  </>
                )}

                {/* INLINE MODAL NOTIFICATION RESPONSE ENGINE */}
                {modalFeedback && (
                  <View
                    style={[
                      styles.inlineModalFeedbackCard,
                      modalFeedback.isError
                        ? styles.inlineErrorBg
                        : styles.inlineSuccessBg,
                    ]}
                  >
                    <Ionicons
                      name={
                        modalFeedback.isError
                          ? "alert-circle"
                          : "checkmark-circle"
                      }
                      size={16}
                      color={modalFeedback.isError ? "#EF4444" : "#10B981"}
                    />
                    <Text
                      style={[
                        styles.inlineFeedbackText,
                        modalFeedback.isError
                          ? styles.textError
                          : styles.textSuccess,
                      ]}
                    >
                      {modalFeedback.text}
                    </Text>
                  </View>
                )}

                {/* SHARED CONTROL INTERACTIONS BUTTON LAYER */}
                <View style={styles.modalAlertActionLayoutStack}>
                  <TouchableOpacity
                    style={styles.cancelAlertButtonAction}
                    onPress={closeAndResetForms}
                    disabled={systemLoading}
                  >
                    <Text style={styles.cancelAlertButtonActionText}>
                      Dismiss
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.confirmAlertButtonAction,
                      activeModalType === "PASSWORD" && {
                        backgroundColor: "#0284C7",
                      },
                      activeModalType === "EMAIL" && {
                        backgroundColor: "#10B981",
                      },
                      activeModalType === "DELETE" && {
                        backgroundColor: "#EF4444",
                      },
                      activeModalType === "RESTORE" && {
                        backgroundColor: "#D97706",
                      },
                    ]}
                    disabled={systemLoading}
                    onPress={handleModalExecution}
                  >
                    {systemLoading ? (
                      <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                      <Text style={styles.confirmAlertButtonActionText}>
                        Execute
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </Modal>
          <AddressModal
            visible={showAddressModal}
            onClose={() => setShowAddressModal(false)}
            onSelectAddress={(addr) => saveActiveAddress(addr)}
          />
        </>
      )}
    </View>
  );
};

const SettingMenuRow = ({
  icon,
  title,
  color,
  onPress,
}: {
  icon: any;
  title: string;
  color: string;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={styles.settingListItemRow}
    activeOpacity={0.7}
    onPress={onPress}
  >
    <View
      style={[styles.iconBackgroundRing, { backgroundColor: `${color}15` }]}
    >
      <Ionicons name={icon} size={18} color={color} />
    </View>
    <Text style={styles.settingItemTitleLabel}>{title}</Text>
    <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
  </TouchableOpacity>
);

export default SettingsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  successWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1E293B",
    marginTop: 15,
    textAlign: "center",
  },
  successSub: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 20,
  },
  scrollContent: { padding: 20, paddingBottom: 60 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  addressCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  addressInfoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    marginBottom: 16,
  },
  iconBackgroundRing: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFF1F2",
    justifyContent: "center",
    alignItems: "center",
  },
  addressCardBadgeTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    textTransform: "uppercase",
  },
  addressText: {
    fontSize: 14,
    color: "#1E293B",
    fontWeight: "600",
    marginTop: 2,
    lineHeight: 20,
  },
  changeBtn: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  changeBtnText: { color: "#E11D48", fontSize: 13, fontWeight: "700" },

  settingListItemRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  settingItemTitleLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#334155",
    flex: 1,
    marginLeft: 12,
  },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 12,
    paddingRight: 16,
    borderRadius: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  logoutLeftSection: { flexDirection: "row", alignItems: "center", gap: 14 },
  logoutText: { fontSize: 14, fontWeight: "700", color: "#EF4444" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCardAlert: {
    width: "88%",
    maxWidth: 340,
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 22,
    alignItems: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  modalAlertIconWrapper: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  modalAlertHeadingTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
  },
  modalAlertDescription: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 16,
    fontWeight: "500",
  },
  modalInputField: {
    width: "100%",
    height: 48,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    paddingHorizontal: 14,
    fontSize: 13,
    color: "#0F172A",
    fontWeight: "600",
    marginBottom: 12,
  },

  // High-fidelity password layout with integrated mask toggles
  passwordInputContainer: {
    width: "100%",
    height: 48,
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingRight: 14,
  },
  passwordInputField: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 14,
    fontSize: 13,
    color: "#0F172A",
    fontWeight: "600",
  },
  eyeIconWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },

  // High Fidelity Inline Feedback Subsystems
  inlineModalFeedbackCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "100%",
    padding: 10,
    borderRadius: 10,
    marginTop: 4,
    marginBottom: 4,
  },
  inlineErrorBg: { backgroundColor: "#FEF2F2" },
  inlineSuccessBg: { backgroundColor: "#F0FDF4" },
  inlineFeedbackText: {
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  textError: { color: "#991B1B" },
  textSuccess: { color: "#166534" },

  modalAlertActionLayoutStack: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
    marginTop: 14,
  },
  cancelAlertButtonAction: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelAlertButtonActionText: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "700",
  },
  confirmAlertButtonAction: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#E11D48",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmAlertButtonActionText: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "700",
  },
});
