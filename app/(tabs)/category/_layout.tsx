// app/(tabs)/category/_layout.tsx
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
      <Stack.Screen name="[id]" options={{ headerShown: true }} />
      <Stack.Screen name="products" options={{ headerShown: true }} />

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
  );
}
