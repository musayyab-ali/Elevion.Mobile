import React, { useCallback, useRef } from "react";
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { CategoryCard } from "./CategoryCard";
import { Colors } from "../../../constants/Theme";
import { CategorySkeleton } from "./CategorySkeleton";
import { FeaturedBanner } from "./FeaturedBanner";
import { ShopHeader } from "./ShopHeader";
import { HomeProductMiniCard } from "./HomeProductMiniCard";
import { RecentlyViewedRail } from "./RecentlyViewedRail";
import { useDiscovery } from "../hooks/useDiscovery";
import { EmptyState } from "@/components/EmptyState";
import { ProductMiniSkeleton } from "./ProductMiniSkeleton";
import { CategorySkeletonHorizontal } from "./CategorySkeletonHorizintal";
import { WelcomeModal } from "@/components/WelcomeModal";

// Import our new component structures
import {
  PremiumHomeProductsCard,
  CARD_WIDTH,
  PremiumCardSkeleton,
} from "./PremiumHomeProductsCard";

export const ShopHomeScreen = () => {
  const router = useRouter();
  const {
    subCategories,
    bannerProducts,
    homeSections,
    loading,
    serverError,
    loadDiscoveryData,
    // Inject custom hooks parameters
    flaggedProducts,
    flaggedLoading,
    activeFlagTab,
    setActiveFlagTab,
    fetchFlaggedCollection,
  } = useDiscovery();

  // Reference for targeting sliding positions programmatically
  const flagFlatListRef = useRef<FlatList>(null);
  const currentScrollIndex = useRef<number>(0);

  // Interval Step Distance computation for dual column sliding layout mechanics
  const SNAP_INTERVAL = (CARD_WIDTH + 8) * 2;

  const handleSlidingNavigation = (direction: "NEXT" | "PREV") => {
    if (!flagFlatListRef.current || flaggedProducts.length === 0) return;

    const maxIndices = Math.ceil(flaggedProducts.length / 2) - 1;
    let nextIndex = currentScrollIndex.current;

    if (direction === "NEXT") {
      nextIndex = nextIndex < maxIndices ? nextIndex + 1 : maxIndices;
    } else {
      nextIndex = nextIndex > 0 ? nextIndex - 1 : 0;
    }

    currentScrollIndex.current = nextIndex;
    flagFlatListRef.current.scrollToOffset({
      offset: nextIndex * SNAP_INTERVAL,
      animated: true,
    });
  };

  const handleTabChange = (tab: "NEW" | "FEATURED") => {
    if (activeFlagTab === tab) return;
    setActiveFlagTab(tab);
    currentScrollIndex.current = 0; // Reset pagination tracker index variables
    flagFlatListRef.current?.scrollToOffset({ offset: 0, animated: false });
    fetchFlaggedCollection(tab);
  };

  const handleBannerPress = useCallback(
    (banner: any) => {
      if (!banner?.Clickable) return;
      if (banner.ProductId) {
        router.push({
          pathname: "/(product)/product-details",
          params: { productId: banner.ProductId },
        });
        return;
      }
      if (banner.CategoryId) {
        const findCategoryInTree = (tree: any[], targetId: number): any => {
          for (const node of tree) {
            if (node.CategoryId === targetId) return node;
            const children = node.children || node.Children || [];
            if (children.length > 0) {
              const found = findCategoryInTree(children, targetId);
              if (found) return found;
            }
          }
          return null;
        };
        const matchedCategory = findCategoryInTree(
          subCategories,
          Number(banner.CategoryId),
        );
        if (matchedCategory?.IsLeafNode) {
          router.push({
            pathname: "/(product)/products",
            params: {
              categoryId: banner.CategoryId.toString(),
              categoryName: matchedCategory.Name || "Products",
            },
          });
        } else {
          router.push({
            pathname: "/(product)/[id]",
            params: {
              id: banner.CategoryId.toString(),
              name: matchedCategory?.Name || "Collection",
            },
          });
        }
      }
    },
    [router, subCategories],
  );

  const handleCategoryPress = useCallback(
    (category: any) => {
      if (
        category?.IsLeafNode ||
        (!category?.IsLeafNode && category.children?.length === 0)
      ) {
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

  const handleHomeCategoryPress = useCallback(
    (category: any) => {
      router.push({
        pathname: "/(product)/products",
        params: {
          categoryId: category.CategoryId,
          categoryName: category.Name,
        },
      });
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

  const renderProductRow = useCallback(
    ({ item }: { item: any }) => (
      <HomeProductMiniCard product={item} onPress={handleProductPress} />
    ),
    [handleProductPress],
  );

  const renderCategoryBlockSection = useCallback(
    ({ item }: { item: any }) => {
      const sectionCategory = item?.Category;
      const sectionCategoryName = sectionCategory?.CategoryName;
      const productsList = item?.ProductList ?? [];

      if (productsList.length === 0) return null;

      return (
        <View style={styles.sectionBlockContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>
              {sectionCategoryName || "Special Collection"}
            </Text>
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() => handleHomeCategoryPress(sectionCategory)}
            >
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>

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
    [renderProductRow, handleHomeCategoryPress],
  );

  if (loading) {
    return (
      <View
        style={[styles.container, { backgroundColor: Colors.headerOne[1] }]}
      >
        <ShopHeader />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.skeletonCanvasScroll}
        >
          <View style={styles.bannerSkeletonWrapper}>
            <CategorySkeleton style={{ width: "100%" }} />
          </View>

          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderLine}>
              <Text style={styles.sectionTitlePlaceholder}>
                Explore Categories
              </Text>
            </View>
            <CategorySkeletonHorizontal />
          </View>

          {/* Premium Interstitial Showcase Loader Track */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderLine}>
              <Text style={styles.sectionTitlePlaceholder}>
                Special Collections
              </Text>
            </View>
            <View style={{ flexDirection: "row", paddingHorizontal: 16 }}>
              <PremiumCardSkeleton />
              <PremiumCardSkeleton />
            </View>
          </View>

          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderLine}>
              <Text style={styles.sectionTitlePlaceholder}>Trending Drops</Text>
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
                      onPress={handleBannerPress}
                    />
                  </View>
                )}

                <RecentlyViewedRail />

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
                <View style={styles.premiumShowcaseZone}>
                  {/* Styled Switch Segment Controls */}
                  <View style={styles.segmentedTabContainer}>
                    <TouchableOpacity
                      onPress={() => handleTabChange("NEW")}
                      style={[
                        styles.segmentButton,
                        activeFlagTab === "NEW" && styles.segmentButtonActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.segmentText,
                          activeFlagTab === "NEW" && styles.segmentTextActive,
                        ]}
                      >
                        New Arrivals
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleTabChange("FEATURED")}
                      style={[
                        styles.segmentButton,
                        activeFlagTab === "FEATURED" &&
                          styles.segmentButtonActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.segmentText,
                          activeFlagTab === "FEATURED" &&
                            styles.segmentTextActive,
                        ]}
                      >
                        Premium Picks
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Showcase Outer Track Wrapper with Side Control Steppers */}
                  <View style={styles.carouselOuterWrapper}>
                    {/* Left Icon Stepper */}
                    <TouchableOpacity
                      style={[styles.navArrowButton, styles.leftArrow]}
                      onPress={() => handleSlidingNavigation("PREV")}
                    >
                      <Ionicons name="chevron-back" size={20} color="#1E293B" />
                    </TouchableOpacity>

                    {flaggedLoading ? (
                      /* Professional Segment Switch Skeletons Track */
                      <View style={styles.flagLoaderFrame}>
                        <PremiumCardSkeleton />
                        <PremiumCardSkeleton />
                      </View>
                    ) : flaggedProducts.length === 0 ? (
                      /* Proportional Empty State Frame */
                      <View style={styles.emptyCollectionFrame}>
                        <Ionicons
                          name="radio-outline"
                          size={28}
                          color="#94A3B8"
                          style={{ marginBottom: 6 }}
                        />
                        <Text style={styles.emptyCollectionTitle}>
                          No{" "}
                          {activeFlagTab === "NEW"
                            ? "New Arrivals"
                            : "Premium Picks"}{" "}
                          Found
                        </Text>
                        <Text style={styles.emptyCollectionSubtitle}>
                          Check back later for our next seasonal drop.
                        </Text>
                      </View>
                    ) : (
                      <FlatList
                        ref={flagFlatListRef}
                        data={flaggedProducts}
                        horizontal
                        pagingEnabled={false}
                        snapToInterval={SNAP_INTERVAL}
                        decelerationRate="fast"
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => `flagged-${item.ProductId}`}
                        contentContainerStyle={styles.premiumTrackPadding}
                        renderItem={({ item }) => (
                          <PremiumHomeProductsCard
                            product={item}
                            onPress={handleProductPress}
                          />
                        )}
                      />
                    )}

                    {/* Right Icon Stepper */}
                    <TouchableOpacity
                      style={[styles.navArrowButton, styles.rightArrow]}
                      onPress={() => handleSlidingNavigation("NEXT")}
                    >
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="#1E293B"
                      />
                    </TouchableOpacity>
                  </View>
                </View>

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
  container: { flex: 1 },
  contentCanvas: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: "hidden",
  },
  scrollContainer: { paddingBottom: 130 },
  bannerContainer: {
    width: "100%",
    backgroundColor: "transparent",
    marginBottom: 8,
  },
  sectionBlockContainer: { marginBottom: 10, marginTop: 6 },
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
  horizontalTrackPadding: { paddingHorizontal: 14, paddingBottom: 6 },
  seeAllButton: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  seeAllText: { fontSize: 12, fontWeight: "700", color: Colors.primary },
  dividerLine: {
    height: 1,
    backgroundColor: "#EDF2F7",
    marginHorizontal: 20,
    marginTop: 22,
    marginBottom: 8,
  },
  skeletonCanvasScroll: { paddingBottom: 40, backgroundColor: "#F8FAFC" },
  bannerSkeletonWrapper: {
    marginVertical: 20,
    width: "100%",
    paddingHorizontal: 20,
  },
  sectionContainer: { marginTop: 18, marginBottom: 10 },
  sectionHeaderLine: { paddingHorizontal: 20, marginBottom: 12 },
  sectionTitlePlaceholder: {
    fontSize: 15,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: -0.2,
  },

  // FRESH SHOWCASE CORE LAYOUT THEMES
  premiumShowcaseZone: {
    marginTop: 30,
    marginBottom: 8,
  },
  segmentedTabContainer: {
    flexDirection: "row",
    alignSelf: "center",
    backgroundColor: Colors.white,
    padding: 4,
    borderRadius: 24,
    width: "85%",
    marginBottom: 16,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
  },
  segmentButtonActive: {
    backgroundColor: Colors.headerOne[0],
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.headerOne[0],
  },
  segmentTextActive: {
    color: Colors.white,
    fontWeight: "800",
  },
  carouselOuterWrapper: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 12,
  },
  premiumTrackPadding: {
    paddingHorizontal: 24,
    paddingBottom: 4,
  },
  // flagLoaderFrame: {
  //   height: 224,
  //   justifyContent: "center",
  //   alignItems: "center",
  // },
  navArrowButton: {
    position: "absolute",
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  leftArrow: {
    left: 16,
  },
  rightArrow: {
    right: 16,
  },

  flagLoaderFrame: {
    height: 220,
    width: "100%",
    flexDirection: "row",
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyCollectionFrame: {
    height: 220,
    width: "88%",
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyCollectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#475569",
    textAlign: "center",
    marginBottom: 2,
  },
  emptyCollectionSubtitle: {
    fontSize: 12,
    color: "#94A3B8",
    textAlign: "center",
  },
});
