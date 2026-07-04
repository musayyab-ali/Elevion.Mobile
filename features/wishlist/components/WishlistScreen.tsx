import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
  RefreshControl,
} from "react-native";
import { MotiView } from "moti";
import { LinearGradient } from "expo-linear-gradient"; // Ensure expo-linear-gradient is installed
import { Skeleton } from "moti/skeleton";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/Theme";
import { useWishlistScreen } from "../hooks/useWishlistScreen";
import { useAuth } from "@/store/AuthContext";
import { useWishlist } from "../hooks/useWishlist";
import { CustomErrorMessage } from "@/components/CustomErrorMessage";
import { PremiumGuestGate } from "@/components/PremiumGuestGate";
import { EmptyState } from "@/components/EmptyState";
import { useSharedWishlistData } from "@/store/WishlistContext";

const PLACEHOLDER_IMAGE_BANNER =
  "https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/No-Image-Placeholder-banner.svg/1280px-No-Image-Placeholder-banner.svg.png";

export const WishlistScreen = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const {
    wishlistItems,
    loading,
    isProcessing,
    handleNavigateToDetails,
    handleRemoveItem,
  } = useWishlistScreen();
  const { wishMessage } = useWishlist();
  const { serverError, fetchWishlist, refreshing } = useSharedWishlistData();
  const handleRetryFetch = () => {
    fetchWishlist();
  };

  if (!isAuthenticated) {
    return <PremiumGuestGate screenType="wishlist" />;
  }

  // 1:1 Matching Immersive Horizontal Banner Shimmer
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
          {/* Mock Floating Content Elements */}
          <View style={styles.skeletonAbsoluteContent}>
            <View style={{ gap: 8 }}>
              <Skeleton colorMode="light" width={180} height={18} radius={6} />
              <Skeleton colorMode="light" width={100} height={14} radius={4} />
            </View>
            <Skeleton colorMode="light" width={40} height={40} radius={20} />
          </View>
        </MotiView>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
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
              ListHeaderComponent={
                wishlistItems.length > 0 ? (
                  <View style={styles.headerTextContainer}>
                    <Text style={styles.savedCounterSubtext}>
                      {wishlistItems.length}{" "}
                      {wishlistItems.length === 1
                        ? "Premium Masterpiece"
                        : "Premium Masterpieces"}
                    </Text>
                  </View>
                ) : null
              }
              renderItem={({ item, index }) => {
                const imageUri = item.ProductImage
                  ? item?.ProductImage
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
                      {/* Image Fills Entire Background Card */}
                      <ImageBackground
                        source={{ uri: imageUri }}
                        style={styles.backgroundImage}
                        imageStyle={styles.backgroundImageRadius}
                      >
                        {/* Premium Cinematic Scrim Gradient Overlay */}
                        <LinearGradient
                          colors={[
                            "rgba(15, 23, 42, 0.1)",
                            "rgba(15, 23, 42, 0.85)",
                          ]}
                          style={styles.gradientOverlay}
                        >
                          {/* Stock Level Luxury Accent Badge */}
                          {!item.InStock && (
                            <View style={styles.outOfStockBadge}>
                              <Text style={styles.outOfStockText}>
                                Archived / Out of Stock
                              </Text>
                            </View>
                          )}

                          {/* Core Typography & Bottom Alignment Layer */}
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

                            {/* Interactive Action Heart Wrapper */}
                            <TouchableOpacity
                              style={styles.removeFloatingButton}
                              activeOpacity={0.8}
                              disabled={processingState}
                              onPress={() => handleRemoveItem(item.ProductId)}
                            >
                              {processingState ? (
                                <ActivityIndicator
                                  size="small"
                                  color="#FFFFFF"
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
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRetryFetch}
                  tintColor={Colors.headerOne[0]}
                />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <View style={styles.emptyIconCircle}>
                    <Ionicons
                      name="heart-outline"
                      size={32}
                      color={Colors.white}
                    />
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
    paddingTop: 28,
    paddingBottom: 120,
    paddingHorizontal: 16,
  },
  headerTextContainer: {
    marginBottom: 24,
    paddingHorizontal: 4,
  },

  savedCounterSubtext: {
    fontSize: 14,
    color: Colors.darkError,
    fontWeight: "600",
    marginTop: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  bannerWrapper: {
    width: "100%",
    height: 180, // Substantial lookbook banner presentation height
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
    letterSpacing: 0.5,
  },
  bottomMetaContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "auto", // Forces layout convergence directly into the shaded baseline zone
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
    color: "#38BDF8", // Brilliant premium skylight blue typography signature
    fontSize: 15,
    fontWeight: "700",
    marginTop: 4,
  },
  removeFloatingButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
    backdropFilter: "blur(10px)", // For iOS compliance matching web engine standards
  },
  /* Empty States definitions */
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
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.primary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "500",
  },
  /* Full Width Symmetric Shimmer Modules */
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
