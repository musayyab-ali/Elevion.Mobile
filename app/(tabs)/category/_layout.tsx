import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/Theme";
import { StyleSheet } from "react-native";
export default function CategoryStackLayout() {
  return (
    // <SafeAreaView style={styles.safeContainer} edges={["top", "bottom"]}>
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.headerOne[0] },
        headerShadowVisible: false,
        headerTintColor: "#FFFFFF",
        animation: "slide_from_right",
        animationDuration: 250,
      }}
    >
      <Stack.Screen name="[id]" options={{ headerShown: true }} />
      <Stack.Screen name="products" options={{ headerShown: true }} />

      <Stack.Screen
        name="cart"
        options={{
          title: "MY Cart",
          headerShown: true,
          // tabsBarStyle: { display: "none" },
        }}
      />
      {/* PERFECT TAB BAR HIDING LOGIC */}
      <Stack.Screen
        name="product-details"
        options={{
          headerShown: true,
          // This tells the native navigation context to hide the parent layout's bottom bar
          tabsBarStyle: { display: "none" },
        }}
      />
    </Stack>
    // </SafeAreaView>
  );
}

// const styles = StyleSheet.create({
//   safeContainer: {
//     flex: 1,
//     // 🌟 Set your primary background color here so your layout views never change color or flash white
//     backgroundColor: Colors.headerOne[0],
//   },
// });
