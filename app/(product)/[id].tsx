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
import { FeaturedBanner } from "@/features/shop/components/FeaturedBanner";
import { useDiscovery } from "@/features/shop/hooks/useDiscovery";
import { CategoryBreadcrumbs } from "@/features/shop/components/CategoryBreadcrumbs";
import { CategorySquareCard } from "@/features/shop/components/CategorySquareCard";

export default function SubCategoryScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { subCategories, bannerProducts, breadcrumbs, loading } =
    useDiscovery(id);

  const handlePress = (item: any) => {
    if (item.IsLeafNode) {
      router.navigate({
        pathname: "/(product)/products",
        params: { categoryId: item.CategoryId, categoryName: item.Name },
      });
    } else {
      // Uses navigate to prevent stack corruption on sub-category loops
      router.navigate({
        pathname: "/(product)/[id]",
        params: { id: item.CategoryId.toString(), name: item.Name },
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary || "#38BDF8"} />
      </View>
    );
  }

  const calculatedColumns = width > 900 ? 4 : width > 600 ? 3 : 2;
  const isOddRowAdjustmentNeeded =
    subCategories.length % calculatedColumns !== 0;

  // Professional typography context
  const dynamicHeading = name ? `Explore ${name}` : "Sub-Categories";

  return (
    <View style={[styles.container, { backgroundColor: Colors.headerOne[1] }]}>
      <Stack.Screen
        options={{
          // 🌟 RESTORED: Professional dynamic breadcrumbs rendered directly in header
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
            <View style={styles.headerBlock}>
              {bannerProducts.length > 0 && (
                <View style={styles.bannerWrapperCenter}>
                  <FeaturedBanner
                    data={bannerProducts}
                    variant="minimal"
                    onPress={(p) =>
                      router.navigate({
                        pathname: "/(tabs)/category/product-details",
                        params: { productId: p.ProductId },
                      })
                    }
                  />
                </View>
              )}
              {subCategories.length > 0 && (
                <Text style={styles.sectionTitle}>{dynamicHeading}</Text>
              )}
            </View>
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
            !bannerProducts.length ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No available sub-collections discovered.
                </Text>
              </View>
            ) : null
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
    paddingTop: 4,
    paddingBottom: 110,
  },
  headerBlock: {
    width: "100%",
    alignItems: "center",
    marginTop: 16,
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
  // Refined Corporate Header Copywriting Metrics
  sectionTitle: {
    alignSelf: "flex-start",
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    paddingHorizontal: 16,
    marginTop: 18,
    marginBottom: 8,
    letterSpacing: -0.2,
    textTransform: "capitalize",
  },
  emptyContainer: {
    marginTop: 80,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    color: "#94A3B8",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
});
