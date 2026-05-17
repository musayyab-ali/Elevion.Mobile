import React from "react";
import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { MotiView } from "moti";
import { Colors } from "@/constants/Theme";

interface ProductCardProps {
  product: any;
  index: number;
  onPress: () => void;
}

const IMAGE_BASE_URL = "http://thelink.innovex.biz/";
const FALLBACK_PLACEHOLDER =
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80";

const ProductCard = ({ product, index, onPress }: ProductCardProps) => {
  // Gracefully handles dynamic media asset string resolution paths safely
  const resolvedImageUri = product.ImageName
    ? `${IMAGE_BASE_URL}${product.ImageName}`
    : FALLBACK_PLACEHOLDER;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 15 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        type: "timing",
        duration: 400,
        delay: Math.min(index * 60, 300), // Staggers cell loads dynamically
      }}
      style={styles.cardContainer}
    >
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={styles.clickableArea}
      >
        {/* Upper Image Canvas Frame */}
        <View style={styles.imageWrapper}>
          <Image
            source={{
              uri:
                // resolvedImageUri ||
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbdhRadCYHT3ZgleM6rrje1kRwNvjloVwLnA&s",
            }}
            style={styles.productImage}
          />

          {/* Badge Layout Layer Modules */}
          {product.IsNewProduct && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>New</Text>
            </View>
          )}

          {product.IsFeaturedProduct && (
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredBadgeText}>Hot</Text>
            </View>
          )}
        </View>

        {/* Lower High-Contrast Product Info block */}
        <View style={styles.detailsBlock}>
          <Text style={styles.productName} numberOfLines={1}>
            {product.ProductName}
          </Text>

          <Text style={styles.priceString} numberOfLines={1}>
            {product.MinPrice === product.MaxPrice
              ? `Rs. ${product.MinPrice}`
              : `Rs. ${product.MinPrice} - ${product.MaxPrice}`}
          </Text>
        </View>
      </TouchableOpacity>
    </MotiView>
  );
};

// Pure memoized asset component preservation structure
export default React.memo(ProductCard);

const styles = StyleSheet.create({
  cardContainer: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",

    // Luxury detail border
    borderWidth: 1,
    borderColor: "#E2E8F0",

    // Crisp depth profile shadow values
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  clickableArea: {
    width: "100%",
  },
  imageWrapper: {
    width: "100%",
    aspectRatio: 1.1, // Clean layout ratio boundary constraints box
    backgroundColor: "#F8FAFC",
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  detailsBlock: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
  },
  productName: {
    color: "#0F172A", // Premium deep slate text high contrast profile
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: -0.1,
    marginBottom: 4,
  },
  priceString: {
    color: Colors.headerOne[0] || "#0284C7", // Your signature brand identifier accent color
    fontSize: 13,
    fontWeight: "700",
  },
  /* Absolute Badge Position Elements */
  newBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#EF4444",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  newBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  featuredBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#F59E0B", // High visibility premium luxury gold accent amber
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  featuredBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
});
