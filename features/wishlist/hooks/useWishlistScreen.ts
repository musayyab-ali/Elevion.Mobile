import { useState, useEffect, useMemo } from "react";
import { useRouter } from "expo-router";
import { useWishlist } from "./useWishlist";
export interface WishlistItem {
  ProductId: number;
  ProductName: string;
  Name?: string;
  MinPrice: number;
  MaxPrice: number;
  ImageName?: string;
  IsNewProduct?: boolean;
  IsFeaturedProduct?: boolean;
  InStock?: boolean;
}

export function useWishlistScreen() {
  const router = useRouter();
  const { wishlistMap, isProcessing, toggleWishlist, fetchWishlist } =
    useWishlist();
  const [loading, setLoading] = useState(true);
  console.log(`tati is : `);
  // Sync / Hydrate latest backend state on initial screen paint context
  useEffect(() => {
    const hydrateWishlist = async () => {
      try {
        if (fetchWishlist) {
          await fetchWishlist();
        }
      } catch (error) {
        console.log("Failed to sync latest wishlist state:", error);
      } finally {
        setLoading(false);
      }
    };
    hydrateWishlist();
  }, []);

  // Compute live local snapshot filtered matching array directly from cache map
  const wishlistItems = useMemo(() => {
    return Array.from(wishlistMap.values()).map((item: any) => ({
      ProductId: item.ProductId,
      ProductName: item.ProductName || item.Name || "Premium Product",
      MinPrice: item.MinPrice || item.Price || 0,
      MaxPrice: item.MaxPrice || item.Price || 0,
      ProductImage: item.ProductImage || "",
      IsNewProduct: item.IsNewProduct || false,
      IsFeaturedProduct: item.IsFeaturedProduct || false,
      InStock: item.InStock ?? true,
    }));
  }, [wishlistMap]);

  const handleNavigateToDetails = (productId: number) => {
    router.push({
      pathname: "/(tabs)/category/product-details",
      params: { productId: String(productId) },
    });
  };

  const handleRemoveItem = async (productId: number) => {
    // Look up detail id configuration safely or pass down self-reference fallbacks
    const item = wishlistMap.get(productId);
    const targetDetailId =
      item?.ProductVariantDetail?.productVariantCombinationList?.[0]
        ?.ProductDetailId || productId;
    await toggleWishlist(productId, targetDetailId);
  };

  return {
    wishlistItems,
    loading,
    isProcessing,
    handleNavigateToDetails,
    handleRemoveItem,
  };
}
