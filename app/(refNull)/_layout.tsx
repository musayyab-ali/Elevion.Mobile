import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";
import { Colors } from "@/constants/Theme";
import { ScreenHeader } from "@/components/ScreenHeader";
export default function refNullLayout() {
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
        <Stack.Screen name="all-reviews" options={{ title: "All Reviews" }} />
        <Stack.Screen name="settings" options={{ title: "Settings" }} />
        <Stack.Screen name="rewards" options={{ title: "Rewards" }} />
        <Stack.Screen name="privacy" options={{ title: "Privacy & Data" }} />
        <Stack.Screen name="contact" options={{ title: "Contact us" }} />
        <Stack.Screen name="returns" options={{ title: "My Returns" }} />
        <Stack.Screen name="new-return" options={{ title: "Return items" }} />
        <Stack.Screen name="gift-cards" options={{ title: "Gift Cards" }} />
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
