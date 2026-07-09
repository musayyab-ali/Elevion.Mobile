import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Colors } from "@/constants/Theme";
interface ProductProps {
  product: {
    ProductId: number;
    ProductName: string;
    SalePrice?: number;
    MinPrice?: number;
    ThumbnailImagePath?: string;
    ImagePath?: string;
  };
  onPress: (product: any) => void;
}

const IMAGE_PLACEHOLDER =
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80";

export const HomeProductMiniCard = React.memo(
  ({ product, onPress }: ProductProps) => {
    const title = product.ProductName;
    const imageUri = product.ThumbnailImagePath || IMAGE_PLACEHOLDER;

    const displayPrice = product.SalePrice || product.MinPrice || 0;

    return (
      <TouchableOpacity
        style={styles.cardContainer}
        onPress={() => onPress(product)}
        activeOpacity={0.85}
      >
        <View style={styles.imageFrame}>
          <Image source={{ uri: imageUri }} style={styles.productImage} />
        </View>
        <View style={styles.metaFrame}>
          <Text style={styles.productTitle} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.productPrice}>{displayPrice.toFixed(1)}</Text>
        </View>
      </TouchableOpacity>
    );
  },
);

// Enforce explicit name flag optimization
HomeProductMiniCard.displayName = "HomeProductMiniCard";

const styles = StyleSheet.create({
  cardContainer: {
    width: 135,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginHorizontal: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  imageFrame: {
    width: "100%",
    height: 110,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    objectFit: "fill",
  },
  metaFrame: {
    marginTop: 6,
    paddingHorizontal: 2,
  },
  productTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E293B",
    letterSpacing: -0.2,
  },
  productPrice: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.darkError, // Premium emerald green tone for pricing metrics
    marginTop: 2,
  },
});
