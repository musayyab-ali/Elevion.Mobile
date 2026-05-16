import { useState, useEffect } from "react";
import { customerApi } from "../services/customerApi";
import { useGlobalAddress } from "../../../store/AddressContext";
import { Alert } from "react-native";
import * as SecureStore from "expo-secure-store";

const STORAGE_KEY = "active_customer_address";

export const useAddress = () => {
  const [addresses, setAddresses] = useState([]);
  // const [activeAddress, setActiveAddress] = useState<any>(null);
  const { activeAddress, setActiveAddress, refreshAddress } =
    useGlobalAddress();
  const [loading, setLoading] = useState(false);
  const res = {
    Message: "Success",
    StatusCode: 200,
    Data: {
      TotalRecords: 2,
      AddressBooks: [
        {
          AddressBookId: 101,
          FullName: "John Doe",
          PhoneNumber: "+1-555-0123",
          IsDefault: true,
          DefaultDisplayStatus: "Primary",
          Address: "48 Maple Avenue",
          City: "New York",
          CityId: 10,
          Longitude: "-74.0060",
          Latitude: "40.7128",
        },
        {
          AddressBookId: 102,
          FullName: "Jane Smith",
          PhoneNumber: "+1-555-9876",
          IsDefault: false,
          DefaultDisplayStatus: "Secondary",
          Address: "12 Suplex Street",
          City: "Los Angeles",
          CityId: 25,
          Longitude: "-118.2437",
          Latitude: "34.0522",
        },
      ],
    },
  };
  // 1. Function to save selection both in state and storage
  // const saveActiveAddress = async (address: any) => {
  //   try {
  //     setActiveAddress(address);
  //     await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(address));
  //   } catch (err) {
  //     console.error("Failed to save address to storage", err);
  //   }
  // };

  // const fetchAddresses = async () => {
  //   setLoading(true);
  //   try {
  //     let list = [];
  //     // const res = await customerApi.getAddresses();
  //     if (res?.Data?.AddressBooks) {
  //       // console.log("Fetched addresses:", res.Data.AddressBooks);
  //       list = res?.Data?.AddressBooks || [];
  //       setAddresses(list);
  //     }
  //     // 2. Persistent Logic: Sync storage with API results
  //     const savedAddressJson = await SecureStore.getItemAsync(STORAGE_KEY);

  //     if (savedAddressJson) {
  //       const parsedSaved = JSON.parse(savedAddressJson);
  //       // Verify the saved address still exists in the database
  //       const stillExists = list.find(
  //         (a: any) => a.AddressBookId === parsedSaved.AddressBookId,
  //       );

  //       if (stillExists) {
  //         setActiveAddress(stillExists);
  //       } else {
  //         // If deleted from DB elsewhere, fallback to default or first
  //         const fallback = list.find((a: any) => a.IsDefault) || list[0];
  //         setActiveAddress(fallback);
  //         if (fallback) await saveActiveAddress(fallback);
  //       }
  //     } else {
  //       // First time load: use default
  //       const defaultAddr = list.find((a: any) => a.IsDefault) || list[0];
  //       if (defaultAddr) setActiveAddress(defaultAddr);
  //     }
  //   } catch (err) {
  //     console.error("Address fetch error", err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      // const res = await customerApi.getAddresses();
      if (res?.Data?.AddressBooks) {
        setAddresses(res.Data.AddressBooks);
        // Sync global state with latest API data
        await refreshAddress();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: any) => {
    try {
      const res = await customerApi.saveAddress(data);
      if (res?.HttpStatusCode === 100 || res?.StatusCode === 0) {
        await fetchAddresses();
        return { success: true };
      }
    } catch (err: any) {
      Alert.alert("Error", err.Message || "Failed to save address");
      return { success: false };
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await customerApi.deleteAddress(id);

      // 3. Cleanup: If active address is deleted, remove from storage
      if (activeAddress?.AddressBookId === id) {
        await SecureStore.deleteItemAsync(STORAGE_KEY);
        setActiveAddress(null);
      }

      setAddresses((prev) => prev.filter((a: any) => a.AddressBookId !== id));
    } catch (err) {
      Alert.alert("Error", "Could not delete address");
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  return {
    addresses,
    activeAddress, // Used in Home Screen Header
    saveActiveAddress: setActiveAddress,
    loading,
    handleSave,
    handleDelete,
    refresh: fetchAddresses,
  };
};
