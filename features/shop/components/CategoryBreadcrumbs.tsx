import React, { useRef } from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface Crumb {
  id: number;
  name: string;
  isLeaf: boolean;
}

export const CategoryBreadcrumbs = ({
  breadcrumbs = [],
}: {
  breadcrumbs: Crumb[];
}) => {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const handlePress = (crumb: Crumb, isLast: boolean) => {
    if (isLast) return;

    router.push({
      pathname: "/(product)/[id]",
      params: { id: crumb.id.toString(), name: crumb.name },
    });
  };

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
      onContentSizeChange={() => {
        // Auto-scrolls to focus bold, current screen heading text dynamically
        scrollRef.current?.scrollToEnd({ animated: true });
      }}
    >
      <TouchableOpacity onPress={() => router.replace("/(tabs)")}>
        <Text style={styles.inactiveCrumb}>Home</Text>
      </TouchableOpacity>

      {breadcrumbs.map((crumb, idx) => {
        const isLast = idx === breadcrumbs.length - 1;
        return (
          <View key={`${crumb.id}-${idx}`} style={styles.wrapper}>
            <Ionicons
              name="chevron-forward"
              size={12}
              color="rgba(255,255,255,0.4)"
              style={styles.chevron}
            />
            <TouchableOpacity
              onPress={() => handlePress(crumb, isLast)}
              disabled={isLast}
            >
              <Text
                style={[styles.inactiveCrumb, isLast && styles.activeCrumb]}
                numberOfLines={1}
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
  container: {
    alignItems: "center",
    paddingVertical: 8,
    paddingRight: 24,
  },
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  chevron: {
    marginHorizontal: 6,
  },
  inactiveCrumb: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "400",
  },
  activeCrumb: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
