import { useGlobalAddress } from "../../../store/AddressContext";

export const useAddress = () => {
  const {
    addresses,
    activeAddress,
    loading,
    fetchAddresses,
    saveActiveAddress,
    handleSaveAddress,
    handleDeleteAddress,
  } = useGlobalAddress();

  return {
    addresses,
    activeAddress,
    loading,
    saveActiveAddress,
    handleSave: handleSaveAddress,
    handleDelete: handleDeleteAddress,
    refresh: fetchAddresses,
  };
};
