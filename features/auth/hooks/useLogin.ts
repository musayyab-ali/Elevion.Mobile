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
//   const handleLogin = async (userName: string, password: string) => {
//     if (!userName || !password) {
//       setApiMessage("Please enter both username and password");
//       return;
//     }
//     setLoading(true);
//     setApiMessage(null);

//     try {
//       const result = await authApi.login({
//         UserName: userName,
//         Password: password,
//       });

//       if (result.Data && result.Data.IsPhoneNumberConfirmed !== false) {
//         setGlobalLoginSuccess(true);
//         setLoading(false);
//         await saveAuth(result.Data);
//         await SecureStore.setItemAsync("SHOW_WELCOME_MODAL", "true");
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

  // Deletion States
  const [pendingDeletionData, setPendingDeletionData] = useState<any | null>(
    null,
  );
  const [showDeletionModal, setShowDeletionModal] = useState(false);

  const handleLogin = async (userName: string, password: string) => {
    if (!userName || !password) {
      setApiMessage("Please enter both username and password");
      setTimeout(() => setApiMessage(null), 3000);
      return;
    }
    setLoading(true);
    setApiMessage(null);

    try {
      const result = await authApi.login({
        UserName: userName,
        Password: password,
      });

      // INTERCEPT LOGIC: Account deletion check execution
      if (result?.Data?.IsPendingDeletion === true) {
        const temporaryToken = result.Data.AccessToken;

        // const statusCheck = await authApi.getDeletionStatus(temporaryToken);

        // if (statusCheck?.Data && statusCheck.Data.IsExpired === false) {
        //   setPendingDeletionData({
        //     ...statusCheck.Data,
        //     AccessToken: temporaryToken,
        //     OriginalUserName: userName, // reference pointer
        //   });

        setPendingDeletionData({
          // ...statusCheck.Data,
          AccessToken: temporaryToken,
          OriginalUserName: userName, // reference pointer
        });
        setLoading(false);
        setShowDeletionModal(true);
        return;
      }

      // Normal authentication pipeline fallback
      if (result.Data && result.Data.IsPhoneNumberConfirmed !== false) {
        await saveAuth(result.Data);
        await SecureStore.setItemAsync("SHOW_WELCOME_MODAL", "true");

        setGlobalLoginSuccess(true);
        setLoading(false);
        setTimeout(() => {
          router.replace("/(tabs)");
          setTimeout(() => setGlobalLoginSuccess(false), 500);
        }, 2000);
        return;
      }

      setApiMessage("Account verification required.");
      setTimeout(() => {
        router.push({
          pathname: "/(unauthorized)/otp-verification",
          params: {
            userName: userName,
            phoneNumber: result.Data?.PhoneNumber || "",
            message: "Almost there! Please verify your account.",
            fromLogin: "true",
          },
        });
      }, 1500);
    } catch (error: any) {
      if (error.ExceptionType === "UserPhoneNumberNotConfirmedException") {
        setApiMessage("Account pending verification. Redirecting...");
        setTimeout(() => {
          router.push({
            pathname: "/(unauthorized)/otp-verification",
            params: {
              userName: userName,
              phoneNumber: error.PhoneNumber || "",
              message: "Please verify your account first!",
              fromLogin: "true",
            },
          });
        }, 1500);
      } else {
        const errorMessage =
          error.Errors?.[0]?.Message || error.Message || "Login failed";
        setApiMessage(errorMessage);
      }
    } finally {
      setLoading(false);
      setTimeout(() => setApiMessage(null), 3000);
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
