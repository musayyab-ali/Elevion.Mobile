import { useState, useEffect } from "react";
import { customerApi } from "../services/customerApi";
import * as SecureStore from "expo-secure-store";
export const useProfile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [apiMessage, setApiMessage] = useState<string | null>(null);
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const result = await customerApi.getProfile();
      if (result?.Data) {
        setProfile(result.Data);
      }
    } catch (err: any) {
      setError(err.Message || "Failed to load profile");
      setApiMessage("Failed to load profile");
    } finally {
      setTimeout(() => setApiMessage(null), 2000);
      setLoading(false);
    }
  };

  const handleUpdate = async (updatedData: any) => {
    setUpdating(true);
    try {
      // Inject current date for DOB as per requirement
      const payload = {
        ...updatedData,
        DOB: new Date().toISOString(),
      };

      const result = await customerApi.updateProfile(payload);
      console.log(`result is : ${result}`);
      if (result?.Data) {
        setProfile(result.Data);
        console.log(result.Data.FullName);
        await SecureStore.setItemAsync("user_name", result.Data.FullName);
        setIsEditing(false);
        return { success: true };
      }
    } catch (err: any) {
      return { success: false, error: err.Message || "Update failed" };
    } finally {
      //  setTimeout(() => setApiMessage(null), 2000);
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    loading,
    updating,
    handleUpdate,
    error,
    isEditing,
    setIsEditing,
    apiMessage,
  };
};
