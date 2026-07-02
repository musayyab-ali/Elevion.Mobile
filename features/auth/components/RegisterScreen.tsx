// import React, { useState, useEffect } from "react";
// import {
//   View,
//   Text,
//   ScrollView,
//   StyleSheet,
//   TouchableOpacity,
//   Dimensions,
//   ActivityIndicator,
// } from "react-native";
// import { Colors } from "../../../constants/Theme";
// import { AppButton } from "../../../components/AppButton";
// import { AppInput } from "../../../components/AppInput";
// import { useRouter } from "expo-router";
// import { useRegister } from "../hooks/useRegister";
// import { Ionicons } from "@expo/vector-icons";
// import { AuthContainer } from "@/components/AuthContainer";

// const { width: SCREEN_WIDTH } = Dimensions.get("window");

// const INITIAL_FORM_STATE = {
//   FirstName: "",
//   LastName: "",
//   UserName: "",
//   Email: "",
//   PhoneNumber: "",
//   PhoneCode: "92",
//   Password: "",
//   ConfirmPassword: "",
//   IsAvailable: true,
// };

// export default function RegisterScreen() {
//   const router = useRouter();

//   const [formData, setFormData] = useState(INITIAL_FORM_STATE);
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [suggestions, setSuggestions] = useState<string[]>([]);

//   // Instantiating the hook with structural reset method passed down
//   const {
//     handleRegister,
//     loading,
//     getFieldError,
//     debouncedCheck,
//     usernameStatus,
//     isCheckingUser,
//     apiMessage,
//   } = useRegister(() => {
//     setFormData(INITIAL_FORM_STATE);
//     setSuggestions([]);
//   });

//   useEffect(() => {
//     if (formData.FirstName.length > 2 || formData.LastName.length > 2) {
//       const base = (formData.FirstName + formData.LastName)
//         .toLowerCase()
//         .replace(/\s/g, "");
//       const list = [
//         `${base}${Math.floor(10 + Math.random() * 90)}`,
//         `${formData.FirstName.toLowerCase()}_${Math.floor(100 + Math.random() * 900)}`,
//         `${formData.LastName.toLowerCase()}${formData.FirstName.charAt(0).toLowerCase()}${Math.floor(10 + Math.random() * 99)}`,
//       ];
//       setSuggestions(list);
//     }
//   }, [formData.FirstName, formData.LastName]);

//   const updateField = (name: string, value: any) => {
//     let finalValue = value;

//     if (name === "PhoneNumber") {
//       // Keep numeric only
//       let digits = value.replace(/\D/g, "");

//       if (formData.PhoneCode === "92") {
//         // Enforce removal of leading prefixes for PK
//         if (digits.startsWith("92")) digits = digits.slice(2);
//         if (digits.startsWith("0")) digits = digits.slice(1);
//         // Max length 10 digits starting with 3 (e.g. 3001234567)
//         finalValue = digits.slice(0, 10);
//       } else if (formData.PhoneCode === "44") {
//         // Enforce removal of leading prefixes for UK
//         if (digits.startsWith("44")) digits = digits.slice(2);
//         if (digits.startsWith("0")) digits = digits.slice(1);
//         // Max length 10 digits starting with 7 (e.g. 7123456789)
//         finalValue = digits.slice(0, 10);
//       }
//     }

//     setFormData((prev) => ({ ...prev, [name]: finalValue }));
//     if (name === "UserName") debouncedCheck(finalValue);
//   };

//   const handleCountryToggle = () => {
//     const nextCode = formData.PhoneCode === "92" ? "44" : "92";
//     setFormData((prev) => ({
//       ...prev,
//       PhoneCode: nextCode,
//       PhoneNumber: "", // Clear number to avoid invalid lengths between region formats
//     }));
//   };

//   return (
//     <AuthContainer title="Create Account" apiMessage={apiMessage}>
//       <View style={styles.responsiveWrapper}>
//         <View style={styles.row}>
//           <View style={{ flex: 1, marginRight: 10 }}>
//             <AppInput
//               label="First Name"
//               placeholder="John"
//               value={formData.FirstName}
//               onChangeText={(v) => updateField("FirstName", v)}
//               error={getFieldError("FirstName")}
//             />
//           </View>
//           <View style={{ flex: 1 }}>
//             <AppInput
//               label="Last Name"
//               placeholder="Doe"
//               value={formData.LastName}
//               onChangeText={(v) => updateField("LastName", v)}
//               error={getFieldError("LastName")}
//             />
//           </View>
//         </View>

//         <AppInput
//           label={
//             isCheckingUser ? (
//               <ActivityIndicator size="small" color="#00b4d8" />
//             ) : (
//               `User Name ${usernameStatus?.isUnique ? "✅" : formData.UserName ? "❌" : ""}`
//             )
//           }
//           placeholder="Choose a unique username"
//           value={formData.UserName}
//           onChangeText={(v) => updateField("UserName", v)}
//           error={getFieldError("UserName")}
//         />

//         {suggestions.length > 0 && (
//           <View style={styles.suggestionBox}>
//             <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//               {suggestions.map((item, index) => (
//                 <TouchableOpacity
//                   key={index}
//                   style={styles.suggestionChip}
//                   onPress={() => {
//                     updateField("UserName", item);
//                     debouncedCheck(item);
//                   }}
//                 >
//                   <Text style={styles.suggestionText}>@{item}</Text>
//                 </TouchableOpacity>
//               ))}
//             </ScrollView>
//           </View>
//         )}

//         <AppInput
//           label="Email"
//           placeholder="example@mail.com"
//           keyboardType="email-address"
//           value={formData.Email}
//           onChangeText={(v) => updateField("Email", v)}
//           error={getFieldError("Email")}
//         />

//         <View style={styles.phoneRow}>
//           <View style={styles.codeSelector}>
//             <Text style={styles.labelSmall}>Code</Text>
//             <TouchableOpacity
//               onPress={handleCountryToggle}
//               style={styles.pickerLike}
//             >
//               <Text style={styles.codeText}>
//                 {formData.PhoneCode === "92" ? "🇵🇰 +92" : "🇬🇧 +44"}
//               </Text>
//               <Ionicons name="chevron-down" size={14} color="#64748b" />
//             </TouchableOpacity>
//           </View>
//           <View style={{ flex: 1 }}>
//             <AppInput
//               label="Phone Number"
//               placeholder={
//                 formData.PhoneCode === "92" ? "3001234567" : "7123456789"
//               }
//               keyboardType="phone-pad"
//               value={formData.PhoneNumber}
//               onChangeText={(v) => updateField("PhoneNumber", v)}
//               error={getFieldError("PhoneNumber")}
//             />
//           </View>
//         </View>

//         <View style={styles.inputWrapper}>
//           <AppInput
//             label="Password"
//             placeholder="******"
//             secureTextEntry={!showPassword}
//             value={formData.Password}
//             onChangeText={(v) => updateField("Password", v)}
//             error={getFieldError("Password")}
//           />
//           <TouchableOpacity
//             style={styles.eyeIcon}
//             onPress={() => setShowPassword(!showPassword)}
//           >
//             <Ionicons
//               name={showPassword ? "eye-off" : "eye"}
//               size={20}
//               color="#64748b"
//             />
//           </TouchableOpacity>
//         </View>

//         <View style={styles.inputWrapper}>
//           <AppInput
//             label="Confirm Password"
//             placeholder="******"
//             secureTextEntry={!showConfirmPassword}
//             value={formData.ConfirmPassword}
//             onChangeText={(v) => updateField("ConfirmPassword", v)}
//             error={getFieldError("ConfirmPassword")}
//           />
//           <TouchableOpacity
//             style={styles.eyeIcon}
//             onPress={() => setShowConfirmPassword(!showConfirmPassword)}
//           >
//             <Ionicons
//               name={showConfirmPassword ? "eye-off" : "eye"}
//               size={20}
//               color="#64748b"
//             />
//           </TouchableOpacity>
//         </View>

//         <AppButton
//           title={loading ? "Registering..." : "REGISTER"}
//           onPress={() => handleRegister(formData)}
//           disabled={!usernameStatus?.isUnique || loading}
//           style={styles.registerBtn}
//         />

//         <TouchableOpacity
//           style={styles.footerLink}
//           onPress={() => router.push("/(unauthorized)/login")}
//         >
//           <Text style={styles.linkText}>
//             Already have an account? <Text style={styles.linkBold}>Login</Text>
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </AuthContainer>
//   );
// }

// const styles = StyleSheet.create({
//   responsiveWrapper: {
//     width: "100%",
//     maxWidth: 500,
//     paddingHorizontal: 24,
//   },
//   row: { flexDirection: "row" },
//   suggestionBox: { marginBottom: 15, marginTop: -5 },
//   suggestionChip: {
//     backgroundColor: "#f1f5f9",
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//     marginRight: 10,
//     borderWidth: 1,
//     borderColor: "#e2e8f0",
//   },
//   suggestionText: { color: "#0077b6", fontWeight: "700", fontSize: 13 },
//   phoneRow: { flexDirection: "row", alignItems: "center" },
//   codeSelector: { width: 100, marginRight: 10, marginBottom: 16 },
//   labelSmall: {
//     fontSize: 14,
//     color: "#64748b",
//     marginBottom: 6,
//     fontWeight: "600",
//   },
//   pickerLike: {
//     height: 52,
//     backgroundColor: "#f8fafc",
//     borderRadius: 30,
//     borderWidth: 1,
//     borderColor: "#e2e8f0",
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     paddingHorizontal: 10,
//   },
//   codeText: { fontSize: 14, fontWeight: "700", color: "#1e293b" },
//   inputWrapper: { position: "relative" },
//   eyeIcon: {
//     position: "absolute",
//     right: 15,
//     top: 35,
//     padding: 5,
//     zIndex: 10,
//   },
//   registerBtn: {
//     marginTop: 20,
//     height: 60,
//     borderRadius: 30,
//     backgroundColor: "#0077b6",
//   },
//   footerLink: { marginTop: 25, alignItems: "center" },
//   linkText: { color: Colors.tertiary, fontSize: 16 },
//   linkBold: { color: Colors.accent, fontWeight: "700" },
// });

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Colors } from "../../../constants/Theme";
import { AppButton } from "../../../components/AppButton";
import { AppInput } from "../../../components/AppInput";
import { useRouter } from "expo-router";
import { useRegister } from "../hooks/useRegister";
import { Ionicons } from "@expo/vector-icons";
import { AuthContainer } from "@/components/AuthContainer";

const INITIAL_FORM_STATE = {
  FirstName: "",
  LastName: "",
  UserName: "",
  Email: "",
  PhoneNumber: "",
  PhoneCode: "92",
  Password: "",
  ConfirmPassword: "",
  IsAvailable: true,
};

export default function RegisterScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const {
    handleRegister,
    loading,
    getFieldError,
    debouncedCheck,
    fieldStatuses,
    checkingFields,
    apiMessage,
  } = useRegister(() => {
    setFormData(INITIAL_FORM_STATE);
    setSuggestions([]);
  });

  useEffect(() => {
    // Check if either field has enough letters to start generating options
    if (formData.FirstName.length >= 2 || formData.LastName.length >= 2) {
      const first = formData.FirstName.toLowerCase().replace(/[^a-z]/g, "");
      const last = formData.LastName.toLowerCase().replace(/[^a-z]/g, "");

      // Fallback if inputs are empty or cleanups leave strings too short
      const baseCombined = `${first}${last}`;

      if (baseCombined.length > 2) {
        // Create variations using only letters:
        const list = [
          `${first}${last}`, // e.g., "johndoe"
          `${last}${first}`, // e.g., "doejohn"
          `${first}${last.charAt(0)}`, // e.g., "johnd" (First name + first letter of last)
          `${first.charAt(0)}${last}`, // e.g., "jdoe"  (First letter of first + last name)
        ];

        // Filter out empty entries, duplicates, and ensure strict safety compliance
        const uniqueCleanList = Array.from(new Set(list)).filter(
          (name) => name.length >= 3,
        );

        setSuggestions(uniqueCleanList);
      }
    } else {
      setSuggestions([]);
    }
  }, [formData.FirstName, formData.LastName]);

  const updateField = (name: string, value: any) => {
    let finalValue = value;

    if (name === "PhoneNumber") {
      let digits = value.replace(/\D/g, "");
      if (formData.PhoneCode === "92" || formData.PhoneCode === "44") {
        if (digits.startsWith("92") || digits.startsWith("44"))
          digits = digits.slice(2);
        if (digits.startsWith("0")) digits = digits.slice(1);
        digits = digits.slice(0, 10);
      }
      finalValue = digits;
    }

    setFormData((prev) => ({ ...prev, [name]: finalValue }));

    // Dynamic field check router mapping targets
    if (name === "UserName") debouncedCheck(finalValue, "userName");
    if (name === "Email") debouncedCheck(finalValue, "email");
    if (name === "PhoneNumber") debouncedCheck(finalValue, "phone");
  };

  const handleCountryToggle = () => {
    const nextCode = formData.PhoneCode === "92" ? "44" : "92";
    setFormData((prev) => ({ ...prev, PhoneCode: nextCode, PhoneNumber: "" }));
  };

  // Helper renderer to assign localized inline feedback indicators
  const renderFieldLabel = (
    labelTitle: string,
    fieldKey: "userName" | "email" | "phone",
  ) => {
    if (checkingFields[fieldKey]) {
      return (
        <View style={styles.labelStatusRow}>
          <Text style={styles.labelText}>{labelTitle}</Text>
          <ActivityIndicator
            size="small"
            color="#00b4d8"
            style={{ marginLeft: 6 }}
          />
        </View>
      );
    }
    const status = fieldStatuses[fieldKey];
    let icon = "";
    if (status) {
      icon = status.isUnique ? " ✅" : ` ❌ (${status.message})`;
    }
    return `${labelTitle}${icon}`;
  };

  return (
    <AuthContainer
      title="Create Account"
      apiMessage={apiMessage}
      loading={loading}
    >
      {/* Requirement 3: Screen Blocking/Blur Effect Structure 
        Wrapping the forms frame inside a relational block dynamically handles interactions
      */}
      <View
        style={[styles.responsiveWrapper, loading && { opacity: 0.5 }]}
        pointerEvents={loading ? "none" : "auto"}
      >
        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <AppInput
              label="First Name"
              placeholder="John"
              value={formData.FirstName}
              onChangeText={(v) => updateField("FirstName", v)}
              error={getFieldError("FirstName")}
            />
          </View>
          <View style={{ flex: 1 }}>
            <AppInput
              label="Last Name"
              placeholder="Doe"
              value={formData.LastName}
              onChangeText={(v) => updateField("LastName", v)}
              error={getFieldError("LastName")}
            />
          </View>
        </View>

        {/* Username input with live feedback */}
        <AppInput
          label={renderFieldLabel("User Name", "userName")}
          placeholder="Choose unique username (Letters only)"
          value={formData.UserName}
          onChangeText={(v) => updateField("UserName", v)}
          error={getFieldError("UserName")}
        />

        {suggestions.length > 0 && (
          <View style={styles.suggestionBox}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {suggestions.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionChip}
                  onPress={() => {
                    updateField("UserName", item);
                  }}
                >
                  <Text style={styles.suggestionText}>@{item}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Email input with validation */}
        <AppInput
          label={renderFieldLabel("Email", "email")}
          placeholder="example@mail.com"
          keyboardType="email-address"
          value={formData.Email}
          onChangeText={(v) => updateField("Email", v)}
          error={getFieldError("Email")}
        />

        {/* Phone Input layout */}
        <View style={styles.phoneRow}>
          <View style={styles.codeSelector}>
            <Text style={styles.labelSmall}>Code</Text>
            <TouchableOpacity
              onPress={handleCountryToggle}
              style={styles.pickerLike}
            >
              <Text style={styles.codeText}>
                {formData.PhoneCode === "92" ? "🇵🇰 +92" : "🇬🇧 +44"}
              </Text>
              <Ionicons name="chevron-down" size={14} color="#64748b" />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1 }}>
            <AppInput
              label={renderFieldLabel("Phone Number", "phone")}
              placeholder={
                formData.PhoneCode === "92" ? "3001234567" : "7123456789"
              }
              keyboardType="phone-pad"
              value={formData.PhoneNumber}
              onChangeText={(v) => updateField("PhoneNumber", v)}
              error={getFieldError("PhoneNumber")}
            />
          </View>
        </View>

        <View style={styles.inputWrapper}>
          <AppInput
            label="Password"
            placeholder="******"
            secureTextEntry={!showPassword}
            value={formData.Password}
            onChangeText={(v) => updateField("Password", v)}
            error={getFieldError("Password")}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? "eye-off" : "eye"}
              size={20}
              color="#64748b"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.inputWrapper}>
          <AppInput
            label="Confirm Password"
            placeholder="******"
            secureTextEntry={!showConfirmPassword}
            value={formData.ConfirmPassword}
            onChangeText={(v) => updateField("ConfirmPassword", v)}
            error={getFieldError("ConfirmPassword")}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Ionicons
              name={showConfirmPassword ? "eye-off" : "eye"}
              size={20}
              color="#64748b"
            />
          </TouchableOpacity>
        </View>

        <AppButton
          title={loading ? "Registering..." : "REGISTER"}
          onPress={() => handleRegister(formData)}
          disabled={
            loading ||
            !fieldStatuses.userName?.isUnique ||
            !fieldStatuses.email?.isUnique ||
            !fieldStatuses.phone?.isUnique
          }
          style={styles.registerBtn}
        />

        <TouchableOpacity
          style={styles.footerLink}
          onPress={() => router.push("/(unauthorized)/login")}
        >
          <Text style={styles.linkText}>
            Already have an account? <Text style={styles.linkBold}>Login</Text>
          </Text>
        </TouchableOpacity>
      </View>

      {/* Global intercepting activity indicator layer when screen is locked */}
      {/* {!loading && (
        <View style={styles.globalLockOverlay}>
          <ActivityIndicator size="large" color="#0077b6" />
          <Text style={styles.lockText}>Securing Account Matrix...</Text>
        </View>
      )} */}
    </AuthContainer>
  );
}

const styles = StyleSheet.create({
  responsiveWrapper: {
    width: "100%",
    maxWidth: 500,
    paddingHorizontal: 24,
  },
  row: { flexDirection: "row" },
  labelStatusRow: { flexDirection: "row", alignItems: "center" },
  labelText: { fontSize: 14, color: "#1e293b", fontWeight: "500" },
  suggestionBox: { marginBottom: 15, marginTop: -5 },
  suggestionChip: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  suggestionText: { color: "#0077b6", fontWeight: "700", fontSize: 13 },
  phoneRow: { flexDirection: "row", alignItems: "center" },
  codeSelector: { width: 100, marginRight: 10, marginBottom: 16 },
  labelSmall: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 6,
    fontWeight: "600",
  },
  pickerLike: {
    height: 52,
    backgroundColor: "#f8fafc",
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  codeText: { fontSize: 14, fontWeight: "700", color: "#1e293b" },
  inputWrapper: { position: "relative" },
  eyeIcon: {
    position: "absolute",
    right: 15,
    top: 35,
    padding: 5,
    zIndex: 10,
  },
  registerBtn: {
    marginTop: 20,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#0077b6",
  },
  footerLink: { marginTop: 25, alignItems: "center" },
  linkText: { color: Colors.tertiary, fontSize: 16 },
  linkBold: { color: Colors.accent, fontWeight: "700" },

  /* Absolute interaction intercept block styles */
  globalLockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  lockText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "600",
    color: "#0077b6",
  },
});
