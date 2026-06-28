import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  StyleSheet,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface DropdownPickerProps {
  label: string;
  placeholder: string;
  data: Array<{ Value: string | number; Text: string }>;
  selectedValue: string | number | undefined;
  onSelect: (value: number) => void;
  error?: string;
  disabled?: boolean;
}

export const SearchableDropdownPicker = ({
  label,
  placeholder,
  data = [],
  selectedValue,
  onSelect,
  error,
  disabled = false,
}: DropdownPickerProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedItem = data.find(
    (item) => Number(item.Value) === Number(selectedValue),
  );

  const filteredData = data.filter((item) =>
    item.Text?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <View style={dropdownStyles.container}>
      <Text
        style={[dropdownStyles.label, error ? dropdownStyles.errorLabel : null]}
      >
        {label}
      </Text>

      <TouchableOpacity
        activeOpacity={0.7}
        disabled={disabled}
        style={[
          dropdownStyles.pickerTrigger,
          error ? dropdownStyles.errorBorder : null,
          disabled ? dropdownStyles.disabledTrigger : null,
        ]}
        onPress={() => {
          setSearchQuery("");
          setModalVisible(true);
        }}
      >
        <Text
          style={[
            dropdownStyles.pickerTriggerText,
            !selectedItem ? dropdownStyles.placeholderColor : null,
          ]}
        >
          {selectedItem ? selectedItem.Text : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#64748B" />
      </TouchableOpacity>

      {error && <Text style={dropdownStyles.errorTextInline}>{error}</Text>}

      {/* Fixed 80% Bottom Sheet Matrix */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          {/* Main backdrop locks everything cleanly to the bottom */}
          <View style={dropdownStyles.modalBackdrop}>
            {/* Dismiss target zone for tapping background space */}
            <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
              <View style={dropdownStyles.backdropDismissZone} />
            </TouchableWithoutFeedback>

            {/* The Content Sheet: Removing KeyboardAvoidingView stops layout shifting.
            The search bar remains highly viewable above typical system keyboards.
          */}
            <View style={dropdownStyles.sheetContainer}>
              {/* Elegant visual drag indicator pill */}
              <View style={dropdownStyles.dragIndicator} />

              <View style={dropdownStyles.modalHeader}>
                <Text style={dropdownStyles.modalTitle}>
                  Select {label.replace("*", "").trim()}
                </Text>
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={dropdownStyles.closeButton}
                  activeOpacity={0.6}
                >
                  <Ionicons name="close-circle" size={24} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              {/* Search Box Field */}
              <View style={dropdownStyles.searchBarContainer}>
                <Ionicons
                  name="search-outline"
                  size={18}
                  color="#64748B"
                  style={{ marginRight: 8 }}
                />
                <TextInput
                  placeholder={`Search ${label.replace("*", "").toLowerCase().trim()}...`}
                  placeholderTextColor="#94A3B8"
                  style={dropdownStyles.searchInput}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCorrect={false}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <Ionicons name="close" size={16} color="#94A3B8" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Clean Vertical Scrolling List */}
              <FlatList
                data={filteredData}
                keyExtractor={(item, idx) => `item-${item.Value}-${idx}`}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{
                  paddingBottom: Platform.OS === "ios" ? 40 : 24,
                }}
                renderItem={({ item }) => {
                  const isCurrent =
                    Number(item.Value) === Number(selectedValue);
                  return (
                    <TouchableOpacity
                      style={[
                        dropdownStyles.listItem,
                        isCurrent ? dropdownStyles.listItemActive : null,
                      ]}
                      onPress={() => {
                        onSelect(Number(item.Value));
                        setModalVisible(false);
                      }}
                    >
                      <Text
                        style={[
                          dropdownStyles.listItemText,
                          isCurrent ? dropdownStyles.listItemTextActive : null,
                        ]}
                      >
                        {item.Text}
                      </Text>
                      {isCurrent && (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color="#E11D48"
                        />
                      )}
                    </TouchableOpacity>
                  );
                }}
                ListEmptyComponent={
                  <View style={dropdownStyles.emptyContainer}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={32}
                      color="#94A3B8"
                    />
                    <Text style={dropdownStyles.emptyText}>
                      No matching options found
                    </Text>
                  </View>
                }
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const dropdownStyles = StyleSheet.create({
  container: {
    marginBottom: 14,
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  errorLabel: {
    color: "#EF4444",
  },
  pickerTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    backgroundColor: "#FFF",
  },
  pickerTriggerText: {
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "500",
  },
  placeholderColor: {
    color: "#94A3B8",
  },
  disabledTrigger: {
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
  },
  errorBorder: {
    borderColor: "#EF4444",
  },
  errorTextInline: {
    fontSize: 11,
    color: "#EF4444",
    marginTop: 2,
  },

  /* Modal Backdrop Overlay Styling */
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end", // Aligns sheet securely to the viewport bottom
  },
  backdropDismissZone: {
    flex: 1,
  },

  /* Fixed Bottom Sheet layout calculation */
  sheetContainer: {
    height: SCREEN_HEIGHT * 0.8,
    maxHeight: "85%",
    paddingBottom: Platform.OS === "ios" ? 36 : 24,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 24,
  },
  dragIndicator: {
    width: 38,
    height: 4,
    backgroundColor: "#E2E8F0",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 6,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "#F1F5F9",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.2,
  },
  closeButton: {
    padding: 2,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "500",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: "#F8FAFC",
  },
  listItemActive: {
    backgroundColor: "#FFF1F2",
  },
  listItemText: {
    fontSize: 14,
    color: "#334155",
    fontWeight: "500",
  },
  listItemTextActive: {
    color: "#E11D48",
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#94A3B8",
    fontWeight: "500",
  },
});
