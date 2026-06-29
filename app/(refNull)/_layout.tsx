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
