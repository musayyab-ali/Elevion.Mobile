import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { MotiView } from "moti"; // Install via: npx expo install moti react-native-reanimated
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

interface ProductCardProps {
  product: any;
  onPress: () => void;
}

const IMAGE_BASE_URL = "http://thelink.innovex.biz/"; // Replace with your actual base URL

const ProductCard = ({ product, onPress }: ProductCardProps) => {
  return (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "timing", duration: 500 }}
      style={styles.container}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        style={styles.card}
      >
        {/* Product Image */}
        <Image
          source={{ uri: `${IMAGE_BASE_URL}${product.ImageName}` }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Badge for New Products */}
        {product.IsNewProduct && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>NEW</Text>
          </View>
        )}

        {/* Info Overlay */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)"]}
          style={styles.gradient}
        >
          <View style={styles.infoContainer}>
            <Text style={styles.productName} numberOfLines={1}>
              {product.ProductName}
            </Text>

            <View style={styles.priceRow}>
              <Text style={styles.priceText}>
                Rs. {product.MinPrice} - {product.MaxPrice}
              </Text>

              {product.IsFeaturedProduct && (
                <View style={styles.featuredBadge}>
                  <Text style={styles.featuredText}>Featured</Text>
                </View>
              )}
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </MotiView>
  );
};

export default ProductCard;

const styles = StyleSheet.create({
  container: {
    width: width - 40, // Full width minus padding
    alignSelf: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    height: 250,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
    justifyContent: "flex-end",
    padding: 20,
  },
  infoContainer: {
    width: "100%",
  },
  productName: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  priceText: {
    color: "#38BDF8", // Cyan/Sky blue accent
    fontSize: 16,
    fontWeight: "600",
  },
  newBadge: {
    position: "absolute",
    top: 15,
    left: 15,
    backgroundColor: "#EF4444",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  newBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  featuredBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  featuredText: {
    color: "#fff",
    fontSize: 10,
    textTransform: "uppercase",
  },
});
