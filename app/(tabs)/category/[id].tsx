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
import { Colors } from "../../../constants/Theme";
import { FeaturedBanner } from "@/features/shop/components/FeaturedBanner";
import { useDiscovery } from "@/features/shop/hooks/useDiscovery";
import { CategoryCard } from "../../../features/shop/components/CategoryCard";
import { CategoryBreadcrumbs } from "@/features/shop/components/CategoryBreadcrumbs";

export default function SubCategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { subCategories, bannerProducts, breadcrumbs, loading } =
    useDiscovery(id);

  const handlePress = (item: any) => {
    if (item.IsLeafNode) {
      router.push({
        pathname: "/(tabs)/category/products",
        params: { categoryId: item.CategoryId, categoryName: item.Name },
      });
    } else {
      router.push({
        pathname: "/(tabs)/category/[id]",
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

  // Enterprise Grid Responsiveness Rule
  // Automatically scales columns based on width thresholds (Mobile, Phablet, Large Tablet)
  const calculatedColumns = width > 900 ? 4 : width > 600 ? 3 : 2;

  // Dynamically centers items if the odd last row has fewer children than column capacity
  const isOddRowAdjustmentNeeded =
    subCategories.length % calculatedColumns !== 0;

  return (
    // Container matches header color to let rounded canvas overlay seamlessly
    <View style={[styles.container, { backgroundColor: Colors.headerOne[0] }]}>
      <Stack.Screen
        options={{
          headerTitle: () => <CategoryBreadcrumbs breadcrumbs={breadcrumbs} />,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: Colors.headerOne[0] },
          headerTitleAlign: "left",
          headerLeft: () => null,
        }}
      />

      {/* Modern Professional Rounded Content Sheet Layer */}
      <View style={styles.contentCanvas}>
        <FlatList
          data={subCategories}
          numColumns={calculatedColumns}
          key={calculatedColumns} // Re-renders grid columns dynamically when device rotates
          keyExtractor={(item) => `sub-${item.CategoryId}`}
          columnWrapperStyle={[
            styles.rowWrapper,
            isOddRowAdjustmentNeeded && { justifyContent: "flex-start" },
          ]}
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <>
              {bannerProducts.length > 0 && (
                <View style={styles.bannerSpacing}>
                  <FeaturedBanner
                    data={bannerProducts}
                    variant="minimal"
                    onPress={(p) =>
                      router.push({
                        pathname: "/(tabs)/category/product-details",
                        params: { productId: p.ProductId },
                      })
                    }
                  />
                </View>
              )}
              {subCategories.length > 0 && (
                <Text style={styles.sectionTitle}>Featured For-U</Text>
              )}
            </>
          }
          renderItem={({ item }) => (
            <View
              style={[
                styles.gridCell,
                { maxWidth: `${100 / calculatedColumns}%` },
              ]}
            >
              <CategoryCard category={item} onPress={() => handlePress(item)} />
            </View>
          )}
          ListEmptyComponent={
            !bannerProducts.length ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No categories found here.</Text>
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
  /* The Content Canvas Masks Underlying Header Layers with Round Radiuses */
  contentCanvas: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
    // Premium soft depth shadow matrix
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  scrollContainer: {
    paddingTop: 16,
    paddingBottom: 110, // Generous padding to clear your absolute floating bottom tab bar cleanly
  },
  bannerSpacing: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 4,
  },
  rowWrapper: {
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  gridCell: {
    flex: 1,
    padding: 6,
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E293B",
    paddingHorizontal: 18,
    marginTop: 22,
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  emptyContainer: {
    marginTop: 100,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    color: "#94A3B8",
    fontSize: 15,
    fontWeight: "500",
    textAlign: "center",
  },
});
