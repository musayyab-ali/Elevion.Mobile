import React, { useCallback } from "react";
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";

import { CategoryCard } from "./CategoryCard";
import { Colors } from "../../../constants/Theme";
import { CategorySkeleton } from "./CategorySkeleton";
import { FeaturedBanner } from "./FeaturedBanner";
import { ShopHeader } from "./ShopHeader";
import { HomeProductMiniCard } from "./HomeProductMiniCard";
import { useDiscovery } from "../hooks/useDiscovery";
import { EmptyState } from "@/components/EmptyState";
import { ProductMiniSkeleton } from "./ProductMiniSkeleton";
import { CategorySkeletonHorizontal } from "./CategorySkeletonHorizintal";
import { WelcomeModal } from "@/components/WelcomeModal";
export const ShopHomeScreen = () => {
  const router = useRouter();
  const {
    subCategories,
    bannerProducts,
    homeSections,
    loading,
    serverError,
    loadDiscoveryData,
  } = useDiscovery();
  const { width } = useWindowDimensions();

  const handleCategoryPress = useCallback(
    (category: any) => {
      if (category?.IsLeafNode) {
        router.push({
          pathname: "/(product)/products",
          params: {
            categoryId: category.CategoryId,
            categoryName: category.Name,
          },
        });
      } else {
        router.push({
          pathname: "/(product)/[id]",
          params: { id: category.CategoryId.toString(), name: category.Name },
        });
      }
    },
    [router],
  );

  const handleProductPress = useCallback(
    (product: any) => {
      router.push({
        pathname: "/(product)/product-details",
        params: { productId: product.ProductId },
      });
    },
    [router],
  );

  // Optimized Render Function for Child Products Horizontal Row List
  const renderProductRow = useCallback(
    ({ item }: { item: any }) => (
      <HomeProductMiniCard product={item} onPress={handleProductPress} />
    ),
    [handleProductPress],
  );

  // Master Render Function for Dynamic Parent Category Layout Sections
  const renderCategoryBlockSection = useCallback(
    ({ item }: { item: any }) => {
      const sectionCategory = item?.Category;
      const sectionCategoryName = sectionCategory?.CategoryName;
      const productsList = item?.ProductList ?? [];

      if (productsList.length === 0) return null;

      return (
        <View style={styles.sectionBlockContainer}>
          {/* Dynamic Category Section Title Header */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>
              {sectionCategoryName || "Special Collection"}
            </Text>
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() => handleCategoryPress(sectionCategory)}
            >
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {/* Horizontal Layer Specialized Virtualization Track */}
          <FlatList
            data={productsList}
            horizontal
            renderItem={renderProductRow}
            keyExtractor={(product) => `section-prod-${product.ProductId}`}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalTrackPadding}
            initialNumToRender={4}
            maxToRenderPerBatch={4}
            windowSize={3}
            removeClippedSubviews={true}
          />
        </View>
      );
    },
    [renderProductRow, handleCategoryPress],
  );

  if (loading) {
    return (
      <View
        style={[styles.container, { backgroundColor: Colors.headerOne[1] }]}
      >
        {/* Persistent App Header Navigation Bar */}
        <ShopHeader />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.skeletonCanvasScroll}
        >
          {/* Top Level Hero Commercial Promotional Banner Slot */}
          <View style={styles.bannerSkeletonWrapper}>
            <CategorySkeleton style={{ width: "100%" }} />
            {/* Note: If your original component was actually named HomeBannerSkeleton, swap this line directly back to it! */}
          </View>

          {/* Circular Category Section Row Header & Cards Track */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderLine}>
              <Text style={styles.sectionTitlePlaceholder}>
                Explore Categories
              </Text>
            </View>
            <CategorySkeletonHorizontal />
          </View>

          {/* Premium E-Commerce Product Carousel Sections Grid */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderLine}>
              <Text style={styles.sectionTitlePlaceholder}>Trending Drops</Text>
            </View>
            <ProductMiniSkeleton />
          </View>

          {/* Secondary Shelf Grid Section Replicas */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderLine}>
              <Text style={styles.sectionTitlePlaceholder}>
                Recommended Just For You
              </Text>
            </View>
            <ProductMiniSkeleton />
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors.headerOne[1] }]}>
      <ShopHeader />

      {serverError ? (
        <View style={styles.contentCanvas}>
          <EmptyState
            iconName="cloud-offline-outline"
            title="Server Connection Interrupted"
            description="We are having trouble synchronizing our collection. Please check your network and try again."
            actionLabel="Retry Connection"
            onActionPress={loadDiscoveryData}
          />
        </View>
      ) : (
        <View style={styles.contentCanvas}>
          <FlatList
            data={homeSections}
            renderItem={renderCategoryBlockSection}
            keyExtractor={(item, index) =>
              `home-section-${item?.Category?.CategoryId || index}`
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContainer}
            removeClippedSubviews={true}
            initialNumToRender={3}
            maxToRenderPerBatch={3}
            windowSize={5}
            ListHeaderComponent={
              <>
                {/* 1. Feature Carousel Banners */}
                {bannerProducts.length > 0 && (
                  <View style={styles.bannerContainer}>
                    <FeaturedBanner
                      data={bannerProducts}
                      onPress={handleProductPress}
                    />
                  </View>
                )}

                {/* 2. Primary Top Categories Row Header Section */}
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Explore Categories</Text>
                </View>

                {/* 3. Horizontal Parent Channels Track */}
                <FlatList
                  data={subCategories}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  keyExtractor={(item) => `parent-cat-${item.CategoryId}`}
                  contentContainerStyle={styles.horizontalTrackPadding}
                  renderItem={({ item }) => (
                    <CategoryCard
                      category={item}
                      onPress={() => handleCategoryPress(item)}
                    />
                  )}
                />

                <View style={styles.dividerLine} />
              </>
            }
            ListEmptyComponent={
              <EmptyState
                iconName="grid-outline"
                title="No Products Available"
                description="Our premium seasonal catalogs are currently undergoing maintenance updates."
                actionLabel="Refresh Catalog"
                onActionPress={loadDiscoveryData}
              />
            }
          />
        </View>
      )}
      <WelcomeModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentCanvas: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: "hidden",
  },
  scrollContainer: {
    paddingBottom: 130, // Safe padding over absolute tabs
  },
  bannerContainer: {
    width: "100%",
    backgroundColor: "transparent",
    marginBottom: 8,
  },
  sectionBlockContainer: {
    marginBottom: 10,
    marginTop: 6,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 14,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  viewAllLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.headerOne[0],
    paddingLeft: 10,
  },
  horizontalTrackPadding: {
    paddingHorizontal: 14,
    paddingBottom: 6,
  },
  seeAllButton: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },
  dividerLine: {
    height: 1,
    backgroundColor: "#EDF2F7",
    marginHorizontal: 20,
    marginTop: 22,
    marginBottom: 8,
  },
  skel: {
    marginTop: 20,
    marginHorizontal: 20,
    marginBottom: 15,
  },

  skeletonCanvasScroll: {
    paddingBottom: 40,
    backgroundColor: "#F8FAFC",
  },
  bannerSkeletonWrapper: {
    marginVertical: 20,
    width: "100%",
    paddingHorizontal: 20,
  },
  sectionContainer: {
    marginTop: 18,
    marginBottom: 10,
  },
  sectionHeaderLine: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitlePlaceholder: {
    fontSize: 15,
    fontWeight: "700",
    color: "#94A3B8", // Subtle editorial text placeholder tone
    letterSpacing: -0.2,
  },
});
