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

export const WishlistScreen = () => {
  const { isAuthenticated } = useAuth();
  const {
    wishlistItems,
    loading,
    refreshing,
    serverError,
    isProcessing,
    handleNavigateToDetails,
    handleRemoveItem,
    handleRefresh,
    handleRetryFetch,
  } = useWishlistScreen();

  const { wishMessage } = useWishlist();

  if (!isAuthenticated) {
    return <PremiumGuestGate screenType="wishlist" />;
  }

  const renderSkeletons = () => (
    <View style={styles.skeletonContainer}>
      {Array.from({ length: 3 }).map((_, index) => (
        <MotiView
          key={`skel-banner-${index}`}
          from={{ opacity: 0.6 }}
          animate={{ opacity: 1 }}
          transition={{
            type: "timing",
            duration: 900,
            loop: true,
            repeatReverse: true,
          }}
          style={styles.skeletonBannerCard}
        >
          <Skeleton colorMode="light" width="100%" height="100%" radius={24} />
          <View style={styles.skeletonAbsoluteContent}>
            <View style={{ gap: 8 }}>
              <Skeleton colorMode="light" width={180} height={18} radius={6} />
              <Skeleton colorMode="light" width={100} height={14} radius={4} />
            </View>
            <Skeleton colorMode="light" width={46} height={46} radius={23} />
          </View>
        </MotiView>
      ))}
    </View>
  );

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
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
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
                    from={{ opacity: 0, scale: 0.95, translateY: 30 }}
                    animate={{ opacity: 1, scale: 1, translateY: 0 }}
                    transition={{
                      type: "timing",
                      duration: 500,
                      delay: index * 60,
                    }}
                  >
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => handleNavigateToDetails(item.ProductId)}
                      style={styles.bannerWrapper}
                    >
                      <ImageBackground
                        source={{ uri: imageUri }}
                        style={styles.backgroundImage}
                        imageStyle={styles.backgroundImageRadius}
                      >
                        <LinearGradient
                          colors={[
                            "rgba(15, 23, 42, 0.1)",
                            "rgba(15, 23, 42, 0.85)",
                          ]}
                          style={styles.gradientOverlay}
                        >
                          {!item.InStock && (
                            <View style={styles.outOfStockBadge}>
                              <Text style={styles.outOfStockText}>
                                Out of Stock
                              </Text>
                            </View>
                          )}

                          <View style={styles.bottomMetaContainer}>
                            <View style={styles.textContainer}>
                              <Text
                                style={styles.productName}
                                numberOfLines={1}
                              >
                                {item.ProductName}
                              </Text>
                              <Text
                                style={styles.priceString}
                                numberOfLines={1}
                              >
                                {item.MinPrice === item.MaxPrice
                                  ? `Rs. ${item.MinPrice.toLocaleString()}`
                                  : `Rs. ${item.MinPrice.toLocaleString()} - ${item.MaxPrice.toLocaleString()}`}
                              </Text>
                            </View>

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
                                  size={20}
                                  color="#FF3B30"
                                />
                              )}
                            </TouchableOpacity>
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
    paddingBottom: 120,
    paddingHorizontal: 16,
  },
  headerTextContainer: {
    marginBottom: 24,
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
  bannerWrapper: {
    width: "100%",
    height: 180,
    marginBottom: 16,
    borderRadius: 24,
    backgroundColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  backgroundImage: {
    width: "100%",
    height: "100%",
  },
  backgroundImageRadius: {
    borderRadius: 24,
  },
  gradientOverlay: {
    flex: 1,
    borderRadius: 24,
    justifyContent: "space-between",
    padding: 18,
  },
  outOfStockBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(239, 68, 68, 0.9)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  outOfStockText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  bottomMetaContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "auto",
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
  },
  productName: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  priceString: {
    color: "#38BDF8",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 4,
  },
  removeFloatingButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
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
  skeletonContainer: {
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  skeletonBannerCard: {
    width: "100%",
    height: 180,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    marginBottom: 16,
    position: "relative",
    paddingTop: 25,
  },
  skeletonAbsoluteContent: {
    position: "absolute",
    bottom: 18,
    left: 18,
    right: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
