import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Product } from "../types/shopTypes";

interface PremiumHomeProductsCardProps {
  product: Product;
  onPress: (product: Product) => void;
}

const { width } = Dimensions.get("window");
export const CARD_WIDTH = (width - 48) / 2;

export const PremiumHomeProductsCard: React.FC<
  PremiumHomeProductsCardProps
> = ({ product, onPress }) => {
  const imageSource = product.ThumbnailImagePath || product.IconImagePath;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.cardContainer}
      onPress={() => onPress(product)}
    >
      <ImageBackground
        source={{ uri: imageSource }}
        style={styles.imageBackground}
        imageStyle={{ borderRadius: 16 }}
        resizeMode="cover"
      >
        {!product.IsProductInStock && (
          <View style={styles.stockBadge}>
            <Text style={styles.stockBadgeText}>OUT OF STOCK</Text>
          </View>
        )}

        <LinearGradient
          colors={[
            "transparent",
            "rgba(15, 23, 42, 0.4)",
            "rgba(15, 23, 42, 0.95)",
          ]}
          style={styles.gradientFooter}
        >
          <Text style={styles.productTitle} numberOfLines={1}>
            {product.ProductName}
          </Text>
          <Text style={styles.productPrice}>
            Rs. {product.Price?.toLocaleString() ?? "N/A"}
          </Text>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
};

// Premium Skeleton Placeholder UI for smooth state transitions
export const PremiumCardSkeleton: React.FC = () => {
  return (
    <View style={[styles.cardContainer, styles.skeletonBase]}>
      <View style={styles.skeletonFooter}>
        <View style={styles.skeletonTitleLine} />
        <View style={styles.skeletonPriceLine} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_WIDTH,
    height: 220,
    marginHorizontal: 4,
    borderRadius: 16,
    backgroundColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    overflow: "hidden",
  },
  imageBackground: {
    flex: 1,
    justifyContent: "flex-end", // FIXED: Changed from invalid "end" to "flex-end"
  },
  gradientFooter: {
    paddingHorizontal: 12,
    paddingTop: 40,
    paddingBottom: 14,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.1,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: "800",
    color: "#38BDF8",
  },
  stockBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(239, 68, 68, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stockBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  // Skeleton Style Extensions
  skeletonBase: {
    backgroundColor: "#E2E8F0",
    justifyContent: "flex-end",
    padding: 12,
  },
  skeletonFooter: {
    width: "100%",
  },
  skeletonTitleLine: {
    height: 14,
    backgroundColor: "#CBD5E1",
    borderRadius: 4,
    width: "80%",
    marginBottom: 8,
  },
  skeletonPriceLine: {
    height: 14,
    backgroundColor: "#CBD5E1",
    borderRadius: 4,
    width: "45%",
  },
});
