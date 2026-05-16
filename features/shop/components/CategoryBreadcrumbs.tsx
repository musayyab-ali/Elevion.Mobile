// features/shop/components/CategoryBreadcrumbs.tsx
import React from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors } from "../../../constants/Theme";

interface Crumb {
  id: number;
  name: string;
  isLeaf: boolean;
}

export const CategoryBreadcrumbs = ({
  breadcrumbs,
}: {
  breadcrumbs: Crumb[];
}) => {
  const router = useRouter();

  const handlePress = (crumb: Crumb, isLast: boolean) => {
    if (isLast) return;

    router.push({
      pathname: "/(tabs)/category/[id]",
      params: { id: crumb.id.toString(), name: crumb.name },
    });
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      <TouchableOpacity onPress={() => router.replace("/(tabs)/category")}>
        <Text style={styles.inactiveCrumb}>Home</Text>
      </TouchableOpacity>

      {breadcrumbs.map((crumb, idx) => {
        const isLast = idx === breadcrumbs.length - 1;
        return (
          <View key={crumb.id} style={styles.wrapper}>
            <Ionicons
              name="chevron-forward"
              size={12}
              color="rgba(255,255,255,0.6)"
              style={styles.chevron}
            />
            <TouchableOpacity
              onPress={() => handlePress(crumb, isLast)}
              disabled={isLast}
            >
              <Text
                style={[styles.inactiveCrumb, isLast && styles.activeCrumb]}
              >
                {crumb.name}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: "center", paddingVertical: 8, paddingRight: 16 },
  wrapper: { flexDirection: "row", alignItems: "center" },
  chevron: { marginHorizontal: 4 },
  inactiveCrumb: {
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    fontWeight: "400",
  },
  activeCrumb: { color: "#FFFFFF", fontWeight: "800" },
});
