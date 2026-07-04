import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Theme";

interface ProductCardProps {
  product: any;
  index: number;
  onPress: () => void;
  isWishlisted: boolean;
  isProcessing: boolean;
  onWishlistToggle: () => void;
}

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80";

const ProductCard = ({
  product,
  index,
  onPress,
  isWishlisted,
  isProcessing,
  onWishlistToggle,
}: ProductCardProps) => {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        type: "timing",
        duration: 350,
        delay: Math.min(index * 50, 250),
      }}
      style={styles.cardContainer}
    >
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={styles.clickableRow}
      >
        {/* LEFT: Premium Aspect-Ratio Image Base Block Frame */}
        <View style={styles.imageSection}>
          <Image
            source={{ uri: product.ThumbnailImagePath || PLACEHOLDER_IMAGE }}
            style={styles.productImage}
          />

          {/* Status Badges Overlay */}
          {product.IsNewProduct && (
            <View style={styles.newBadge}>
              <Text style={styles.badgeText}>New</Text>
            </View>
          )}
          {product.IsFeaturedProduct && !product.IsNewProduct && (
            <View style={styles.featuredBadge}>
              <Text style={styles.badgeText}>Hot</Text>
            </View>
          )}
        </View>

        {/* RIGHT: Structured Contextual Typography Details Block Layer */}
        <View style={styles.detailsSection}>
          <View style={styles.textContainer}>
            <Text style={styles.productName} numberOfLines={2}>
              {product.ProductName || product.Name}
            </Text>
            <Text style={styles.brandSubtitle} numberOfLines={2}>
              {product?.Description}
            </Text>
          </View>

          {/* Bottom Row containing Price Component Matrix alongside specialized wishlist buttons */}
          <View style={styles.footerRow}>
            <Text style={styles.priceString} numberOfLines={1}>
              {product.MinPrice === product.MaxPrice
                ? `Rs. ${product.MinPrice?.toLocaleString()}`
                : `Rs. ${product.MinPrice?.toLocaleString()}+`}
            </Text>

            <TouchableOpacity
              style={[
                styles.wishlistCircleAction,
                isWishlisted && styles.wishlistCircleActive,
              ]}
              onPress={onWishlistToggle}
              activeOpacity={0.7}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <Ionicons
                  name={isWishlisted ? "heart" : "heart-outline"}
                  size={16}
                  color={isWishlisted ? "#FFFFFF" : "#64748B"}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </MotiView>
  );
};

export default React.memo(ProductCard);

const styles = StyleSheet.create({
  cardContainer: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    // Soft drop shadow to create visual depth
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  clickableRow: {
    flexDirection: "row",
    width: "100%",
    height: 120, // Strict design standard height allocation
  },
  imageSection: {
    width: "32%",
    height: "100%",
    backgroundColor: "#F8FAFC",
    position: "relative",
    borderRightWidth: 1,
    borderRightColor: "#F1F5F9",
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  detailsSection: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  textContainer: {
    flex: 1,
  },
  brandSubtitle: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  productName: {
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: -0.1,
    lineHeight: 18,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  priceString: {
    color: Colors.headerOne[0] || "#0284C7",
    fontSize: 15,
    fontWeight: "800",
  },
  // Re-designed isolated minimalist premium wishlist actions
  wishlistCircleAction: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  wishlistCircleActive: {
    backgroundColor: "#EF4444",
    borderColor: "#EF4444",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  newBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#EF4444",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  featuredBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#F59E0B",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
});
