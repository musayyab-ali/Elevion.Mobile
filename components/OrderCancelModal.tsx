// import React from "react";
// import {
//   Modal,
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   ActivityIndicator,
//   Platform,
// } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { Colors } from "../constants/Theme"; // Adjust layout tokens reference path

// interface OrderCancelModalProps {
//   visible: boolean;
//   isLoading: boolean;
//   errorMessage: string;
//   onConfirm: () => void;
//   onCancel: () => void;
// }

// export const OrderCancelModal = ({
//   visible,
//   isLoading,
//   errorMessage,
//   onConfirm,
//   onCancel,
// }: OrderCancelModalProps) => {
//   return (
//     <Modal
//       visible={visible}
//       animationType="fade"
//       transparent
//       onRequestClose={onCancel}
//     >
//       <View style={styles.modalOverlay}>
//         <View style={styles.alertCardContainer}>
//           {/* Warning Graphic Badge */}
//           <View style={styles.warningIconBadge}>
//             <Ionicons name="alert-circle" size={32} color="#EF4444" />
//           </View>

//           {/* Copy Typography */}
//           <Text style={styles.alertTitle}>Cancel Order?</Text>
//           <Text style={styles.alertSubtitle}>
//             Are you sure you want to cancel this transaction? This procedure
//             cannot be reversed and your allocation will be dropped.
//           </Text>

//           {/* Error Message Render Block */}
//           {errorMessage ? (
//             <View style={styles.errorInlineContainer}>
//               <Ionicons name="warning-outline" size={16} color="#EF4444" />
//               <Text style={styles.errorInlineText}>{errorMessage}</Text>
//             </View>
//           ) : null}

//           {/* Call to Actions Trays */}
//           <View style={styles.actionButtonsColumn}>
//             <TouchableOpacity
//               style={styles.destructiveActionBtn}
//               onPress={onConfirm}
//               disabled={isLoading}
//             >
//               {isLoading ? (
//                 <ActivityIndicator size="small" color="#FFFFFF" />
//               ) : (
//                 <Text style={styles.destructiveBtnText}>Yes, Cancel Order</Text>
//               )}
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.dismissActionBtn}
//               onPress={onCancel}
//               disabled={isLoading}
//             >
//               <Text style={styles.dismissBtnText}>No, Keep Order</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// };

// const styles = StyleSheet.create({
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: "rgba(15, 23, 42, 0.6)", // Slate shadow opacity
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 24,
//   },
//   alertCardContainer: {
//     backgroundColor: "#FFFFFF",
//     borderRadius: 24,
//     padding: 24,
//     width: "100%",
//     maxWidth: 340,
//     alignItems: "center",
//     ...Platform.select({
//       ios: {
//         shadowColor: "#0F172A",
//         shadowOffset: { width: 0, height: 8 },
//         shadowOpacity: 0.15,
//         shadowRadius: 16,
//       },
//       android: {
//         elevation: 12,
//       },
//     }),
//   },
//   warningIconBadge: {
//     backgroundColor: "#FEF2F2",
//     width: 64,
//     height: 64,
//     borderRadius: 50,
//     justifyContent: "center",
//     alignItems: "center",
//     marginBottom: 16,
//   },
//   alertTitle: {
//     fontSize: 20,
//     fontWeight: "700",
//     color: "#0F172A",
//     marginBottom: 8,
//     letterSpacing: -0.3,
//   },
//   alertSubtitle: {
//     fontSize: 14,
//     color: "#475569",
//     textAlign: "center",
//     lineHeight: 20,
//     marginBottom: 16,
//   },
//   errorInlineContainer: {
//     flexDirection: "row",
//     backgroundColor: "#FEF2F2",
//     borderColor: "#FEE2E2",
//     borderWidth: 1,
//     borderRadius: 12,
//     padding: 12,
//     alignItems: "center",
//     gap: 8,
//     marginBottom: 16,
//     width: "100%",
//   },
//   errorInlineText: {
//     color: "#B91C1C",
//     fontSize: 13,
//     fontWeight: "500",
//     flex: 1,
//   },
//   actionButtonsColumn: {
//     width: "100%",
//     gap: 10,
//   },
//   destructiveActionBtn: {
//     backgroundColor: "#EF4444",
//     borderRadius: 14,
//     height: 50,
//     justifyContent: "center",
//     alignItems: "center",
//     width: "100%",
//   },
//   destructiveBtnText: {
//     color: "#FFFFFF",
//     fontWeight: "600",
//     fontSize: 15,
//   },
//   dismissActionBtn: {
//     backgroundColor: "#F8FAFC",
//     borderWidth: 1,
//     borderColor: "#E2E8F0",
//     borderRadius: 14,
//     height: 50,
//     justifyContent: "center",
//     alignItems: "center",
//     width: "100%",
//   },
//   dismissBtnText: {
//     color: "#475569",
//     fontWeight: "600",
//     fontSize: 15,
//   },
// });

import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface OrderCancelModalProps {
  visible: boolean;
  isLoading: boolean;
  isLoadingReasons: boolean;
  reasons: any[];
  selectedReason: string | null;
  onSelectReason: (value: string) => void;
  errorMessage: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const OrderCancelModal = ({
  visible,
  isLoading,
  isLoadingReasons,
  reasons,
  selectedReason,
  onSelectReason,
  errorMessage,
  onConfirm,
  onCancel,
}: OrderCancelModalProps) => {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.alertCardContainer}>
          {/* Warning Graphic Badge */}
          <View style={styles.warningIconBadge}>
            <Ionicons name="alert-circle" size={32} color="#EF4444" />
          </View>

          {/* Copy Typography */}
          <Text style={styles.alertTitle}>Cancellation Reason</Text>
          <Text style={styles.alertSubtitle}>
            Please provide a valid cancellation response below to process
            dropping this record transaction.
          </Text>

          {/* Dynamic Reason Selector Options Blocks */}
          {isLoadingReasons ? (
            <View style={styles.reasonsLoaderFrame}>
              <ActivityIndicator size="small" color="#0284C7" />
              <Text style={styles.loadingReasonsText}>Fetching options...</Text>
            </View>
          ) : (
            <View style={styles.optionsWrapper}>
              <ScrollView
                style={styles.reasonsScrollView}
                contentContainerStyle={{ gap: 8 }}
                showsVerticalScrollIndicator={false}
              >
                {reasons.map((opt) => {
                  const isSelected = selectedReason === opt.Value;
                  return (
                    <TouchableOpacity
                      key={opt.Value}
                      style={[
                        styles.reasonOptionItem,
                        isSelected && styles.reasonOptionItemSelected,
                      ]}
                      onPress={() => onSelectReason(opt.Value)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={
                          isSelected ? "radio-button-on" : "radio-button-off"
                        }
                        size={18}
                        color={isSelected ? "#EF4444" : "#94A3B8"}
                      />
                      <Text
                        style={[
                          styles.reasonOptionText,
                          isSelected && styles.reasonOptionTextSelected,
                        ]}
                      >
                        {opt.Text}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Error Message Render Block */}
          {errorMessage ? (
            <View style={styles.errorInlineContainer}>
              <Ionicons name="warning-outline" size={16} color="#EF4444" />
              <Text style={styles.errorInlineText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Call to Actions Trays */}
          <View style={styles.actionButtonsColumn}>
            <TouchableOpacity
              style={[
                styles.destructiveActionBtn,
                (!selectedReason || isLoading) && styles.disabledActionBtn,
              ]}
              onPress={onConfirm}
              disabled={isLoading || !selectedReason}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.destructiveBtnText}>
                  Confirm Cancellation
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dismissActionBtn}
              onPress={onCancel}
              disabled={isLoading}
            >
              <Text style={styles.dismissBtnText}>No, Keep Order</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  alertCardContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 350,
    alignItems: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  warningIconBadge: {
    backgroundColor: "#FEF2F2",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  alertSubtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 16,
  },
  optionsWrapper: {
    width: "100%",
    maxHeight: 180,
    marginBottom: 16,
  },
  reasonsScrollView: {
    width: "100%",
  },
  reasonsLoaderFrame: {
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  loadingReasonsText: {
    fontSize: 12,
    color: "#64748B",
  },
  reasonOptionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    gap: 10,
    width: "100%",
  },
  reasonOptionItemSelected: {
    borderColor: "#FEE2E2",
    backgroundColor: "#FEF2F2",
  },
  reasonOptionText: {
    fontSize: 13,
    color: "#334155",
    fontWeight: "500",
    flex: 1,
  },
  reasonOptionTextSelected: {
    color: "#991B1B",
    fontWeight: "600",
  },
  errorInlineContainer: {
    flexDirection: "row",
    backgroundColor: "#FEF2F2",
    borderColor: "#FEE2E2",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    width: "100%",
  },
  errorInlineText: {
    color: "#B91C1C",
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
  },
  actionButtonsColumn: {
    width: "100%",
    gap: 10,
  },
  destructiveActionBtn: {
    backgroundColor: "#EF4444",
    borderRadius: 14,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  disabledActionBtn: {
    backgroundColor: "#CBD5E1",
  },
  destructiveBtnText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  dismissActionBtn: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  dismissBtnText: {
    color: "#475569",
    fontWeight: "600",
    fontSize: 14,
  },
});
