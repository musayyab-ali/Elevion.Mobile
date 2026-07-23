
import { useMemo } from "react";
import { useRouter } from "expo-router";
import { useWishlist } from "./useWishlist";
import { useSharedWishlistData } from "@/store/WishlistContext";

export function useWishlistScreen() {
  const router = useRouter();
  const { wishlistMap, isProcessing, toggleWishlist } = useWishlist();
  const {
    loading,
    refreshing,
    serverError,
    fetchWishlist,
    loadingMore,
    loadMoreWishlist,
  } = useSharedWishlistData();

  const wishlistItems = useMemo(() => {
    return Array.from(wishlistMap.values()).map((item: any) => ({
      ProductId: item.ProductId,
      ProductName: item.ProductName,
      MinPrice: item.MinPrice,
      MaxPrice: item.MaxPrice,
      ProductImage: item.ImageName || item.ProductImage || "",
      IsNewProduct: item.IsNewProduct || false,
      IsFeaturedProduct: item.IsFeaturedProduct || false,
      InStock: item.InStock ?? true,
    }));
  }, [wishlistMap]);

  const handleNavigateToDetails = (productId: number) => {
    router.push({
      pathname: "/(product)/product-details",
      params: { productId: String(productId) },
    });
  };

  const handleRemoveItem = async (productId: number) => {
    const item = wishlistMap.get(productId);
    if (item) {
      await toggleWishlist(productId, item.ProductDetailId);
    }
  };

  return {
    wishlistItems,
    loading,
    refreshing,
    serverError,
    isProcessing,
    loadingMore,
    handleNavigateToDetails,
    handleRemoveItem,
    handleRefresh: () => fetchWishlist(),
    handleRetryFetch: () => fetchWishlist(),
    handleLoadMore: loadMoreWishlist,
  };
}
