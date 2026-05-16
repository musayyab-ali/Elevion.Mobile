import React, { useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
// import { useProductDetails } from "@/features/shop/hooks/useProductDetails"; // Double check your import path matches
// import { Colors } from "../constants/Theme";
import { useProductDetails } from "@/features/shop/hooks/useProductDetails"; // Double check your import path matches
import { Colors } from "../constants/Theme";
const { width } = Dimensions.get("window");
const IMAGE_BASE_URL = "https://your-api-image-url.com/"; // Re-add your actual configuration base URL here

export default function ProductDetailsScreen() {
  const { productId } = useLocalSearchParams<{ productId: string }>();
  const router = useRouter();

  const { product, loading, selectedVariant, setSelectedVariant } =
    useProductDetails(productId);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Fallback structural mock selections for UI sizing/color buttons
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedColor, setSelectedColor] = useState("Blue");

  // 1. FIXED: Handle loading states cleanly BEFORE rendering or logging nested object properties
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#38BDF8" />
      </View>
    );
  }

  // 2. FIXED: Strict check for null or uninitialized response states
  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Product details could not be found.
        </Text>
      </View>
    );
  }

  // Safe debugging logs using optional chaining after data check gates
  //   console.log("Product data completely verified:", product?.ProductId);

  const combinations =
    product?.ProductVariantDetail?.productVariantCombinationList ?? [];

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: product?.Category || "Product Details",
          headerTransparent: true,
          headerBlurEffect: "dark",
          headerTintColor: "white",
          headerShadowVisible: false,

          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.headerButton}
            >
              <Ionicons name="arrow-back" size={22} color="#1E293B" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollPadding}
      >
        {/* Animated Media Carousel Frame Container */}
        <View style={styles.carouselContainer}>
          <FlatList
            data={product?.ProductImages ?? []}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, index) => `img-${index}`}
            onMomentumScrollEnd={(e) => {
              const nextIndex = Math.round(
                e.nativeEvent.contentOffset.x / width,
              );
              setActiveImageIndex(nextIndex);
            }}
            renderItem={({ item }) => (
              <Image
                source={{ uri: `${IMAGE_BASE_URL}${item?.ImageName}` }}
                style={styles.bannerImage}
                resizeMode="cover"
              />
            )}
          />
          {/* Carousel Paginator Dot Toggles with defensive optional chaining array guards */}
          <View style={styles.dotRow}>
            {(product?.ProductImages ?? []).map((_: any, idx: number) => (
              <View
                key={idx}
                style={[
                  styles.dot,
                  activeImageIndex === idx && styles.activeDot,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Core Detail Specification Metadata Section */}
        <View style={styles.detailsCard}>
          <View style={styles.titleRow}>
            <Text style={styles.productName}>{product?.Name}</Text>
            <View style={styles.stockBadge}>
              <Text style={styles.stockText}>
                {product?.InStock ? "IN STOCK" : "OUT OF STOCK"}
              </Text>
            </View>
          </View>

          {/* Dynamic Variant Pricing Window Box */}
          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>
              Rs. {selectedVariant ? selectedVariant.Price : product?.MinPrice}
            </Text>
            {product?.MinPrice !== product?.MaxPrice && !selectedVariant && (
              <Text style={styles.priceRange}>
                (Rs. {product?.MinPrice} - Rs. {product?.MaxPrice})
              </Text>
            )}
          </View>

          <Text style={styles.sectionHeading}>Description</Text>
          <Text style={styles.longDescription}>
            {product?.LongDescription ||
              product?.Description ||
              "No product summary provided."}
          </Text>

          {/* Multi-variant Group Lists Block Layout */}
          {product?.ProductVariantGroups?.map((group: any) => (
            <View key={group.VariantGroupId} style={styles.variantGroup}>
              <Text style={styles.variantTitle}>{group.VariantGroupName}</Text>

              {group.VariantGroupName === "Size" ? (
                <View style={styles.optionsRow}>
                  {["S", "M", "L", "XL"].map((size) => (
                    <TouchableOpacity
                      key={size}
                      style={[
                        styles.pillOption,
                        selectedSize === size && styles.activePill,
                      ]}
                      onPress={() => setSelectedSize(size)}
                    >
                      <Text
                        style={[
                          styles.pillText,
                          selectedSize === size && styles.activePillText,
                        ]}
                      >
                        {size}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={styles.optionsRow}>
                  {["Blue", "Black", "Grey"].map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.pillOption,
                        selectedColor === color && styles.activePill,
                      ]}
                      onPress={() => setSelectedColor(color)}
                    >
                      <Text
                        style={[
                          styles.pillText,
                          selectedColor === color && styles.activePillText,
                        ]}
                      >
                        {color}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))}

          {/* Alternative Wholesale Price Combination Selector Checkboxes */}
          {combinations.length > 1 && (
            <View style={styles.variantGroup}>
              <Text style={styles.variantTitle}>
                Select Pricing Option Bundle
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.comboScroll}
              >
                {combinations.map((variant: any, idx: number) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.comboCard,
                      selectedVariant?.SKU === variant.SKU &&
                        styles.activeComboCard,
                    ]}
                    onPress={() => setSelectedVariant(variant)}
                  >
                    <Text
                      style={[
                        styles.comboSku,
                        selectedVariant?.SKU === variant.SKU &&
                          styles.activeComboText,
                      ]}
                    >
                      Option {idx + 1}
                    </Text>
                    <Text style={styles.comboPrice}>Rs. {variant.Price}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action CTA Bar */}
      <View style={styles.bottomBar}>
        <LinearGradient
          colors={["#38BDF8", "#0284C7"]}
          style={styles.actionBtnGradient}
        >
          <TouchableOpacity style={styles.actionButton} activeOpacity={0.8}>
            <Ionicons
              name="cart-outline"
              size={22}
              color="#FFF"
              style={styles.btnIcon}
            />
            <Text style={styles.actionButtonText}>Add to Shopping Bag</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: { color: "#64748B", fontSize: 16, textAlign: "center" },
  scrollPadding: { paddingBottom: 100 },
  carouselContainer: { width: width, height: 320, position: "relative" },
  bannerImage: { width: width, height: 320 },
  dotRow: {
    flexDirection: "row",
    position: "absolute",
    bottom: 15,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.4)",
    marginHorizontal: 4,
  },
  activeDot: { width: 18, backgroundColor: "#FFF" },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
  detailsCard: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "#FFF",
    marginTop: -20,
    padding: 20,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  productName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1E293B",
    flex: 1,
    marginRight: 12,
  },
  stockBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#DCFCE7",
  },
  stockText: { fontSize: 11, fontWeight: "700", color: "#166534" },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  currentPrice: { fontSize: 20, fontWeight: "800", color: "#0284C7" },
  priceRange: {
    fontSize: 14,
    color: "#64748B",
    marginLeft: 8,
    fontWeight: "500",
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginTop: 8,
    marginBottom: 6,
  },
  longDescription: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 22,
    marginBottom: 16,
  },
  variantGroup: { marginBottom: 16 },
  variantTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 8,
  },
  optionsRow: { flexDirection: "row", flexWrap: "wrap" },
  pillOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: "#FFF",
  },
  activePill: { borderColor: "#0284C7", backgroundColor: "#F0F9FF" },
  pillText: { fontSize: 14, color: "#64748B", fontWeight: "600" },
  activePillText: { color: "#0284C7" },
  comboScroll: { flexDirection: "row", paddingVertical: 4 },
  comboCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    marginRight: 12,
    width: 110,
    backgroundColor: "#FFF",
  },
  activeComboCard: { borderColor: "#0284C7", backgroundColor: "#F0F9FF" },
  comboSku: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
    marginBottom: 4,
  },
  activeComboText: { color: "#0284C7" },
  comboPrice: { fontSize: 14, fontWeight: "700", color: "#1E293B" },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 12,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  actionBtnGradient: { borderRadius: 14 },
  actionButton: {
    height: 52,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  btnIcon: { marginRight: 8 },
  actionButtonText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});
