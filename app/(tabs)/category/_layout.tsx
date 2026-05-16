// import { Stack, useSegments } from "expo-router";
// import { useLayoutEffect } from "react";
// import { useNavigation } from "@react-navigation/native";
// import { Colors } from "../../../constants/Theme";

// export default function CategoryStackLayout() {
//   const navigation = useNavigation();
//   const segments = useSegments();

//   useLayoutEffect(() => {
//     // Segments returns an array of the current route path: ["(tabs)", "category", "product-details"]
//     // We check if the last item in the segment path matches our target screen
//     const currentScreen = segments[segments.length - 1];
//     console.log(currentScreen);
//     if (currentScreen === "product-details") {
//       // Hide the parent Tab Navigator's bar completely
//       navigation.getParent()?.setOptions({
//         tabBarStyle: { display: "none" },
//       });
//     } else {
//       // Re-apply your custom floating tab bar styles when returning to category or lists
//       navigation.getParent()?.setOptions({
//         tabBarStyle: {
//           backgroundColor: Colors.headerOne[0],
//           height: 70,
//           position: "absolute",
//           bottom: 10,
//           marginLeft: 10,
//           marginRight: 10,
//           borderRadius: 50,
//           borderTopWidth: 0,
//         },
//       });
//     }
//   }, [segments, navigation]);

//   return (
//     <Stack
//       screenOptions={{
//         headerStyle: { backgroundColor: Colors.headerOne[0] },
//         headerShadowVisible: false,
//         headerTintColor: "#FFFFFF",
//         animation: "slide_from_right",
//         animationDuration: 250,
//       }}
//     >
//       <Stack.Screen name="index" options={{ headerShown: false }} />
//       <Stack.Screen name="[id]" options={{ headerShown: true }} />
//       <Stack.Screen name="products" options={{ headerShown: true }} />
//       <Stack.Screen name="product-details" options={{ headerShown: true }} />
//     </Stack>
//   );
// }

import { Stack } from "expo-router";
import { Colors } from "../../../constants/Theme";

export default function CategoryStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.headerOne[0] },
        headerShadowVisible: false,
        headerTintColor: "#FFFFFF",
        animation: "slide_from_right",
        animationDuration: 250,
      }}
    >
      {/* Contains only your category dynamic browsing nodes */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[id]" options={{ headerShown: true }} />
    </Stack>
  );
}
