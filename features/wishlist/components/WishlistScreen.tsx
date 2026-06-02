import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { Colors } from "@/constants/Theme";
import { useWishlistScreen } from "../hooks/useWishlistScreen";
import { useAuth } from "@/store/AuthContext";
import { AppButton } from "@/components/AppButton";
import { useWishlist } from "../hooks/useWishlist";
import { CustomErrorMessage } from "@/components/CustomErrorMessage";
import { PremiumGuestGate } from "@/components/PremiumGuestGate";
const IMAGE_BASE_URL = "http://thelink.innovex.biz/";
const FALLBACK_PLACEHOLDER =
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80";

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
  const calculatedColumns = width > 900 ? 4 : width > 600 ? 3 : 2;
  if (!isAuthenticated) {
    return <PremiumGuestGate screenType="wishlist" />;
  }

  // Stupendous Luxury Skeleton Loading State Shimmer Module
  const renderSkeletons = () => (
    <View style={styles.gridContainer}>
      {Array.from({ length: 2 }).map((_, index) => (
        <View
          key={`skel-${index}`}
          style={[styles.gridCell, { maxWidth: `${100 / calculatedColumns}%` }]}
        >
          <MotiView
            from={{ opacity: 0.4 }}
            animate={{ opacity: 0.8 }}
            transition={{ type: "timing", duration: 800, loop: true }}
            style={styles.skeletonCard}
          >
            <View style={styles.skeletonImage} />
            <View style={styles.skeletonTextLine} />
            <View style={[styles.skeletonTextLine, { width: "60%" }]} />
          </MotiView>
        </View>
      ))}
    </View>
  );

  return (
    <View
      style={[styles.container, { backgroundColor: Colors.headerOne?.[1] }]}
    >
      <View style={styles.contentCanvas}>
        {loading ? (
          renderSkeletons()
        ) : (
          <FlatList
            data={wishlistItems}
            numColumns={calculatedColumns}
            key={calculatedColumns}
            keyExtractor={(item) => `wish-${item.ProductId}`}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={styles.rowWrapper}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              wishlistItems.length > 0 ? (
                <Text style={styles.savedCounterText}>
                  Your Collection ({wishlistItems.length} items saved)
                </Text>
              ) : null
            }
            renderItem={({ item, index }) => {
              const imageUri = item.ImageName
                ? `${IMAGE_BASE_URL}${item.ImageName}`
                : FALLBACK_PLACEHOLDER;
              const processingState = isProcessing(item.ProductId);

              return (
                <MotiView
                  from={{ opacity: 0, scale: 0.95, translateY: 10 }}
                  animate={{ opacity: 1, scale: 1, translateY: 0 }}
                  transition={{
                    type: "timing",
                    duration: 350,
                    delay: index * 50,
                  }}
                  style={[
                    styles.gridCell,
                    { maxWidth: `${100 / calculatedColumns}%` },
                  ]}
                >
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => handleNavigateToDetails(item.ProductId)}
                    style={styles.productCard}
                  >
                    {/* Media Frame wrapper */}
                    <View style={styles.imageWrapper}>
                      <Image
                        source={{ uri: imageUri }}
                        style={styles.productImage}
                      />

                      {/* Interactive absolute delete heart badge layer module */}
                      <TouchableOpacity
                        style={styles.removeFloatingButton}
                        activeOpacity={0.7}
                        disabled={processingState}
                        onPress={() => handleRemoveItem(item.ProductId)}
                      >
                        {processingState ? (
                          <ActivityIndicator size="small" color="#EF4444" />
                        ) : (
                          <Ionicons name="heart" size={18} color="#EF4444" />
                        )}
                      </TouchableOpacity>

                      {!item.InStock && (
                        <View style={styles.outOfStockOverlay}>
                          <Text style={styles.outOfStockText}>
                            Out of Stock
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Metadata summary text boundaries */}
                    <View style={styles.detailsBlock}>
                      <Text style={styles.productName} numberOfLines={1}>
                        {item.ProductName}
                      </Text>
                      <Text style={styles.priceString} numberOfLines={1}>
                        {item.MinPrice === item.MaxPrice
                          ? `Rs. ${item.MinPrice.toLocaleString()}`
                          : `Rs. ${item.MinPrice.toLocaleString()} - ${item.MaxPrice.toLocaleString()}`}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </MotiView>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons
                    name="heart-dislike-outline"
                    size={38}
                    color="#94A3B8"
                  />
                </View>
                <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
                <Text style={styles.emptySubtitle}>
                  Tap the heart icon on any premium item collection catalog to
                  save your favorites here.
                </Text>
              </View>
            }
          />
        )}
        {/* {apiMessage && <ErrorMessage>{apiMessage}</ErrorMessage>} */}
        {wishMessage && <CustomErrorMessage>{wishMessage}</CustomErrorMessage>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  guestContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 45,
    backgroundColor: "rgba(0, 180, 216, 0.1)", // Smooth soft transparency accent
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  guestTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 10,
    textAlign: "center",
  },
  guestSubtitle: {
    fontSize: 15,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 28,
  },
  authBtn: {
    width: "100%",
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.accent,
  },
  navBarTitle: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  contentCanvas: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },
  listContent: {
    paddingTop: 20,
    paddingBottom: 120,
  },
  rowWrapper: {
    justifyContent: "flex-start",
    paddingHorizontal: 10,
  },
  gridCell: {
    flex: 1,
    padding: 6,
  },
  savedCounterText: {
    fontSize: 12,
    color: Colors.tertiary,
    fontWeight: "700",
    paddingHorizontal: 16,
    marginBottom: 14,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  productCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  imageWrapper: {
    width: "100%",
    aspectRatio: 1.1,
    backgroundColor: "#F1F5F9",
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  removeFloatingButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 4,
  },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  outOfStockText: {
    backgroundColor: "#EF4444",
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    textTransform: "uppercase",
  },
  detailsBlock: {
    padding: 12,
  },
  productName: {
    color: "#0F172A",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 4,
  },
  priceString: {
    color: "#0284C7",
    fontSize: 12,
    fontWeight: "700",
  },
  /* Empty State Presentation Layouts */
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 120,
    paddingHorizontal: 44,
  },
  emptyIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 20,
    fontWeight: "500",
  },
  /* Shimmer Skeleton Architecture Elements */
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 10,
  },
  skeletonCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  skeletonImage: {
    width: "100%",
    aspectRatio: 1.1,
    backgroundColor: "#E2E8F0",
    borderRadius: 12,
    marginBottom: 10,
  },
  skeletonTextLine: {
    height: 12,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    marginBottom: 6,
    width: "85%",
  },
});
