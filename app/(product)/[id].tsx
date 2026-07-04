import React from "react";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Text,
  useWindowDimensions,
} from "react-native";
import { Colors } from "@/constants/Theme";
import { useDiscovery } from "@/features/shop/hooks/useDiscovery";
import { CategoryBreadcrumbs } from "@/features/shop/components/CategoryBreadcrumbs";
import { CategorySquareCard } from "@/features/shop/components/CategorySquareCard";
import Ionicons from "@expo/vector-icons/build/Ionicons";

export default function SubCategoryScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { subCategories, breadcrumbs, loading } = useDiscovery(id);

  const handlePress = (item: any) => {
    if (item.IsLeafNode) {
      router.navigate({
        pathname: "/(product)/products",
        params: { categoryId: item.CategoryId, categoryName: item.Name },
      });
    } else {
      router.navigate({
        pathname: "/(product)/[id]",
        params: { id: item.CategoryId.toString(), name: item.Name },
      });
    }
  };

  // Keep breadcrumbs structure solid even during loading sequences
  const safeBreadcrumbs = breadcrumbs?.length
    ? breadcrumbs
    : [{ id: Number(id) || 0, name: name || "Loading...", isLeaf: false }];

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <Stack.Screen
          options={{
            headerTitle: () => (
              <CategoryBreadcrumbs breadcrumbs={safeBreadcrumbs} />
            ),
            headerShadowVisible: false,
            headerStyle: { backgroundColor: Colors.headerOne[0] },
            headerTitleAlign: "left",
          }}
        />
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  }

  const calculatedColumns = width > 900 ? 4 : width > 600 ? 3 : 2;
  const isOddRowAdjustmentNeeded =
    subCategories.length % calculatedColumns !== 0;
  const dynamicHeading = name ? `${name}` : "Sub-Categories";

  return (
    <View style={[styles.container, { backgroundColor: Colors.white }]}>
      <Stack.Screen
        options={{
          headerTitle: () => <CategoryBreadcrumbs breadcrumbs={breadcrumbs} />,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: Colors.headerOne[0] },
          headerTitleAlign: "left",
        }}
      />

      <View style={styles.contentCanvas}>
        <FlatList
          data={subCategories}
          numColumns={calculatedColumns}
          key={calculatedColumns}
          keyExtractor={(item) => `sub-grid-cat-${item.CategoryId}`}
          columnWrapperStyle={[
            styles.rowWrapper,
            isOddRowAdjustmentNeeded && { justifyContent: "flex-start" },
          ]}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            subCategories.length > 0 ? (
              <View style={styles.headerBlock}>
                <View style={styles.headerRow}>
                  <Text style={styles.sectionTitle} numberOfLines={1}>
                    {dynamicHeading}
                  </Text>
                  <View style={styles.badgeBubble}>
                    <Text style={styles.badgeText}>
                      {subCategories.length}{" "}
                      {subCategories.length === 1 ? "Category" : "Categories"}
                    </Text>
                  </View>
                </View>
                {/* Decorative premium ambient accent line */}
                <View style={styles.accentLine} />
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <View
              style={[
                styles.gridCell,
                { maxWidth: `${100 / calculatedColumns}%` },
              ]}
            >
              <CategorySquareCard
                category={item}
                onPress={() => handlePress(item)}
              />
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons
                  name="bag-handle-outline"
                  size={44}
                  color={Colors.primary}
                />
              </View>
              <Text style={styles.emptyText}>No collections available.</Text>
            </View>
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  contentCanvas: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 4,
  },
  scrollContainer: {
    paddingTop: 5,
    paddingBottom: 110,
  },
  headerBlock: {
    marginBottom: 24,
    marginTop: 8,
    paddingHorizontal: 15,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700", // Extra bold weight for maximum visual dominance
    color: Colors.primary,
    letterSpacing: -0.5,
    flex: 1, // Forces the text wrapper to gracefully take up available space and truncate before colliding
    paddingRight: 16,
  },
  badgeBubble: {
    backgroundColor: "rgba(255, 255, 255, 0.08)", // Semi-transparent glassmorphic backing
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primary || "#38BDF8", // Uses your core brand theme color
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  accentLine: {
    height: 2,
    width: 40,
    backgroundColor: Colors.darkError,
    marginTop: 10,
    borderRadius: 1,
    opacity: 0.8,
  },
  // Ensures banner components sit completely centered edge-to-edge natively
  bannerWrapperCenter: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  rowWrapper: {
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  gridCell: {
    flex: 1,
    padding: 6,
  },

  emptyContainer: {
    justifyContent: "center",
    marginTop: 100,
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyText: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
});
