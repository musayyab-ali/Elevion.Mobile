import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useProductDetails } from "@/features/shop/hooks/useProductDetails";
import { useWishlist } from "@/features/wishlist/hooks/useWishlist";
import { useProductCartActions } from "@/features/cart/hooks/useProductCartActions";
import { useSharedCartData } from "@/store/CartContext"; // 🌟 Consuming your Cart Provider State Engine
import { Colors } from "@/constants/Theme";
import { AuthGuardModal } from "@/components/AuthGuardModal";
import { useAuth } from "@/store/AuthContext";
import { CustomErrorMessage } from "@/components/CustomErrorMessage";
import { useSharedWishlistData } from "@/store/WishlistContext";
const IMAGE_BASE_URL = "http://thelink.innovex.biz/";
const FALLBACK_PLACEHOLDER =
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80";

export default function ProductDetailsScreen() {
  const { isAuthenticated } = useAuth();
  const { wishMessage } = useSharedWishlistData();
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const numericProductId = Number(productId);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isRemovingFromCart, setIsRemovingFromCart] = useState(false);

  const { product, loading, selectedVariant, setSelectedVariant } =
    useProductDetails(productId);
  const { wishlistMap, isProcessing, toggleWishlist } = useWishlist();

  // 🌟 Grab your active Cart context fields to monitor items reactively
  const { cartData, removeCartItem, cartMessage } = useSharedCartData();

  const combinations =
    product?.ProductVariantDetail?.productVariantCombinationList ?? [];

  useEffect(() => {
    if (combinations.length > 0 && !selectedVariant) {
      setSelectedVariant(combinations[0]);
    }
  }, [combinations, selectedVariant]);

  const mainProductDetailId = product?.ProductDetailId || numericProductId;
  const currentDetailId =
    selectedVariant?.ProductDetailId || mainProductDetailId;

  const { isAddingToCart, handleAddProductToBag } = useProductCartActions(
    numericProductId,
    currentDetailId,
  );

  // 🌟 VARIANT MATRIX STATE CHECK: Compute if the currently selected variation variant is matching inside the cart items array
  const matchedCartItem = cartData?.CartItemList?.find(
    (item: any) => Number(item.ProductDetailId) === Number(currentDetailId),
  );
  const isCurrentVariantInCart = !!matchedCartItem;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={Colors.headerOne?.[0] || "#0284C7"}
        />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#94A3B8" />
        <Text style={styles.errorText}>
          Product details could not be found.
        </Text>
        <TouchableOpacity
          style={styles.errorBackButton}
          onPress={() => router.back()}
        >
          <Text style={styles.errorBackText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const imageGallery =
    product?.ProductImages?.length > 0
      ? product.ProductImages
      : [{ ImageName: "" }];
  const isCurrentProductWishlisted = wishlistMap.has(numericProductId);
  const isWishlistActionRunning = isProcessing(numericProductId);
  const carouselHeight = screenWidth > 600 ? 440 : 360;

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / screenWidth);
    if (
      index !== activeImageIndex &&
      index >= 0 &&
      index < imageGallery.length
    ) {
      setActiveImageIndex(index);
    }
  };

  const handleWishlistPress = () => {
    if (!isAuthenticated) {
      setModalVisible(true);
      return;
    }
    toggleWishlist(numericProductId, mainProductDetailId, product);
  };

  // 🌟 COMBINED OPERATIONAL DISPATCH ROUTINE: Route pressing actions safely between Context Deletion or Context Insertion
  const handleCartActionDispatch = async () => {
    if (isCurrentVariantInCart && matchedCartItem?.CartId) {
      setIsRemovingFromCart(true);
      try {
        await removeCartItem(matchedCartItem.CartId);
      } catch (err) {
        console.error("Deletion cycle processing failure", err);
      } finally {
        setIsRemovingFromCart(false);
      }
    } else {
      handleAddProductToBag(1);
    }
  };

  return (
    <View style={styles.container}>
      {wishMessage || cartMessage ? (
        <CustomErrorMessage style={{ marginBottom: 50 }}>
          {wishMessage || cartMessage}
        </CustomErrorMessage>
      ) : null}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollPadding}
      >
        {/* Continuous Canvas Image Showcase Carousel */}
        <View
          style={[
            styles.carouselContainer,
            { width: screenWidth, height: carouselHeight },
          ]}
        >
          <FlatList
            data={imageGallery}
            horizontal
            pagingEnabled
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, index) => `img-${index}`}
            onMomentumScrollEnd={handleScroll}
            renderItem={({ item }) => {
              const imageUri = item?.ImageName
                ? `${IMAGE_BASE_URL}${item.ImageName}`
                : FALLBACK_PLACEHOLDER;
              return (
                <Image
                  source={{ uri: imageUri }}
                  style={{
                    width: screenWidth,
                    height: carouselHeight,
                    resizeMode: "cover",
                  }}
                />
              );
            }}
          />
          <LinearGradient
            colors={["transparent", "rgba(15, 23, 42, 0.08)"]}
            style={styles.carouselBottomGradient}
          />
          {imageGallery.length > 1 && (
            <View style={styles.dotRow}>
              {imageGallery.map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.dot,
                    activeImageIndex === idx
                      ? styles.activeDot
                      : styles.inactiveDot,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Master Details Content Sheet */}
        <View style={styles.detailsCard}>
          <View style={styles.metaBadgeRow}>
            <View
              style={[
                styles.stockBadge,
                { backgroundColor: product?.InStock ? "#DCFCE7" : "#FEE2E2" },
              ]}
            >
              <Text
                style={[
                  styles.stockText,
                  { color: product?.InStock ? "#166534" : "#991B1B" },
                ]}
              >
                {product?.InStock ? "In Stock" : "Unavailable"}
              </Text>
            </View>
            {product?.Category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{product.Category}</Text>
              </View>
            )}
          </View>

          <Text style={styles.productName}>{product?.Name}</Text>

          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>
              Rs.{" "}
              {selectedVariant
                ? selectedVariant.Price.toLocaleString()
                : product?.MinPrice?.toLocaleString()}
            </Text>
            {product?.MinPrice !== product?.MaxPrice && !selectedVariant && (
              <Text style={styles.priceRange}>
                (Rs. {product?.MinPrice?.toLocaleString()} - Rs.{" "}
                {product?.MaxPrice?.toLocaleString()})
              </Text>
            )}
          </View>

          <View style={styles.sectionDivider} />

          {/* Premium Product Variant Matrix Selector */}
          {combinations.length > 0 && (
            <View style={styles.variantSectionContainer}>
              <View style={styles.variantHeaderRow}>
                <Text style={styles.variantSectionHeading}>
                  Available Options
                </Text>
                {selectedVariant && (
                  <Text style={styles.skuIndicator}>{selectedVariant.SKU}</Text>
                )}
              </View>

              <View style={styles.variantGridStack}>
                {combinations.map((variant: any, idx: number) => {
                  const isSelected =
                    selectedVariant?.ProductDetailId ===
                    variant.ProductDetailId;
                  const optionLabel =
                    variant.VariantName || `Option Variant 0${idx + 1}`;

                  return (
                    <TouchableOpacity
                      key={variant.ProductDetailId || variant.SKU || idx}
                      style={[
                        styles.premiumVariantCard,
                        isSelected && styles.premiumVariantCardActive,
                      ]}
                      onPress={() => setSelectedVariant(variant)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.variantCardLeftSection}>
                        <View
                          style={[
                            styles.radioIndicatorCircle,
                            isSelected && styles.radioIndicatorCircleActive,
                          ]}
                        >
                          {isSelected && <View style={styles.radioInnerDot} />}
                        </View>
                        <View style={styles.variantLabelMetadataBlock}>
                          <Text
                            style={[
                              styles.variantCardLabelText,
                              isSelected && styles.variantCardLabelTextActive,
                            ]}
                          >
                            {optionLabel}
                          </Text>
                          {variant.IsPromotional && (
                            <View style={styles.promoBadge}>
                              <Text style={styles.promoBadgeText}>
                                Promo Offer
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>

                      <View style={styles.variantCardRightSection}>
                        <Text
                          style={[
                            styles.variantCardPriceText,
                            isSelected && styles.variantCardPriceTextActive,
                          ]}
                        >
                          Rs. {variant.Price?.toLocaleString()}
                        </Text>
                        <Text
                          style={[
                            styles.variantStockStatusText,
                            variant.InStock
                              ? styles.variantInStockColor
                              : styles.variantOutOfStockColor,
                          ]}
                        >
                          {variant.InStock ? "Available" : "Sold Out"}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          <View style={styles.sectionDivider} />

          <Text style={styles.sectionHeading}>Product Overview</Text>
          <Text style={styles.longDescription}>
            {product?.LongDescription ||
              product?.Description ||
              "No premium material layout overview summary provided."}
          </Text>
        </View>
      </ScrollView>

      {/* Floating Bottom Purchase Call To Action Dock Bar Layer */}
      <View
        style={[
          styles.bottomBar,
          { paddingBottom: Math.max(insets.bottom + 12, 18) },
        ]}
      >
        <View style={styles.bottomInteractiveActionRow}>
          {/* Enhanced Professional Wishlist Button */}
          <TouchableOpacity
            style={[
              styles.bottomWishlistSecondaryButton,
              isCurrentProductWishlisted &&
                styles.bottomWishlistSecondaryActiveBtn,
            ]}
            onPress={handleWishlistPress}
            disabled={isWishlistActionRunning}
            activeOpacity={0.7}
          >
            {isWishlistActionRunning ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <Ionicons
                name={isCurrentProductWishlisted ? "heart" : "heart-outline"}
                size={24} // Boosted for clean balance
                color={isCurrentProductWishlisted ? "#FF3B30" : "#475569"} // Premium solid crimson highlight
              />
            )}
          </TouchableOpacity>

          {/* Enhanced Professional Dynamic Cart Action Button */}
          <LinearGradient
            colors={
              !(product?.InStock && selectedVariant?.InStock)
                ? ["#CBD5E1", "#94A3B8"] // Out of Stock disabled gray gradients
                : isCurrentVariantInCart
                  ? ["#EF4444", "#DC2626"] // Crimson warning red if item is in cart
                  : ["#0F172A", "#1E293B"] // Dark premium slate blue when ready to add
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.actionBtnGradient}
          >
            <TouchableOpacity
              style={styles.actionButton}
              activeOpacity={0.85}
              disabled={
                !product?.InStock ||
                !selectedVariant?.InStock ||
                isAddingToCart ||
                isRemovingFromCart
              }
              onPress={handleCartActionDispatch}
            >
              {isAddingToCart || isRemovingFromCart ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons
                    name={
                      !(product?.InStock && selectedVariant?.InStock)
                        ? "ban-outline"
                        : isCurrentVariantInCart
                          ? "trash-outline" // Trash bin icon variant
                          : "bag-handle-outline"
                    }
                    size={20}
                    color="#FFFFFF"
                    style={styles.btnIcon}
                  />
                  <Text style={styles.actionButtonText}>
                    {!(product?.InStock && selectedVariant?.InStock)
                      ? "Out of Stock"
                      : isCurrentVariantInCart
                        ? "Remove from Cart" // Dynamic reactive feedback string text
                        : "Add to Cart"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>

      <AuthGuardModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Account Required"
        subtitle="Create an account to securely save items to your wishlist across all your devices."
        iconName="heart"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: "#64748B",
    marginTop: 12,
    marginBottom: 20,
    textAlign: "center",
  },
  errorBackButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: "#0F172A",
    borderRadius: 20,
  },
  errorBackText: { color: "#FFFFFF", fontWeight: "600" },
  scrollPadding: { paddingBottom: 120 },
  carouselContainer: { position: "relative", backgroundColor: "#F1F5F9" },
  carouselBottomGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  dotRow: {
    position: "absolute",
    bottom: 16,
    flexDirection: "row",
    width: "100%",
    justifyContent: "center",
    gap: 6,
  },
  dot: { height: 6, borderRadius: 3 },
  activeDot: { width: 18, backgroundColor: "#0F172A" },
  inactiveDot: { width: 6, backgroundColor: "rgba(15, 23, 42, 0.2)" },
  detailsCard: { padding: 20, backgroundColor: "#FFFFFF" },
  metaBadgeRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  stockBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  stockText: { fontSize: 12, fontWeight: "700" },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#F1F5F9",
  },
  categoryBadgeText: { fontSize: 12, fontWeight: "600", color: "#475569" },
  productName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 10,
    lineHeight: 30,
  },
  priceContainer: { flexDirection: "row", alignItems: "baseline", gap: 8 },
  currentPrice: { fontSize: 22, fontWeight: "800", color: "#0F172A" },
  priceRange: { fontSize: 13, color: "#64748B", fontWeight: "500" },
  sectionDivider: { height: 1, backgroundColor: "#F1F5F9", marginVertical: 20 },
  variantSectionContainer: { marginTop: 4 },
  variantHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  variantSectionHeading: { fontSize: 16, fontWeight: "700", color: "#0F172A" },
  skuIndicator: { fontSize: 12, fontWeight: "600", color: "#94A3B8" },
  variantGridStack: { gap: 10 },
  premiumVariantCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
  },
  premiumVariantCardActive: {
    borderColor: "#0F172A",
    backgroundColor: "#F8FAFC",
  },
  variantCardLeftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  radioIndicatorCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#CBD5E1",
    justifyContent: "center",
    alignItems: "center",
  },
  radioIndicatorCircleActive: { borderColor: "#0F172A" },
  radioInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#0F172A",
  },
  variantLabelMetadataBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  variantCardLabelText: { fontSize: 14, fontWeight: "600", color: "#475569" },
  variantCardLabelTextActive: { color: "#0F172A", fontWeight: "700" },
  promoBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  promoBadgeText: { fontSize: 10, fontWeight: "700", color: "#1D4ED8" },
  variantCardRightSection: { alignItems: "flex-end" },
  variantCardPriceText: { fontSize: 14, fontWeight: "700", color: "#475569" },
  variantCardPriceTextActive: { color: "#0F172A", fontWeight: "800" },
  variantStockStatusText: { fontSize: 11, fontWeight: "600", marginTop: 2 },
  variantInStockColor: { color: "#16A34A" },
  variantOutOfStockColor: { color: "#DC2626" },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 10,
  },
  longDescription: { fontSize: 14, color: "#475569", lineHeight: 22 },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: "#F1F5F9",
  },
  bottomInteractiveActionRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  bottomWishlistSecondaryButton: {
    width: 54,
    height: 54,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  bottomWishlistSecondaryActiveBtn: {
    borderColor: "#FEE2E2",
    backgroundColor: "#FFF5F5",
  },
  actionBtnGradient: { flex: 1, height: 54, borderRadius: 16 },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  btnIcon: { marginRight: 8 },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
});
