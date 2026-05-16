import React, { createContext, useContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { customerApi } from "../features/customer/services/customerApi";

const STORAGE_KEY = "active_customer_address";

interface AddressContextType {
  activeAddress: any;
  setActiveAddress: (addr: any) => Promise<void>;
  refreshAddress: () => Promise<void>;
}

const AddressContext = createContext<AddressContextType | undefined>(undefined);

export const AddressProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [activeAddress, setInternalAddress] = useState<any>(null);

  const saveActiveAddress = async (address: any) => {
    setInternalAddress(address);
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(address));
  };

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
          Address: "48 Maple Avenue,",
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

  const syncAddress = async () => {
    try {
      //   const res = await customerApi.getAddresses();
      const list = res?.Data?.AddressBooks || [];
      const savedJson = await SecureStore.getItemAsync(STORAGE_KEY);

      if (savedJson) {
        const parsed = JSON.parse(savedJson);
        const exists = list.find(
          (a: any) => a.AddressBookId === parsed.AddressBookId,
        );
        setInternalAddress(
          exists || list.find((a: any) => a.IsDefault) || list[0],
        );
      } else {
        setInternalAddress(list.find((a: any) => a.IsDefault) || list[0]);
      }
    } catch (err) {
      console.error("Context Sync Error", err);
    }
  };

  useEffect(() => {
    syncAddress();
  }, []);

  return (
    <AddressContext.Provider
      value={{
        activeAddress,
        setActiveAddress: saveActiveAddress,
        refreshAddress: syncAddress,
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
