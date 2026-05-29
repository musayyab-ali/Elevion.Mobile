import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/Theme"; // Adjust path to your theme
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
interface ScreenHeaderProps {
  title: string;
  onSearchPress?: () => void;
  onProfilePress?: () => void;
}

export const ScreenHeader = ({
  title,
  onSearchPress,
  onProfilePress,
}: ScreenHeaderProps) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    // REMOVE height: 100 and use dynamic padding
    <View
      style={[
        styles.headerContainer,
        { paddingTop: insets.top + 10, paddingBottom: 15 },
      ]}
    >
      {/* Remove Stack.Screen from here; it conflicts with the Layout header */}
      <StatusBar style="light" />
      <View style={styles.contentRow}>
        <Text style={styles.screenTitle}>{title}</Text>

        <View style={styles.iconGroup}>
          <TouchableOpacity
            style={styles.iconButton}
            // onPress={onSearchPress || (() => router.push("/search"))}
          >
            <Ionicons name="search-outline" size={24} color={Colors.white} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={
              onProfilePress || (() => router.push("/(tabs)/category/cart"))
            }
          >
            <Ionicons
              name="person-circle-outline"
              size={26}
              color={Colors.white}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: Colors.headerOne[0],
    paddingHorizontal: 20,
    width: "100%",
    // Height is now dynamic based on content + insets
  },
  contentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 40, // Keeps the inner row height consistent
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.white,
    letterSpacing: 0.5,
  },
  iconGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    marginLeft: 20,
    padding: 4,
  },
});
