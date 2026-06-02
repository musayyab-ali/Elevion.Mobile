// import React from "react";
// import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { useRouter, useNavigation } from "expo-router";
// import { Ionicons } from "@expo/vector-icons";
// import { StatusBar } from "expo-status-bar";
// import { Colors } from "../constants/Theme";

// interface ScreenHeaderProps {
//   title: string;
// }

// export const ScreenHeader = ({ title }: ScreenHeaderProps) => {
//   const insets = useSafeAreaInsets();
//   const router = useRouter();
//   const navigation = useNavigation();

//   // 🌟 DYNAMIC NAVIGATION GUARD: Safely check if the active screen can navigate back
//   const canGoBack = navigation.canGoBack();

//   return (
//     <View
//       style={[
//         styles.headerContainer,
//         {
//           paddingTop: insets.top + 12,
//           paddingBottom: 14,
//         },
//       ]}
//     >
//       <StatusBar style="light" translucent />

//       <View style={styles.contentRow}>
//         {/* Left Action Box Container */}
//         <View style={styles.actionContainer}>
//           {canGoBack && (
//             <TouchableOpacity
//               onPress={() => router.back()}
//               style={styles.backButton}
//               activeOpacity={0.7}
//               hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }} // Boosts structural touch surface targets
//             >
//               <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
//             </TouchableOpacity>
//           )}
//         </View>

//         {/* Scalable Absolute Center Text Label Element */}
//         <View style={styles.titleContainer}>
//           <Text style={styles.screenTitle} numberOfLines={1}>
//             {title}
//           </Text>
//         </View>

//         {/* Right Structural Alignment Mirror Counterweight */}
//         <View style={styles.actionContainer} />
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   headerContainer: {
//     backgroundColor: Colors.headerOne[0],
//     paddingHorizontal: 16,
//     width: "100%",
//     borderBottomWidth: 1,
//     borderColor: "rgba(255, 255, 255, 0.06)", // Luxury premium micro-divider stroke
//     // 🌟 PREVENTION FIX: Ensures native stack contexts don't miscalculate content heights
//     zIndex: 10,
//   },
//   contentRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     height: 44, // Modern standard commercial native alignment metric height
//   },
//   actionContainer: {
//     width: 40,
//     height: 44,
//     justifyContent: "center",
//     alignItems: "flex-start",
//   },
//   backButton: {
//     justifyContent: "center",
//     alignItems: "center",
//     marginLeft: -4,
//   },
//   titleContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingHorizontal: 8,
//   },
//   screenTitle: {
//     fontSize: 18, // Clean commercial standard size for a centered navbar title
//     fontWeight: "700",
//     color: "#FFFFFF",
//     letterSpacing: -0.3,
//     textAlign: "center",
//   },
// });

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { Colors } from "../constants/Theme";
import { LinearGradient } from "expo-linear-gradient";

interface ScreenHeaderProps {
  title?: string;
  headerTitleComponent?: React.ReactNode; // 🌟 Add support for custom components like breadcrumbs
}

export const ScreenHeader = ({
  title,
  headerTitleComponent,
}: ScreenHeaderProps) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const navigation = useNavigation();

  const canGoBack = navigation.canGoBack();

  return (
    <LinearGradient
      colors={[Colors.headerOne[0], Colors.headerOne[1]]}
      style={[
        styles.headerContainer,
        { paddingTop: insets.top + 12, paddingBottom: 14 },
      ]}
    >
      <StatusBar style="light" translucent />

      <View style={styles.contentRow}>
        {/* Left Back Arrow Container */}
        <View style={styles.actionContainer}>
          {canGoBack && (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
              activeOpacity={0.7}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Dynamic Center/Left Content Slot */}
        <View style={styles.titleContainer}>
          {headerTitleComponent ? (
            // 🌟 If a custom breadcrumb/component is provided, render it directly
            <View style={styles.customComponentWrapper}>
              {headerTitleComponent}
            </View>
          ) : (
            // Fallback to standard clean title text
            <Text style={styles.screenTitle} numberOfLines={1}>
              {title}
            </Text>
          )}
        </View>

        {/* Right Structural Alignment Frame */}
        <View style={styles.actionContainer} />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    // backgroundColor: Colors.headerOne[0],
    paddingHorizontal: 16,
    width: "100%",
    // borderBottomWidth: 1,
    // borderColor: "rgba(255, 255, 255, 0.06)",
    zIndex: 10,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 44,
  },
  actionContainer: {
    width: 32, // Slightly narrowed to give breadcrumbs more horizontal room
    height: 44,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  backButton: {
    justifyContent: "center",
    alignItems: "center",
    marginLeft: -4,
  },
  titleContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  customComponentWrapper: {
    width: "100%",
    justifyContent: "center",
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.3,
    textAlign: "left",
  },
});
