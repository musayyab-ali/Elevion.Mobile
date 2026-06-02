import React from "react";
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CategoryCard } from "./CategoryCard";
import { Colors } from "../../../constants/Theme";
import { CategorySkeleton } from "./CategorySkeleton";
import { FeaturedBanner } from "./FeaturedBanner";
import { ShopHeader } from "./ShopHeader";
import { useDiscovery } from "../hooks/useDiscovery";
import { EmptyState } from "@/components/EmptyState";
export const ShopHomeScreen = () => {
  const router = useRouter();
  const {
    subCategories,
    bannerProducts,
    loading,
    serverError,
    loadDiscoveryData,
  } = useDiscovery();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const handleCategoryPress = (category: any) => {
    if (category?.IsLeafNode) {
      router.push({
        pathname: "/(tabs)/category/products",
        params: {
          categoryId: category.CategoryId,
          categoryName: category.Name,
        },
      });
    } else {
      router.push({
        pathname: "/(tabs)/category/[id]",
        params: {
          id: category.CategoryId.toString(),
          name: category.Name,
        },
      });
    }
  };

  const handleRetryFetch = () => {
    loadDiscoveryData();
  };

  const handleProductPress = (product: any) => {
    router.push({
      pathname: "/(tabs)/category/product-details",
      params: { productId: product.ProductId },
    });
  };

  // Modern Cross-Platform Responsive Column Matrix Rules
  const calculatedColumns = width > 900 ? 4 : width > 600 ? 3 : 2;
  const isOddRowAdjustmentNeeded =
    subCategories.length % calculatedColumns !== 0;

  return (
    <View style={[styles.container, { backgroundColor: Colors.headerOne[1] }]}>
      <ShopHeader />
      {loading ? (
        <View style={styles.contentCanvas}>
          <View style={styles.skel}>
            <CategorySkeleton style={{ width: "100%" }} />
          </View>
          <FlatList
            data={[1, 2, 3, 4, 5, 6]}
            numColumns={calculatedColumns}
            key={calculatedColumns}
            keyExtractor={(item) => `skeleton-${item}`}
            columnWrapperStyle={styles.rowWrapper}
            renderItem={() => (
              <View
                style={[
                  styles.gridCell,
                  { maxWidth: `${100 / calculatedColumns}%` },
                ]}
              >
                <CategorySkeleton />
              </View>
            )}
          />
        </View>
      ) : (
        <View style={styles.contentCanvas}>
          {serverError ? (
            <EmptyState
              iconName="cloud-offline-outline"
              title="Server Connection Interrupted"
              description="We are having trouble synchronizing our collection. Please check your network and try again."
              actionLabel="Retry Connection"
              onActionPress={handleRetryFetch}
            />
          ) : (
            <FlatList
              data={subCategories}
              numColumns={calculatedColumns}
              key={calculatedColumns} // Re-bind grid dimensions smoothly upon device rotation
              keyExtractor={(item) => item.CategoryId.toString()}
              columnWrapperStyle={[
                styles.rowWrapper,
                isOddRowAdjustmentNeeded && { justifyContent: "flex-start" },
              ]}
              contentContainerStyle={styles.scrollContainer}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                <>
                  {bannerProducts.length > 0 && (
                    <View style={styles.bannerContainer}>
                      <FeaturedBanner
                        data={bannerProducts}
                        onPress={handleProductPress}
                      />
                    </View>
                  )}
                  <Text style={styles.sectionTitle}>Explore Categories</Text>
                </>
              }
              renderItem={({ item }) => (
                <View
                  style={[
                    styles.gridCell,
                    { maxWidth: `${100 / calculatedColumns}%` },
                  ]}
                >
                  <CategoryCard
                    category={item}
                    onPress={() => handleCategoryPress(item)}
                  />
                </View>
              )}
              ListEmptyComponent={
                <EmptyState
                  iconName="grid-outline"
                  title="No Categories Available"
                  description="Our premium seasonal catalogs are currently undergoing maintenance updates. Check back shortly for our fresh drops!"
                  actionLabel="Refresh Catalog"
                  onActionPress={handleRetryFetch}
                />
              }
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  /* The Content Canvas Masks Underlying Header Layers with Professional Rounded Cutouts */
  contentCanvas: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  scrollContainer: {
    paddingTop: 16,
    paddingBottom: 110, // Gives standard breathing space clearance over your absolute tab bar
  },
  bannerContainer: {
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
    fontSize: 19,
    fontWeight: "800",
    color: "#1E293B",
    paddingHorizontal: 18,
    marginTop: 22,
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  emptyContainer: {
    marginTop: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: "#94A3B8",
    fontSize: 15,
    fontWeight: "500",
  },
  /* Skeleton Loading Styles */
  headerContainer: {
    backgroundColor: Colors.headerOne[0],
    paddingHorizontal: 20,
    paddingBottom: 20,
    marginBottom: 20,
  },
  skeletonText: {
    height: 15,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 4,
    width: "40%",
  },
  skel: {
    marginTop: 20,
    marginHorizontal: 20,
    marginBottom: 15,
  },
});
