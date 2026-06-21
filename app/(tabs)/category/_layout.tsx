// import { Stack } from "expo-router";
// import { Colors } from "@/constants/Theme";
// import { StyleSheet, View } from "react-native";
// import { ScreenHeader } from "@/components/ScreenHeader";

// export default function CategoryStackLayout() {
//   return (
//     <View style={styles.container}>
//       <Stack
//         screenOptions={{
//           headerShown: true,
//           // 🌟 UPDATED: Intercept and pass down options.title OR options.headerTitle
//           header: ({ options, route }) => (
//             <ScreenHeader
//               title={options.title || route.name}
//               headerTitleComponent={
//                 options.headerTitle ? (options.headerTitle as any)() : undefined
//               }
//             />
//           ),
//           animation: "slide_from_right",
//           animationDuration: 250,
//         }}
//       >
//         {/* Leave the definition open here; the header configuration will handle it dynamically */}
//         <Stack.Screen name="[id]" />

//         <Stack.Screen name="products" options={{ title: "Products" }} />
//         <Stack.Screen name="cart" options={{ title: "My Cart" }} />
//         <Stack.Screen
//           name="product-details"
//           options={{ title: "Product Details" }}
//         />
//       </Stack>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#FFFFFF" },
// });

import { Stack } from "expo-router";
import { Colors } from "@/constants/Theme";
import { StyleSheet, View } from "react-native";
import { ScreenHeader } from "@/components/ScreenHeader";

export default function CategoryStackLayout() {
  return (
    <View style={styles.container}>
      <Stack
        screenOptions={{
          headerShown: true,
          // Intercept stack arguments cleanly safely
          header: ({ options, route }) => (
            <ScreenHeader
              title={options.title || route.name}
              headerTitleComponent={
                options.headerTitle ? (options.headerTitle as any)() : undefined
              }
            />
          ),
          animation: "slide_from_right",
          // 🌟 FIX 4: Enables consistent hardware-backed screen pop animations
          animationTypeForReplace: "pop",
          animationDuration: 220,
          gestureEnabled: true,
          gestureDirection: "horizontal",
        }}
      >
        <Stack.Screen
          name="[id]"
          options={{
            title: "Collections",
          }}
        />
        <Stack.Screen name="products" options={{ title: "Products" }} />
        <Stack.Screen name="cart" options={{ title: "My Cart" }} />
        <Stack.Screen
          name="product-details"
          options={{ title: "Product Details" }}
        />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
});
