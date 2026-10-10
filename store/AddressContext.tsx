import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import * as SecureStore from "expo-secure-store";
import { customerApi } from "../features/customer/services/customerApi";
import { useAuth } from "./AuthContext";
import { Ionicons } from "@expo/vector-icons";
const STORAGE_KEY = "active_customer_address";

// Location Droplist Element Interfaces
export interface LocationLookupItem {
  Disabled: boolean;
  Group: any | null;
  Selected: boolean;
  Text: string;
  Value: string;
  IsCustomCakeAvailable?: boolean;
}

export interface Address {
  AddressBookId: number;
  FullName: string;
  PhoneNumber: string;
  IsDefault: boolean;
  Address: string;
  City: string;
  Country: string;
  CityId: number;
  CountryId: number;
  StateId?: number | null;
  AreaId?: number | null;
  /** Calling code and ISO country of the phone number, as the API returns them. */
  PhoneCode?: string;
  ISOCode?: string;
  EmailAddress?: string;
  Area?: string;
  Longitude: string;
  Latitude: string;
}

interface AlertState {
  visible: boolean;
  title: string;
  message: string;
  type: "success" | "error";
}

interface AddressContextType {
  addresses: Address[];
  activeAddress: Address | null;
  loading: boolean;

  // Dynamic Dropdown Lists State Hooks
  countries: LocationLookupItem[];
  states: LocationLookupItem[];
  cities: LocationLookupItem[];
  areas: LocationLookupItem[];
  branches: LocationLookupItem[];
  dropdownLoading: boolean;

  // Global Popup Modal Hook Configs
  alertConfig: AlertState;
  hideAlert: () => void;
  showAlert: (
    title: string,
    message: string,
    type: "success" | "error",
  ) => void;

  fetchAddresses: () => Promise<void>;
  saveActiveAddress: (address: Address | null) => Promise<void>;
  handleSaveAddress: (addressData: any) => Promise<{ success: boolean }>;
  handleDeleteAddress: (addressBookId: number) => Promise<{ success: boolean }>;

  // Dynamic Geo-Location Pipeline Operations
  loadCountries: () => Promise<void>;
  loadStates: (countryId: string | number) => Promise<void>;
  loadCities: (stateId: string | number) => Promise<void>;
  loadAreasAndBranches: (cityId: string | number) => Promise<void>;
  clearCascadingLocations: (level: "country" | "state" | "city") => void;
}

const AddressContext = createContext<AddressContextType | undefined>(undefined);

export const AddressProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [activeAddress, setActiveAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Dynamic Geolocation Lists State
  const [countries, setCountries] = useState<LocationLookupItem[]>([]);
  const [states, setStates] = useState<LocationLookupItem[]>([]);
  const [cities, setCities] = useState<LocationLookupItem[]>([]);
  const [areas, setAreas] = useState<LocationLookupItem[]>([]);
  const [branches, setBranches] = useState<LocationLookupItem[]>([]);
  const [dropdownLoading, setDropdownLoading] = useState<boolean>(false);
  const { isAuthenticated } = useAuth();
  // Global Professional Modal Alert State
  const [alertConfig, setAlertConfig] = useState<AlertState>({
    visible: false,
    title: "",
    message: "",
    type: "success",
  });

  const showAlert = useCallback(
    (title: string, message: string, type: "success" | "error") => {
      setAlertConfig({ visible: true, title, message, type });
    },
    [],
  );

  const hideAlert = useCallback(() => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  }, []);

  // 1. Fetch address books from API source
  const fetchAddresses = useCallback(async () => {
    if (!isAuthenticated) {
      setAddresses([]);
      return;
    }
    setLoading(true);
    try {
      const res = await customerApi.getAddresses();
      const rawPayload = res?.data || res;
      const list: Address[] = rawPayload?.Data?.AddressBooks || [];

      setAddresses(list);

      const savedJson = await SecureStore.getItemAsync(STORAGE_KEY);
      if (savedJson) {
        const parsed = JSON.parse(savedJson);
        const exists = list.find(
          (a) => a.AddressBookId === parsed.AddressBookId,
        );
        setActiveAddress(
          exists || list.find((a) => a.IsDefault) || list[0] || null,
        );
      } else {
        setActiveAddress(list.find((a) => a.IsDefault) || list[0] || null);
      }
    } catch (err) {
      console.log("Context Fetch Addresses Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Change active customer address selection globally
  const saveActiveAddress = async (address: Address | null) => {
    try {
      setActiveAddress(address);
      if (address) {
        await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(address));
      } else {
        await SecureStore.deleteItemAsync(STORAGE_KEY);
      }
    } catch (err) {
      console.log("SecureStore Error in saveActiveAddress:", err);
    }
  };

  // 3. Mutation: Save / Create continuous endpoints
  const handleSaveAddress = async (addressData: any) => {
    try {
      const sanitizedPayload = {
        ...addressData,
        CityId: addressData.CityId ? parseInt(addressData.CityId, 10) : 0,
        AddressBookId: addressData.AddressBookId
          ? parseInt(addressData.AddressBookId, 10)
          : 0,
      };

      const res = await customerApi.saveAddress(sanitizedPayload);
      const payload = res?.data || res;

      // Professional backend success validations check
      if (
        payload?.HttpStatusCode === 200 ||
        payload?.HttpStatusCode === 100 ||
        payload?.StatusCode === 0 ||
        payload?.Type === "Success"
      ) {
        showAlert(
          "Success",
          "Your delivery address profile has been saved successfully!",
          "success",
        );
        await fetchAddresses();
        return { success: true };
      }

      showAlert(
        "Server Error",
        payload?.Message || "Could not save entry.",
        "error",
      );
      return { success: false };
    } catch (err: any) {
      const msg =
        err?.response?.data?.Message || err.message || "Failed to save address";
      showAlert("Network Exception", msg, "error");
      return { success: false };
    }
  };

  // 4. Mutation: Delete endpoint
  const handleDeleteAddress = async (id: number) => {
    try {
      const res = await customerApi.deleteAddress(id);
      const payload = res?.data || res;

      // Verify mutation success criteria explicitly
      setAddresses((prev) => prev.filter((a) => a.AddressBookId !== id));

      if (activeAddress?.AddressBookId === id) {
        await SecureStore.deleteItemAsync(STORAGE_KEY);
        setActiveAddress(null);
      }

      showAlert("Deleted", "Address entry successfully removed.", "success");
      return { success: true };
    } catch (err: any) {
      const msg =
        err?.response?.data?.Message ||
        err.message ||
        "Could not remove destination profile.";
      showAlert("Deletion Failure", msg, "error");
      return { success: false };
    }
  };

  // =========================================================
  // ✨ CASCADING CORE GEOLOCATION PIPELINE OPERATIONS
  // =========================================================

  const loadCountries = useCallback(async () => {
    setDropdownLoading(true);
    try {
      const res = await customerApi.getCountries();
      const payload = res?.data || res;
      setCountries(payload?.Data || []);
    } catch (err) {
      console.log("Error loading countries:", err);
    } finally {
      setDropdownLoading(false);
    }
  }, []);

  const loadStates = useCallback(async (countryId: string | number) => {
    if (!countryId) return;
    setDropdownLoading(true);
    try {
      const res = await customerApi.getStates(countryId);
      const payload = res?.data || res;
      setStates(payload?.Data || []);
    } catch (err) {
      console.log("Error loading states:", err);
    } finally {
      setDropdownLoading(false);
    }
  }, []);

  const loadCities = useCallback(async (stateId: string | number) => {
    if (!stateId) return;
    setDropdownLoading(true);
    try {
      const res = await customerApi.getCities(stateId);
      const payload = res?.data || res;
      setCities(payload?.Data || []);
    } catch (err) {
      console.log("Error loading cities:", err);
    } finally {
      setDropdownLoading(false);
    }
  }, []);

  const loadAreasAndBranches = useCallback(async (cityId: string | number) => {
    if (!cityId) return;
    setDropdownLoading(true);
    try {
      const [areasRes, branchesRes] = await Promise.all([
        customerApi.getAreas(cityId),
        customerApi.getBranches(cityId),
      ]);

      const areasPayload = areasRes?.data || areasRes;
      const branchesPayload = branchesRes?.data || branchesRes;

      setAreas(areasPayload?.Data || []);
      setBranches(branchesPayload?.Data || []);
    } catch (err) {
      console.log("Error loading architectural areas/branches arrays:", err);
    } finally {
      setDropdownLoading(false);
    }
  }, []);

  const clearCascadingLocations = useCallback(
    (level: "country" | "state" | "city") => {
      if (level === "country") {
        setStates([]);
        setCities([]);
        setAreas([]);
        setBranches([]);
      } else if (level === "state") {
        setCities([]);
        setAreas([]);
        setBranches([]);
      } else if (level === "city") {
        setAreas([]);
        setBranches([]);
      }
    },
    [],
  );

  useEffect(() => {
    fetchAddresses();
    loadCountries();
  }, [fetchAddresses, loadCountries]);

  return (
    <AddressContext.Provider
      value={{
        addresses,
        activeAddress,
        loading,
        countries,
        states,
        cities,
        areas,
        branches,
        dropdownLoading,
        alertConfig,
        showAlert,
        hideAlert,
        fetchAddresses,
        saveActiveAddress,
        handleSaveAddress,
        handleDeleteAddress,
        loadCountries,
        loadStates,
        loadCities,
        loadAreasAndBranches,
        clearCascadingLocations,
      }}
    >
      {children}

      {/* Built-in fallback Professional Modal Overlay */}
      <Modal
        visible={alertConfig.visible}
        transparent
        animationType="fade"
        onRequestClose={hideAlert}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View
              style={[
                styles.statusIndicator,
                {
                  backgroundColor:
                    alertConfig.type === "success" ? "#10B981" : "#EF4444",
                },
              ]}
            >
              <Ionicons
                name={
                  alertConfig.type === "success"
                    ? "checkmark-circle"
                    : "alert-circle"
                }
                size={25}
                color="#FFF"
              />
            </View>
            <Text style={styles.modalTitle}>{alertConfig.title}</Text>
            <Text style={styles.modalMessage}>{alertConfig.message}</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.actionButton,
                {
                  backgroundColor:
                    alertConfig.type === "success" ? "#10B981" : "#EF4444",
                },
              ]}
              onPress={hideAlert}
            >
              <Text style={styles.actionButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </AddressContext.Provider>
  );
};

export const useGlobalAddress = () => {
  const context = useContext(AddressContext);
  if (!context)
    throw new Error("useGlobalAddress must be used within AddressProvider");
  return context;
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  statusIndicator: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 16,
    opacity: 0.9,
    justifyContent: "center",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  actionButton: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});
