import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from "react-native";
import { MotiView } from "moti";
import { LinearGradient } from "expo-linear-gradient";
import { Skeleton } from "moti/skeleton";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Theme";
import { useWishlistScreen } from "../hooks/useWishlistScreen";
import { useAuth } from "@/store/AuthContext";
import { useWishlist } from "../hooks/useWishlist";
import { CustomErrorMessage } from "@/components/CustomErrorMessage";
import { PremiumGuestGate } from "@/components/PremiumGuestGate";
import { EmptyState } from "@/components/EmptyState";

const PLACEHOLDER_IMAGE_BANNER =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/No-Image-Placeholder-banner.svg/1280px-No-Image-Placeholder-banner.svg.png";

const { width } = Dimensions.get("window");
// (Screen width - horizontal padding - gap between columns) / 2
const CARD_WIDTH = (width - 32 - 12) / 2;

export const WishlistScreen = () => {
  const { isAuthenticated } = useAuth();
  const {
    wishlistItems,
    loading,
    refreshing,
    serverError,
    isProcessing,
    loadingMore,
    handleNavigateToDetails,
    handleRemoveItem,
    handleRefresh,
    handleRetryFetch,
    handleLoadMore,
  } = useWishlistScreen();

  const { wishMessage } = useWishlist();

  if (!isAuthenticated) {
    return <PremiumGuestGate screenType="wishlist" />;
  }

  // Updated skeleton to reflect the 2-column layout
  const renderSkeletons = () => (
    <View style={styles.skeletonGridContainer}>
      {Array.from({ length: 6 }).map((_, index) => (
        <MotiView
          key={`skel-grid-${index}`}
          from={{ opacity: 0.6 }}
          animate={{ opacity: 1 }}
          transition={{
            type: "timing",
            duration: 900,
            loop: true,
            repeatReverse: true,
          }}
          style={styles.skeletonGridCard}
        >
          <Skeleton colorMode="light" width="100%" height="100%" radius={16} />
          {/* Top Right Heart Skeleton */}
          <View style={styles.skeletonTopRight}>
            <Skeleton colorMode="light" width={32} height={32} radius={16} />
          </View>
          {/* Bottom Meta Skeleton */}
          <View style={styles.skeletonBottomContent}>
            <Skeleton colorMode="light" width="80%" height={14} radius={4} />
            <Skeleton colorMode="light" width="50%" height={12} radius={4} />
          </View>
        </MotiView>
      ))}
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.listFooter}>
        {loadingMore && (
          <ActivityIndicator size="small" color={Colors.primary} />
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {loading && !refreshing ? (
        renderSkeletons()
      ) : (
        <>
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
              data={wishlistItems}
              keyExtractor={(item) => `wish-${item.ProductId}`}
              numColumns={2}
              columnWrapperStyle={styles.columnWrapper}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.3}
              maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
              removeClippedSubviews={true}
              ListFooterComponent={renderFooter}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  tintColor={Colors.primary}
                />
              }
              ListHeaderComponent={
                wishlistItems.length > 0 ? (
                  <View style={styles.headerTextContainer}>
                    <View style={styles.headerFlexRow}>
                      <Text style={styles.headerTitleText}>My Wishlist</Text>
                      <Text style={styles.savedCounterCount}>
                        {wishlistItems.length}{" "}
                        {wishlistItems.length === 1 ? "Item" : "Items"}
                      </Text>
                    </View>
                    <View style={styles.headerUnderline} />
                  </View>
                ) : null
              }
              renderItem={({ item, index }) => {
                const imageUri = item.ProductImage
                  ? item.ProductImage
                  : PLACEHOLDER_IMAGE_BANNER;
                const processingState = isProcessing(item.ProductId);

                return (
                  <MotiView
                    from={{ opacity: 0, scale: 0.92, translateY: 20 }}
                    animate={{ opacity: 1, scale: 1, translateY: 0 }}
                    transition={{
                      type: "timing",
                      duration: 400,
                      delay: index * 40,
                    }}
                  >
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => handleNavigateToDetails(item.ProductId)}
                      style={styles.gridCardWrapper}
                    >
                      <ImageBackground
                        source={{ uri: imageUri }}
                        style={styles.backgroundImage}
                        imageStyle={styles.backgroundImageRadius}
                      >
                        <LinearGradient
                          colors={[
                            "rgba(15, 23, 42, 0.25)",
                            "transparent",
                            "rgba(15, 23, 42, 0.85)",
                          ]}
                          locations={[0, 0.4, 1]}
                          style={styles.gradientOverlay}
                        >
                          {/* Top Row: Out of Stock Badge (Left) & Heart Button (Right) */}
                          <View style={styles.topRowContainer}>
                            {!item.InStock ? (
                              <View style={styles.outOfStockBadge}>
                                <Text style={styles.outOfStockText}>
                                  Out of Stock
                                </Text>
                              </View>
                            ) : (
                              <View /> // Empty spacer when stock is fine
                            )}

                            <TouchableOpacity
                              style={styles.removeFloatingButton}
                              activeOpacity={0.8}
                              disabled={processingState}
                              onPress={() => handleRemoveItem(item.ProductId)}
                            >
                              {processingState ? (
                                <ActivityIndicator
                                  size="small"
                                  color="#FF3B30"
                                />
                              ) : (
                                <Ionicons
                                  name="heart"
                                  size={16}
                                  color="#FF3B30"
                                />
                              )}
                            </TouchableOpacity>
                          </View>

                          {/* Bottom Row: Product Name & Price */}
                          <View style={styles.bottomMetaContainer}>
                            <Text style={styles.productName} numberOfLines={1}>
                              {item.ProductName}
                            </Text>
                            <Text style={styles.priceString} numberOfLines={1}>
                              {item.MinPrice === item.MaxPrice
                                ? `Rs. ${item.MinPrice.toLocaleString()}`
                                : `Rs. ${item.MinPrice.toLocaleString()} - ${item.MaxPrice.toLocaleString()}`}
                            </Text>
                          </View>
                        </LinearGradient>
                      </ImageBackground>
                    </TouchableOpacity>
                  </MotiView>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <View style={styles.emptyIconCircle}>
                    <Ionicons name="heart-outline" size={32} color="#FFFFFF" />
                  </View>
                  <Text style={styles.emptyTitle}>Your Vault is Empty</Text>
                  <Text style={styles.emptySubtitle}>
                    Begin cultivating your aesthetic archive by saving items
                    from the main collections.
                  </Text>
                </View>
              }
            />
          )}
        </>
      )}
      {wishMessage && <CustomErrorMessage>{wishMessage}</CustomErrorMessage>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  listContent: {
    paddingTop: 24,
    paddingBottom: 30,
    paddingHorizontal: 16,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  listFooter: {
    paddingBottom: 104,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextContainer: {
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  headerFlexRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingBottom: 8,
  },
  headerTitleText: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.accent,
    letterSpacing: -0.5,
  },
  savedCounterCount: {
    fontSize: 14,
    color: Colors.darkError,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  headerUnderline: {
    height: 2,
    backgroundColor: Colors.darkError,
    width: 50,
  },

  // Grid Card Styles
  gridCardWrapper: {
    width: CARD_WIDTH,
    height: 220,
    borderRadius: 16,
    backgroundColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
  },
  backgroundImageRadius: {
    borderRadius: 16,
  },
  gradientOverlay: {
    flex: 1,
    borderRadius: 16,
    justifyContent: "space-between",
    padding: 10,
  },

  // Card Content Layout
  topRowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  outOfStockBadge: {
    backgroundColor: "rgba(239, 68, 68, 0.9)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  outOfStockText: {
    color: "#FFFFFF",
    fontSize: 8,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  removeFloatingButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  bottomMetaContainer: {
    marginTop: "auto",
  },
  productName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: -0.2,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  priceString: {
    color: "#38BDF8",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },

  // Empty State Styles
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 120,
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.accent,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.accent,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "500",
  },

  // Skeleton Styles
  skeletonGridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  skeletonGridCard: {
    width: CARD_WIDTH,
    height: 220,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    marginBottom: 12,
    position: "relative",
  },
  skeletonTopRight: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  skeletonBottomContent: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    gap: 6,
  },
});
