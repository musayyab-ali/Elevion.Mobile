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
// import { useRouter, Stack } from "expo-router";
// import { useRegister } from "../hooks/useRegister";
// import { Ionicons } from "@expo/vector-icons";

// import { AuthContainer } from "@/components/AuthContainer";
// const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");
// const isTablet = SCREEN_WIDTH > 600;

// export default function RegisterScreen() {
//   const router = useRouter();
//   const {
//     handleRegister,
//     loading,
//     getFieldError,
//     debouncedCheck,
//     usernameStatus,
//     isCheckingUser,
//     apiMessage,
//   } = useRegister();

//   const [formData, setFormData] = useState({
//     FirstName: "",
//     LastName: "",
//     UserName: "",
//     Email: "",
//     PhoneNumber: "",
//     PhoneCode: "92",
//     Password: "",
//     ConfirmPassword: "",
//     IsAvailable: true,
//   });

//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [suggestions, setSuggestions] = useState<string[]>([]);

//   // logic: Generate Username Suggestions
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
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     if (name === "UserName") debouncedCheck(value);
//   };

//   return (
//     <AuthContainer title="Create Account" apiMessage={apiMessage}>
//       <View style={styles.responsiveWrapper}>
//         {/* First & Last Name Row */}
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

//         {/* Username Field with inline Status */}
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

//         {/* logic: Username Suggestion Chips */}
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

//         {/* logic: Country Code & Phone Row */}
//         <View style={styles.phoneRow}>
//           <View style={styles.codeSelector}>
//             <Text style={styles.labelSmall}>Code</Text>
//             <TouchableOpacity
//               onPress={() =>
//                 updateField(
//                   "PhoneCode",
//                   formData.PhoneCode === "92" ? "44" : "92",
//                 )
//               }
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

//         {/* Password with Eye Toggle */}
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

//   // Suggestion Chips
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

//   // Phone Styles
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

//   // Password Logic
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
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Colors } from "../../../constants/Theme";
import { AppButton } from "../../../components/AppButton";
import { AppInput } from "../../../components/AppInput";
import { useRouter } from "expo-router";
import { useRegister } from "../hooks/useRegister";
import { Ionicons } from "@expo/vector-icons";
import { AuthContainer } from "@/components/AuthContainer";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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

  // Instantiating the hook with structural reset method passed down
  const {
    handleRegister,
    loading,
    getFieldError,
    debouncedCheck,
    usernameStatus,
    isCheckingUser,
    apiMessage,
  } = useRegister(() => {
    setFormData(INITIAL_FORM_STATE);
    setSuggestions([]);
  });

  useEffect(() => {
    if (formData.FirstName.length > 2 || formData.LastName.length > 2) {
      const base = (formData.FirstName + formData.LastName)
        .toLowerCase()
        .replace(/\s/g, "");
      const list = [
        `${base}${Math.floor(10 + Math.random() * 90)}`,
        `${formData.FirstName.toLowerCase()}_${Math.floor(100 + Math.random() * 900)}`,
        `${formData.LastName.toLowerCase()}${formData.FirstName.charAt(0).toLowerCase()}${Math.floor(10 + Math.random() * 99)}`,
      ];
      setSuggestions(list);
    }
  }, [formData.FirstName, formData.LastName]);

  const updateField = (name: string, value: any) => {
    let finalValue = value;

    if (name === "PhoneNumber") {
      // Keep numeric only
      let digits = value.replace(/\D/g, "");

      if (formData.PhoneCode === "92") {
        // Enforce removal of leading prefixes for PK
        if (digits.startsWith("92")) digits = digits.slice(2);
        if (digits.startsWith("0")) digits = digits.slice(1);
        // Max length 10 digits starting with 3 (e.g. 3001234567)
        finalValue = digits.slice(0, 10);
      } else if (formData.PhoneCode === "44") {
        // Enforce removal of leading prefixes for UK
        if (digits.startsWith("44")) digits = digits.slice(2);
        if (digits.startsWith("0")) digits = digits.slice(1);
        // Max length 10 digits starting with 7 (e.g. 7123456789)
        finalValue = digits.slice(0, 10);
      }
    }

    setFormData((prev) => ({ ...prev, [name]: finalValue }));
    if (name === "UserName") debouncedCheck(finalValue);
  };

  const handleCountryToggle = () => {
    const nextCode = formData.PhoneCode === "92" ? "44" : "92";
    setFormData((prev) => ({
      ...prev,
      PhoneCode: nextCode,
      PhoneNumber: "", // Clear number to avoid invalid lengths between region formats
    }));
  };

  return (
    <AuthContainer title="Create Account" apiMessage={apiMessage}>
      <View style={styles.responsiveWrapper}>
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

        <AppInput
          label={
            isCheckingUser ? (
              <ActivityIndicator size="small" color="#00b4d8" />
            ) : (
              `User Name ${usernameStatus?.isUnique ? "✅" : formData.UserName ? "❌" : ""}`
            )
          }
          placeholder="Choose a unique username"
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
                    debouncedCheck(item);
                  }}
                >
                  <Text style={styles.suggestionText}>@{item}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <AppInput
          label="Email"
          placeholder="example@mail.com"
          keyboardType="email-address"
          value={formData.Email}
          onChangeText={(v) => updateField("Email", v)}
          error={getFieldError("Email")}
        />

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
              label="Phone Number"
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
          disabled={!usernameStatus?.isUnique || loading}
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
});
