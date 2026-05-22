import { useCallback, useMemo } from "react";
import { wishlistApi } from "../services/wishlistApi";
import { useSharedWishlistData } from "@/store/WishlistContext";

export const useWishlist = () => {
  // Consume data from our app-wide context instance instead of local isolated hooks
  const {
    items,
    setItems,
    loading,
    refreshing,
    apiMessage,
    setApiMessage,
    processingIds,
    setProcessingIds,
    fetchWishlist,
  } = useSharedWishlistData();

  // Optimized dictionary lookup index map for fast cross-view lookups
  const wishlistMap = useMemo(() => {
    const map = new Map<
      number,
      {
        wishListId: number;
        productDetailId: number;
        ProductId: number;
        ProductName: string;
        MinPrice: number;
        MaxPrice: number;
        ImageName?: string;
        InStock?: boolean;
      }
    >();
    items.forEach((item) => {
      if (item.ProductId) {
        map.set(item.ProductId, {
          wishListId: item.WishListId,
          productDetailId: item.ProductDetailId,
          ProductName: item.ProductName || item.Name || "Premium Product",
          MinPrice: item.MinPrice || item.Price || 0,
          MaxPrice: item.MaxPrice || item.Price || 0,
          ImageName: item.ImageName || "",
          InStock: item.InStock ?? true,
          ...item, // Passing down all original metadata fields back to the caller screen loops
        });
      }
    });
    return map;
  }, [items]);

  // Combined Add/Remove controller logic toggle to streamline UI interaction handling
  // ✅ Added optional productMetadata parameter to capture real-time values on creation
  const toggleWishlist = async (
    productId: number,
    productDetailId: number,
    productMetadata?: any,
  ) => {
    if (processingIds.has(productId)) return; // Debounce action if mid-flight

    const targetWishlistItem = wishlistMap.get(productId);
    const isAdding = !targetWishlistItem;

    // Set processing flag
    setProcessingIds((prev) => {
      const next = new Set(prev);
      next.add(productId);
      return next;
    });

    // Capture fallback rollback snapshots
    const originalItems = [...items];

    if (isAdding) {
      // ✅ FIX: Populate placeholder with full product metadata fields immediately
      const structuralPlaceholder = {
        WishListId: Math.floor(Math.random() * -100000),
        ProductId: productId,
        ProductDetailId: productDetailId,
        ProductName:
          productMetadata?.Name ||
          productMetadata?.ProductName ||
          "Premium Product",
        MinPrice: productMetadata?.MinPrice || productMetadata?.Price || 0,
        MaxPrice: productMetadata?.MaxPrice || productMetadata?.Price || 0,
        ImageName:
          productMetadata?.ProductImages?.[0]?.ImageName ||
          productMetadata?.ImageName ||
          "",
        InStock: productMetadata?.InStock ?? true,
        IsNewProduct: productMetadata?.IsNewProduct || false,
        IsFeaturedProduct: productMetadata?.IsFeaturedProduct || false,
      };

      setItems((prev) => [structuralPlaceholder, ...prev]);

      try {
        const response = await wishlistApi.addToWishlist(
          productId,
          productDetailId,
        );
        console.log("Add to Wishlist API Response:", response);
        if (response?.StatusCode === 0 || response?.Data) {
          // Replace temp element with clean, structured server response IDs
          setItems((prev) =>
            prev.map((item) =>
              item.ProductId === productId
                ? {
                    ...item,
                    WishListId: response.Data.WishListId,
                    ProductDetailId: response.Data.ProductDetailId,
                  }
                : item,
            ),
          );
        } else {
          fetchWishlist(); // Sync backup
        }
      } catch (err) {
        console.error("Addition Exception Rollback execution active:", err);
        setItems(originalItems);
        setApiMessage("Could not save item to wishlist.");
      }
    } else {
      // Optimistic UI Removal execution path
      setItems((prev) => prev.filter((item) => item.ProductId !== productId));

      try {
        await wishlistApi.removeById(targetWishlistItem.wishListId);
      } catch (err) {
        console.error("Removal standard fallback routine active:", err);
        // If query parameters fail, fallback seamlessly to route product configuration parameters
        try {
          await wishlistApi.removeByProductDetailId(productDetailId);
        } catch (deepErr) {
          console.error("Deep clean removal failure execution:", deepErr);
          setItems(originalItems); // Completely restore system context integrity state
          setApiMessage("Could not remove item from wishlist.");
        }
      }
    }

    // Clear processing block trace flags
    setProcessingIds((prev) => {
      const next = new Set(prev);
      next.delete(productId);
      return next;
    });
  };

  // Dedicated single identifier entry-point removal loop for the main wishlist view screen
  const removeByIdDirect = useCallback(
    async (wishListId: number) => {
      const originalItems = [...items];
      setItems((prev) => prev.filter((item) => item.WishListId !== wishListId));

      try {
        await wishlistApi.removeById(wishListId);
      } catch (error) {
        console.error("Direct Wishlist Removal error occurred:", error);
        setItems(originalItems);
        setApiMessage("Action could not be executed.");
      }
    },
    [items, setItems, setApiMessage],
  );

  return {
    items,
    loading,
    refreshing,
    wishlistMap,
    isProcessing: (id: number) => processingIds.has(id),
    fetchWishlist,
    toggleWishlist,
    removeByIdDirect,
    apiMessage,
    clearMessage: () => setApiMessage(null),
  };
};
