import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";
import { Colors } from "@/constants/Theme";
import { ScreenHeader } from "@/components/ScreenHeader";
export default function ProductLayout() {
  return (
    <SafeAreaView style={styles.safeContainer} edges={["bottom"]}>
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
        <Stack.Screen
          name="product-details"
          options={{ title: "Product Details" }}
        />
      </Stack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: Colors.headerOne[0],
  },
});
