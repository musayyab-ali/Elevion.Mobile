import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";
import { Colors } from "@/constants/Theme";
import { ScreenHeader } from "@/components/ScreenHeader";
export default function CartLayout() {
  return (
    <SafeAreaView style={styles.safeContainer} edges={["bottom"]}>
      <Stack
        screenOptions={{
          headerShown: true,
          header: ({ options, route }) => (
            <ScreenHeader title={options.title || route.name} />
          ),
        }}
      >
        <Stack.Screen name="cart" options={{ title: "My Cart" }} />
        <Stack.Screen name="checkout-summary" options={{ title: "CheckOut" }} />
        <Stack.Screen name="payment-methods" options={{ title: "Payment" }} />
        <Stack.Screen
          name="order-confirmation"
          options={{ title: "Confirm Order" }}
        />
      </Stack>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
});
