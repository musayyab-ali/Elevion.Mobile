import React, { useState } from "react";
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";

import { Colors } from "@/constants/Theme";
import { CategoryBreadcrumbs } from "@/features/shop/components/CategoryBreadcrumbs";
import { useDiscovery } from "@/features/shop/hooks/useDiscovery";
import { useWishlist } from "@/features/wishlist/hooks/useWishlist"; // Import the premium hook
import ProductCard from "@/features/shop/components/ProductCard";
import { AuthGuardModal } from "@/components/AuthGuardModal";
import { useAuth } from "@/store/AuthContext";
import { CustomErrorMessage } from "@/components/CustomErrorMessage";
import { useSharedWishlistData } from "@/store/WishlistContext";
export default function ProductListScreen() {
  const { isAuthenticated } = useAuth();
  const { wishMessage } = useSharedWishlistData();
  const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const { width } = useWindowDimensions();

  const {
    bannerProducts,
    breadcrumbs,
    loading: discoveryLoading,
  } = useDiscovery(categoryId);
  const { wishlistMap, isProcessing, toggleWishlist } = useWishlist();

  if (discoveryLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary || "#38BDF8"} />
      </View>
    );
  }

  // Calculate clean grid distribution matrices fluidly across devices
  const calculatedColumns = width > 900 ? 4 : width > 600 ? 3 : 2;
  const isOddRowAdjustmentNeeded =
    bannerProducts.length % calculatedColumns !== 0;

  return (
    <View style={[styles.container, { backgroundColor: Colors.headerOne[1] }]}>
      <Stack.Screen
        options={{
          headerTitle: () => <CategoryBreadcrumbs breadcrumbs={breadcrumbs} />,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: Colors.headerOne[0] },
          headerTitleAlign: "left",
          headerLeft: () => null,
        }}
      />
      {wishMessage && <CustomErrorMessage>{wishMessage}</CustomErrorMessage>}
      {/* Premium Content Canvas Layer */}
      <View style={styles.contentCanvas}>
        <FlatList
          data={bannerProducts}
          numColumns={calculatedColumns}
          key={calculatedColumns} // Forces smooth redraws when device changes orientation
          keyExtractor={(item) => `prod-${item.ProductId}`}
          columnWrapperStyle={[
            styles.rowWrapper,
            isOddRowAdjustmentNeeded && { justifyContent: "flex-start" },
          ]}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            bannerProducts.length > 0 ? (
              <Text style={styles.resultsCount}>
                Showing {bannerProducts.length} premium options
              </Text>
            ) : null
          }
          renderItem={({ item, index }) => {
            // Determine active variant configuration if defined, fallback smoothly to base structure
            const targetDetailId =
              item.ProductVariantDetail?.productVariantCombinationList?.[0]
                ?.ProductDetailId || item.ProductId;
            const isItemWishlisted = wishlistMap.has(item.ProductId);

            return (
              <View
                style={[
                  styles.gridCell,
                  { maxWidth: `${100 / calculatedColumns}%` },
                ]}
              >
                <ProductCard
                  product={item}
                  index={index} // Passed down to cleanly stagger layout animations
                  isWishlisted={isItemWishlisted}
                  isProcessing={isProcessing(item.ProductId)}
                  onWishlistToggle={() => {
                    if (!isAuthenticated) {
                      setModalVisible(true);
                      return;
                    }
                    toggleWishlist(item.ProductId, targetDetailId, item);
                  }}
                  onPress={() =>
                    router.push({
                      pathname: "/(tabs)/category/product-details",
                      params: { productId: item.ProductId },
                    })
                  }
                />
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Products Found</Text>
              <Text style={styles.emptySubtitle}>
                We couldn't find items in this specific collection.
              </Text>
            </View>
          }
        />
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
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  contentCanvas: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 110, // Clear space to completely float over the tab bar
  },
  rowWrapper: {
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  gridCell: {
    flex: 1,
    padding: 6,
  },
  resultsCount: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
    paddingHorizontal: 16,
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 140,
    paddingHorizontal: 40,
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
    fontWeight: "500",
  },
});
