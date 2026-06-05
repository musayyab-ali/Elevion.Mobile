import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { Alert } from "react-native";
import * as SecureStore from "expo-secure-store";
import { customerApi } from "../features/customer/services/customerApi";

const STORAGE_KEY = "active_customer_address";

interface Address {
  AddressBookId: number;
  FullName: string;
  PhoneNumber: string;
  IsDefault: boolean;
  Address: string;
  City: string;
  Country: string;
  CityId: number;
  CountryId: number;
  Longitude: string;
  Latitude: string;
}

interface AddressContextType {
  addresses: Address[];
  activeAddress: Address | null;
  loading: boolean;
  fetchAddresses: () => Promise<void>;
  saveActiveAddress: (address: Address | null) => Promise<void>;
  handleSaveAddress: (addressData: any) => Promise<{ success: boolean }>;
  handleDeleteAddress: (addressBookId: number) => Promise<void>;
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

  // 1. Fetch address books from API source
  const fetchAddresses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await customerApi.getAddresses();
      // ✅ FIX: Axios data nesting check (res.data.Data vs res.Data)
      const rawPayload = res?.data || res;
      const list: Address[] = rawPayload?.Data?.AddressBooks || [];

      setAddresses(list);

      // Restore active choice from storage if it exists, otherwise use fallback defaults
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
    setActiveAddress(address);
    if (address) {
      await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(address));
    } else {
      await SecureStore.deleteItemAsync(STORAGE_KEY);
    }
  };

  // 3. Mutation: Save / Create continuous endpoints
  const handleSaveAddress = async (addressData: any) => {
    try {
      const res = await customerApi.saveAddress(addressData);
      const payload = res?.data || res;

      // Match status code success layouts from Swagger documentation specifications
      if (
        payload?.HttpStatusCode === 100 ||
        payload?.StatusCode === 0 ||
        payload?.Type === "Success"
      ) {
        Alert.alert(
          "Success",
          "Your delivery address profile has been saved successfully!",
        );
        await fetchAddresses(); // Instantly update global views
        return { success: true };
      }

      Alert.alert("Server Error", payload?.Message || "Could not save entry.");
      return { success: false };
    } catch (err: any) {
      const msg =
        err?.response?.data?.Message || err.message || "Failed to save address";
      Alert.alert("Network Exception", msg);
      return { success: false };
    }
  };

  // 4. Mutation: Delete endpoint
  const handleDeleteAddress = async (id: number) => {
    try {
      const res = await customerApi.deleteAddress(id);
      console.log("Delete Response:", res);

      // Update running arrays instantly
      setAddresses((prev) => prev.filter((a) => a.AddressBookId !== id));

      // Cleanup: If active address is the one deleted, strip cache keys safely
      if (activeAddress?.AddressBookId === id) {
        await SecureStore.deleteItemAsync(STORAGE_KEY);
        setActiveAddress(null);
      }
    } catch (err) {
      Alert.alert(
        "Deletion Failure",
        "Could not remove specified destination profile.",
      );
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  return (
    <AddressContext.Provider
      value={{
        addresses,
        activeAddress,
        loading,
        fetchAddresses,
        saveActiveAddress,
        handleSaveAddress,
        handleDeleteAddress,
      }}
    >
      {children}
    </AddressContext.Provider>
  );
};

export const useGlobalAddress = () => {
  const context = useContext(AddressContext);
  if (!context)
    throw new Error("useGlobalAddress must be used within AddressProvider");
  return context;
};
