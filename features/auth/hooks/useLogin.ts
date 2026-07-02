// import { useState } from "react";
// import { useRouter } from "expo-router";
// import { authApi } from "../services/authApi";
// import { useAuth } from "@/store/AuthContext";
// import * as SecureStore from "expo-secure-store";

// export const useLogin = () => {
//   const router = useRouter();
//   const {
//     login: saveAuth,
//     setGlobalLoginSuccess,
//     globalLoginSuccess,
//   } = useAuth();

//   const [loading, setLoading] = useState(false);
//   const [apiMessage, setApiMessage] = useState<string | null>(null);

//   // Deletion States
//   const [pendingDeletionData, setPendingDeletionData] = useState<any | null>(
//     null,
//   );
//   const [showDeletionModal, setShowDeletionModal] = useState(false);

//   const handleLogin = async (userName: string, password: string) => {
//     if (!userName || !password) {
//       setApiMessage("Please enter both username and password");
//       setTimeout(() => setApiMessage(null), 3000);
//       return;
//     }
//     setLoading(true);
//     setApiMessage(null);

//     try {
//       const result = await authApi.login({
//         UserName: userName,
//         Password: password,
//       });

//       // INTERCEPT LOGIC: Account deletion check execution
//       if (result?.Data?.IsPendingDeletion === true) {
//         const temporaryToken = result.Data.AccessToken;

//         const statusCheck = await authApi.getDeletionStatus(temporaryToken);

//         if (statusCheck?.Data && statusCheck.Data.IsExpired === false) {
//           setPendingDeletionData({
//             ...statusCheck.Data,
//             AccessToken: temporaryToken,
//             OriginalUserName: userName, // reference pointer
//           });

//           setLoading(false);
//           setShowDeletionModal(true);
//           return;
//         }
//       }

//       // Normal authentication pipeline fallback
//       if (result.Data && result.Data.IsPhoneNumberConfirmed !== false) {
//         await saveAuth(result.Data);
//         await SecureStore.setItemAsync("SHOW_WELCOME_MODAL", "true");

//         setGlobalLoginSuccess(true);
//         setLoading(false);
//         setTimeout(() => {
//           router.replace("/(tabs)");
//           setTimeout(() => setGlobalLoginSuccess(false), 500);
//         }, 2000);
//         return;
//       }

//       setApiMessage("Account verification required.");
//       setTimeout(() => {
//         router.push({
//           pathname: "/(unauthorized)/otp-verification",
//           params: {
//             userName: userName,
//             phoneNumber: result.Data?.PhoneNumber || "",
//             message: "Almost there! Please verify your account.",
//             fromLogin: "true",
//           },
//         });
//       }, 1500);
//     } catch (error: any) {
//       if (error.ExceptionType === "UserPhoneNumberNotConfirmedException") {
//         setApiMessage("Account pending verification. Redirecting...");
//         setTimeout(() => {
//           router.push({
//             pathname: "/(unauthorized)/otp-verification",
//             params: {
//               userName: userName,
//               phoneNumber: error.PhoneNumber || "",
//               message: "Please verify your account first!",
//               fromLogin: "true",
//             },
//           });
//         }, 1500);
//       } else {
//         const errorMessage =
//           error.Errors?.[0]?.Message || error.Message || "Login failed";
//         setApiMessage(errorMessage);
//       }
//     } finally {
//       setLoading(false);
//       setTimeout(() => setApiMessage(null), 3000);
//     }
//   };

//   return {
//     handleLogin,
//     loading,
//     isSuccess: globalLoginSuccess,
//     apiMessage,
//     showDeletionModal,
//     setShowDeletionModal,
//     pendingDeletionData,
//   };
// };

import { useState } from "react";
import { useRouter } from "expo-router";
import { authApi } from "../services/authApi";
import { useAuth } from "@/store/AuthContext";
import * as SecureStore from "expo-secure-store";

export const useLogin = () => {
  const router = useRouter();
  const {
    login: saveAuth,
    setGlobalLoginSuccess,
    globalLoginSuccess,
  } = useAuth();

  const [loading, setLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState<string | null>(null);

  // Account Deletion Tracking Context States
  const [pendingDeletionData, setPendingDeletionData] = useState<any | null>(
    null,
  );
  const [showDeletionModal, setShowDeletionModal] = useState(false);

  const handleLogin = async (userName: string, password: string) => {
    if (!userName.trim() || !password) {
      setApiMessage("Please enter both username and password.");
      return;
    }

    setLoading(true);
    setApiMessage(null);

    try {
      const result = await authApi.login({
        UserName: userName,
        Password: password,
      });

      if (!result || result.StatusCode !== 200 || !result.Data) {
        throw new Error(
          result?.Message || "Invalid server response parameters received.",
        );
      }

      const userData = result.Data;
      console.log(
        ` phone number :${userData.IsPhoneNumberConfirmed}, Pending Deletion: ${userData.IsPendingDeletion}, Password Change Required: ${userData.IsPasswordChangeRequired}`,
      );

      // ------------------------------------------------------------------------
      // SCENARIO 4: Account Is Pending Deletion Intercept
      // ------------------------------------------------------------------------
      if (userData.IsPendingDeletion === true) {
        const temporaryToken = userData.AccessToken;
        const statusCheck = await authApi.getDeletionStatus(temporaryToken);

        if (statusCheck?.Data && statusCheck.Data.IsExpired === false) {
          setPendingDeletionData({
            ...statusCheck.Data,
            AccessToken: temporaryToken,
            OriginalUserName: userName,
          });
          setShowDeletionModal(true);
          return;
        }
      }

      // ------------------------------------------------------------------------
      // SCENARIO 3: Phone Verified but Password Reset is Explicitly Required
      // ------------------------------------------------------------------------
      if (
        userData.IsPhoneNumberConfirmed &&
        userData.IsPasswordChangeRequired
      ) {
        setApiMessage("Password reset required. Redirecting...");
        setTimeout(() => {
          router.push({
            pathname: "/(unauthorized)/reset-password",
            params: { userName },
          });
        }, 1200);
        return;
      }

      // ------------------------------------------------------------------------
      // SCENARIO 1: Pure Happy Path (Everything Verified & OK)
      // ------------------------------------------------------------------------
      if (
        userData.IsPhoneNumberConfirmed &&
        !userData.IsPendingDeletion &&
        !userData.IsPasswordChangeRequired
      ) {
        await saveAuth(userData);
        await SecureStore.setItemAsync("SHOW_WELCOME_MODAL", "true");

        setGlobalLoginSuccess(true);
        setTimeout(() => {
          router.replace("/(tabs)");
          setTimeout(() => setGlobalLoginSuccess(false), 500);
        }, 2000);
        return;
      }

      // ------------------------------------------------------------------------
      // SCENARIO 2: Phone Number Not Confirmed
      // ------------------------------------------------------------------------
      let targetFlow = "verification";
      if (userData.IsPasswordChangeRequired) {
        targetFlow = "reset"; // Flag used to tell useOtp NOT to store session variables
      }

      setApiMessage("Account verification required. Redirecting...");
      setTimeout(() => {
        router.push({
          pathname: "/(unauthorized)/otp-verification",
          params: {
            userName: userName,
            phoneNumber: userData.PhoneNumber || "",
            phoneCode: userData.PhoneCode || "92",
            message: "Please enter your security code to proceed.",
            fromLogin: "true",
            flowType: targetFlow,
          },
        });
      }, 1500);
    } catch (error: any) {
      console.error("[Login Engine Error]:", error);
      const errorMessage =
        error.Errors?.[0]?.Message ||
        error.Message ||
        "Login pipeline execution failed.";
      setApiMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    handleLogin,
    loading,
    isSuccess: globalLoginSuccess,
    apiMessage,
    showDeletionModal,
    setShowDeletionModal,
    pendingDeletionData,
  };
};
