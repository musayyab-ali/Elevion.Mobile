import { useState, useEffect } from "react";
import { customerApi } from "../services/customerApi";

export const useProfile = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const result = await customerApi.getProfile();
      if (result?.Data) {
        setProfile(result.Data);
      }
    } catch (err: any) {
      setError(err.Message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const validateProfileData = (data: any) => {
    const fieldErrors: { fullName?: string; phone?: string; country?: string } =
      {};

    // 1. Full Name Text Form Protections
    if (!data.FullName || data.FullName.trim().length === 0) {
      fieldErrors.fullName = "Full Name is strictly required.";
    } else if (!/^[a-zA-Z\s]+$/.test(data.FullName)) {
      fieldErrors.fullName =
        "Name contains invalid characters. Use letters only.";
    }

    // 2. Strict Country Domain Check
    const allowedCountries = ["Pakistan", "United Kingdom"];
    if (!data.Country || !allowedCountries.includes(data.Country)) {
      fieldErrors.country = "Please select either Pakistan or United Kingdom.";
    }

    // 3. Country-Phone Interlocking Joint Alignment Validation
    if (!data.PhoneNumber) {
      fieldErrors.phone = "Phone number tracking string cannot be empty.";
    } else {
      const sanitizedPhone = data.PhoneNumber.replace(/\s+/g, "");

      if (data.Country === "Pakistan") {
        // Must not start with prefix variants like 03 or 923
        if (/^(03|923|\+92)/.test(sanitizedPhone)) {
          fieldErrors.phone =
            "Enter raw number only. Drop leading 0, 92, or +92.";
        } else if (!/^3\d{9}$/.test(sanitizedPhone)) {
          fieldErrors.phone =
            "Invalid Pakistani raw format. Exactly 10 digits starting with 3.";
        }
      } else if (data.Country === "United Kingdom") {
        // UK cellular numbers must start with a raw 7 (dropping leading 0 or +44)
        if (/^(07|447|\+44)/.test(sanitizedPhone)) {
          fieldErrors.phone =
            "Enter raw UK number only. Drop leading 0, 44, or +44.";
        } else if (!/^7\d{9}$/.test(sanitizedPhone)) {
          fieldErrors.phone =
            "Invalid UK raw format. Exactly 10 digits starting with 7.";
        }
      }
    }

    return {
      isValid: Object.keys(fieldErrors).length === 0,
      fieldErrors,
    };
  };

  const handleUpdate = async (updatedData: any) => {
    const validation = validateProfileData(updatedData);
    if (!validation.isValid) {
      return { success: false, fieldErrors: validation.fieldErrors };
    }

    setUpdating(true);
    setProfileMessage(null);
    try {
      const payload = {
        ...updatedData,
        Gender: 0,
        DOB: new Date().toISOString(),
      };

      const result = await customerApi.updateProfile(payload);
      if (result?.Data) {
        setProfile(result.Data);
        setIsEditing(false);
        return { success: true };
      }
      return {
        success: false,
        error: "Empty framework response data payload.",
      };
    } catch (err: any) {
      return { success: false, error: err.Message || "Update failed" };
    } finally {
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
    profileMessage,
    setProfileMessage,
  };
};
