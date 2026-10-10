import React, { useState } from "react";
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";

import { Colors } from "@/constants/Theme";
import { CategoryBreadcrumbs } from "./CategoryBreadcrumbs";
import { useDiscovery } from "../hooks/useDiscovery";
import { useWishlist } from "../../wishlist/hooks/useWishlist";
import ProductCard from "./ProductCard";
import { AuthGuardModal } from "@/components/AuthGuardModal";
import { useAuth } from "@/store/AuthContext";
import { CustomErrorMessage } from "@/components/CustomErrorMessage";
import { useSharedWishlistData } from "@/store/WishlistContext";
import Ionicons from "@expo/vector-icons/Ionicons";

export const ProductsScreen = () => {
  const { isAuthenticated } = useAuth();
  const { wishMessage } = useSharedWishlistData();
  const { categoryId, categoryName } = useLocalSearchParams<{
    categoryId: string;
    categoryName?: string;
  }>();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);

  // Added loadingMore and loadMoreProducts handlers from the updated hook
  const {
    categoryProducts = [],
    breadcrumbs,
    loading: discoveryLoading,
    loadingMore,
    loadMoreProducts,
  } = useDiscovery(categoryId);

  const { wishlistMap, isProcessing, toggleWishlist } = useWishlist();

  const safeBreadcrumbs = breadcrumbs?.length
    ? breadcrumbs
    : [
        {
          id: Number(categoryId) || 0,
          name: categoryName || "Loading...",
          isLeaf: true,
        },
      ];

  if (discoveryLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen
          options={{
            headerTitle: () => (
              <CategoryBreadcrumbs breadcrumbs={safeBreadcrumbs} />
            ),
            headerShadowVisible: false,
            headerStyle: { backgroundColor: Colors.headerOne[0] },
            headerTitleAlign: "left",
            headerBackButtonDisplayMode: "minimal",
          }}
        />
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  }

  const derivedHeading = categoryName
    ? `${categoryName} Collection`
    : "Available Products";

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: () => <CategoryBreadcrumbs breadcrumbs={breadcrumbs} />,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: Colors.headerOne[0] },
          headerTitleAlign: "left",
          headerBackButtonDisplayMode: "minimal",
        }}
      />

      {wishMessage && <CustomErrorMessage>{wishMessage}</CustomErrorMessage>}

      <View style={styles.contentCanvas}>
        <FlatList
          data={categoryProducts}
          numColumns={1}
          keyExtractor={(item) => `prod-list-${item.ProductId}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          // Infinite Scroll Pagination triggers
          onEndReached={loadMoreProducts}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={
            categoryProducts.length > 0 ? (
              <View style={styles.headerBlock}>
                <View style={styles.headerRow}>
                  <Text style={styles.sectionTitle} numberOfLines={1}>
                    {derivedHeading}
                  </Text>
                  <View style={styles.badgeBubble}>
                    <Text style={styles.badgeText}>
                      {categoryProducts.length}{" "}
                      {categoryProducts.length === 1 ? "Product" : "Products"}
                    </Text>
                  </View>
                </View>
                <View style={styles.accentLine} />
              </View>
            ) : null
          }
          renderItem={({ item, index }) => {
            const isItemWishlisted = wishlistMap.has(item.ProductId);

            return (
              <View style={styles.listCell}>
                <ProductCard
                  product={item}
                  index={index}
                  isWishlisted={isItemWishlisted}
                  isProcessing={isProcessing(item.ProductId)}
                  onWishlistToggle={() => {
                    if (!isAuthenticated) {
                      setModalVisible(true);
                      return;
                    }
                    toggleWishlist(item.ProductId, item.ProductDetailId ?? 0, item);
                  }}
                  onPress={() =>
                    router.navigate({
                      pathname: "/(product)/product-details",
                      params: { productId: item.ProductId },
                    })
                  }
                />
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons
                  name="bag-handle-outline"
                  size={44}
                  color={Colors.primary}
                />
              </View>
              <Text style={styles.emptyTitle}>No Products available</Text>
            </View>
          }
          // Display an inline trailing loader at the bottom while next chunks append
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footerLoaderFrame}>
                <ActivityIndicator size="small" color={Colors.primary} />
              </View>
            ) : null
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
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.white,
  },
  contentCanvas: { flex: 1 },
  listContent: { padding: 16 },
  headerBlock: {
    marginBottom: 24,
    marginTop: 8,
    paddingHorizontal: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.primary,
    letterSpacing: -0.5,
    flex: 1,
    paddingRight: 16,
  },
  badgeBubble: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primary || "#38BDF8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  accentLine: {
    height: 2,
    width: 40,
    backgroundColor: Colors.darkError,
    marginTop: 10,
    borderRadius: 1,
    opacity: 0.8,
  },
  listCell: { marginBottom: 16 },
  emptyContainer: { marginTop: 80, alignItems: "center" },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.accent,
    marginBottom: 8,
  },
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  footerLoaderFrame: {
    paddingVertical: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
