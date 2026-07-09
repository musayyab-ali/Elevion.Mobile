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
    const fieldErrors: {
      fullName?: string;
      phone?: string;
      country?: string;
      dob?: string;
      gender?: string;
    } = {};

    // 1. Full Name Verification
    if (!data.FullName || data.FullName.trim().length === 0) {
      fieldErrors.fullName = "Full Name is strictly required.";
    } else if (!/^[a-zA-Z\s]+$/.test(data.FullName)) {
      fieldErrors.fullName =
        "Name contains invalid characters. Use letters only.";
    }

    // 2. Country Domain Check
    const allowedCountries = ["Pakistan", "United Kingdom"];
    if (!data.Country || !allowedCountries.includes(data.Country)) {
      fieldErrors.country = "Please select either Pakistan or United Kingdom.";
    }

    // 3. Country-Phone Interlocking Alignment
    if (!data.PhoneNumber) {
      fieldErrors.phone = "Phone number tracking string cannot be empty.";
    } else {
      const sanitizedPhone = data.PhoneNumber.replace(/\s+/g, "");
      if (data.Country === "Pakistan") {
        if (/^(03|923|\+92)/.test(sanitizedPhone)) {
          fieldErrors.phone =
            "Enter raw number only. Drop leading 0, 92, or +92.";
        } else if (!/^3\d{9}$/.test(sanitizedPhone)) {
          fieldErrors.phone =
            "Invalid Pakistani raw format. Exactly 10 digits starting with 3.";
        }
      } else if (data.Country === "United Kingdom") {
        if (/^(07|447|\+44)/.test(sanitizedPhone)) {
          fieldErrors.phone =
            "Enter raw UK number only. Drop leading 0, 44, or +44.";
        } else if (!/^7\d{9}$/.test(sanitizedPhone)) {
          fieldErrors.phone =
            "Invalid UK raw format. Exactly 10 digits starting with 7.";
        }
      }
    }

    // 4. Future Date Protection for DOB
    if (!data.DOB) {
      fieldErrors.dob = "Date of Birth is required.";
    } else {
      const inputDate = new Date(data.DOB);
      const currentDate = new Date();
      if (isNaN(inputDate.getTime())) {
        fieldErrors.dob = "Invalid date format structural configuration.";
      } else if (inputDate > currentDate) {
        fieldErrors.dob = "Date of birth cannot be set in the future.";
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
      // Ensure the exact backend payload formatting schema requested by the client
      const payload = {
        FullName: updatedData.FullName,
        PhoneNumber: updatedData.PhoneNumber,
        PhoneCode:
          updatedData.PhoneCode ||
          (updatedData.Country === "Pakistan" ? "92" : "44"),
        Email: updatedData.Email,
        DOB: new Date(updatedData.DOB).toISOString(),
        Country: updatedData.Country,
        Gender: Number(updatedData.Gender),
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
