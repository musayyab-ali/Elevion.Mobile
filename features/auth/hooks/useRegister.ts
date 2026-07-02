import { useState, useCallback } from "react";
import { authApi } from "../services/authApi";
import { useRouter } from "expo-router";
import debounce from "lodash.debounce";

export interface FieldStatus {
  isUnique: boolean;
  message: string;
}

export const useRegister = (resetFormCallback?: () => void) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [apiErrors, setApiErrors] = useState<any[]>([]);
  const [apiMessage, setApiMessage] = useState<string | null>(null);

  // Individual loading flags for field feedback
  const [checkingFields, setCheckingFields] = useState({
    userName: false,
    email: false,
    phone: false,
  });

  // Unique status results mapping tracker
  const [fieldStatuses, setFieldStatuses] = useState<{
    userName: FieldStatus | null;
    email: FieldStatus | null;
    phone: FieldStatus | null;
  }>({
    userName: null,
    email: null,
    phone: null,
  });

  // const checkUniqueness = async (
  //   value: string,
  //   type: "userName" | "email" | "phone",
  // ) => {
  //   // Basic formatting cleanups before hitting network checks
  //   if (!value || value.trim().length < 3) {
  //     setFieldStatuses((prev) => ({ ...prev, [type]: null }));
  //     return;
  //   }

  //   // 1. Requirement: Letters only validation rule for Username field
  //   if (type === "userName") {
  //     const lettersOnlyRegex = /^[A-Za-z]+$/;
  //     if (!lettersOnlyRegex.test(value)) {
  //       setFieldStatuses((prev) => ({
  //         ...prev,
  //         userName: { isUnique: false, message: "Must contain letters only" },
  //       }));
  //       return;
  //     }
  //   }

  //   setCheckingFields((prev) => ({ ...prev, [type]: true }));

  //   try {
  //     const result = await authApi.isUserUnique(value.trim(), type);
  //     const isUnique = result?.Data?.IsUnique;

  //     if (typeof isUnique === "boolean") {
  //       setFieldStatuses((prev) => ({
  //         ...prev,
  //         [type]: {
  //           isUnique,
  //           message: isUnique
  //             ? "available"
  //             : result?.Message || "already exists",
  //         },
  //       }));
  //     }
  //   } catch (error: any) {
  //     console.log(`[Uniqueness Check Failed] Type: ${type}`, error);
  //   } finally {
  //     setCheckingFields((prev) => ({ ...prev, [type]: false }));
  //   }
  // };

  // Reusable debounced handles targeting unique validation types

  const checkUniqueness = async (
    value: string,
    type: "userName" | "email" | "phone",
  ) => {
    const cleanValue = value.trim();

    // 1. Structural Gatekeepers: Clear status and stop early if field is empty or too short
    if (!cleanValue || cleanValue.length < 3) {
      setFieldStatuses((prev) => ({ ...prev, [type]: null }));
      return;
    }

    // 2. USERNAME GATEKEEPER: Strict Alphabetical Validation Rule
    if (type === "userName") {
      const lettersOnlyRegex = /^[A-Za-z]+$/;
      if (!lettersOnlyRegex.test(cleanValue)) {
        setFieldStatuses((prev) => ({
          ...prev,
          userName: { isUnique: false, message: "Must contain letters only" },
        }));
        return;
      }
    }

    // 3. EMAIL GATEKEEPER: Silent exit until basic structural completeness (@ and extension) is met
    if (type === "email") {
      const basicEmailRegex = /\S+@\S+\.\S+/;
      if (!basicEmailRegex.test(cleanValue)) {
        // Clear status silently while typing; do not show checkmarks or trigger API yet
        setFieldStatuses((prev) => ({ ...prev, email: null }));
        return;
      }
    }

    // 4. PHONE GATEKEEPER: Silent exit until exactly 10 digits are completely entered
    if (type === "phone") {
      const numericDigits = cleanValue.replace(/\D/g, "");
      if (numericDigits.length !== 10) {
        // Keep state clear until the full local layout (10 digits) is typed out completely
        setFieldStatuses((prev) => ({ ...prev, phone: null }));
        return;
      }
    }

    // All gatekeepers passed! Safe to spin up individual loading state and check database
    setCheckingFields((prev) => ({ ...prev, [type]: true }));

    try {
      const result = await authApi.isUserUnique(cleanValue, type);
      const isUnique = result?.Data?.IsUnique;

      if (typeof isUnique === "boolean") {
        setFieldStatuses((prev) => ({
          ...prev,
          [type]: {
            isUnique,
            message: isUnique
              ? "available"
              : result?.Message || "already exists",
          },
        }));
      }
    } catch (error: any) {
      console.log(`[Uniqueness Check Failed] Type: ${type}`, error);
    } finally {
      setCheckingFields((prev) => ({ ...prev, [type]: false }));
    }
  };

  const debouncedCheck = useCallback(
    debounce((value: string, type: "userName" | "email" | "phone") => {
      checkUniqueness(value, type);
    }, 500),
    [],
  );

  const handleRegister = async (formData: any) => {
    // Block action explicitly if any verification criteria failed validation rules
    if (!fieldStatuses.userName?.isUnique) {
      setApiMessage("Username must be unique and contain letters only.");
      return;
    }
    if (!fieldStatuses.email?.isUnique) {
      setApiMessage("Email address must be unique.");
      return;
    }
    if (!fieldStatuses.phone?.isUnique) {
      setApiMessage("Phone number must be unique.");
      return;
    }

    setLoading(true);
    setApiErrors([]);
    setApiMessage(null);

    const isoMapping: { [key: string]: string } = { "92": "PK", "44": "GB" };
    const { IsAvailable, ...cleanFormData } = formData;

    const payload = {
      ...cleanFormData,
      ClientRole: 4,
      ISOCode: isoMapping[formData.PhoneCode] || "PK",
    };

    if (payload.ISOCode === "PK" && payload.PhoneNumber.length !== 10) {
      setApiMessage("Pakistan mobile number must be exactly 10 digits.");
      setLoading(false);
      return;
    }
    if (payload.ISOCode === "GB" && payload.PhoneNumber.length !== 10) {
      setApiMessage("UK mobile number must be exactly 10 digits.");
      setLoading(false);
      return;
    }

    try {
      const response = await authApi.register(payload);
      if (response.StatusCode === 200) {
        if (resetFormCallback) resetFormCallback();
        setFieldStatuses({ userName: null, email: null, phone: null });

        router.push({
          pathname: "/(unauthorized)/otp-verification",
          params: {
            phoneNumber: payload.PhoneNumber,
            userName: payload.UserName,
            message: "We've sent a 6-digit verification code to your phone.",
          },
        });
      }
    } catch (error: any) {
      if (error.StatusCode === 400 && error.Errors) {
        setApiErrors(error.Errors);
        setApiMessage("Please correct the highlighted errors.");
      } else {
        setApiMessage(error.Message || "A server error occurred.");
      }
      setTimeout(() => setApiMessage(null), 4000);
    } finally {
      setLoading(false);
    }
  };

  const getFieldError = (fieldName: string) => {
    return apiErrors.find((e) => e.Field === fieldName)?.Message;
  };

  return {
    handleRegister,
    loading,
    getFieldError,
    debouncedCheck,
    fieldStatuses,
    checkingFields,
    apiMessage,
  };
};
