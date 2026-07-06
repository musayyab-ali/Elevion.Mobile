import { useCallback, useMemo } from "react";
import { wishlistApi } from "../services/wishlistApi";
import { useSharedWishlistData } from "@/store/WishlistContext";

export const useWishlist = () => {
  const {
    items,
    setItems,
    wishMessage,
    setWishMessage,
    processingIds,
    setProcessingIds,
    fetchWishlist,
  } = useSharedWishlistData();

  const setTimedWishMessage = useCallback(
    (message: string) => {
      setWishMessage(message);
      setTimeout(() => setWishMessage(null), 2000);
    },
    [setWishMessage],
  );

  const wishlistMap = useMemo(() => {
    const map = new Map<number, any>();
    items.forEach((item) => {
      if (item.ProductId) {
        map.set(item.ProductId, {
          wishListId: item.WishListId,
          productDetailId: item.ProductDetailId,
          ProductName: item.ProductName || item.Name || "Premium Product",
          MinPrice: item.MinPrice || item.Price || 0,
          MaxPrice: item.MaxPrice || item.Price || 0,
          ImageName: item.ImageName || item.ProductImage || "",
          InStock: item.InStock ?? true,
          ...item,
        });
      }
    });
    return map;
  }, [items]);

  const toggleWishlist = async (
    productId: number,
    productDetailId: number,
    productMetadata?: any,
  ) => {
    if (processingIds.has(productId)) return;

    const targetWishlistItem = wishlistMap.get(productId);
    const isAdding = !targetWishlistItem;

    setProcessingIds((prev) => {
      const next = new Set(prev);
      next.add(productId);
      return next;
    });

    const originalItems = [...items];

    if (isAdding) {
      const structuralPlaceholder = {
        WishListId: Date.now(),
        ProductId: productId,
        ProductDetailId: productDetailId,
        ProductName:
          productMetadata?.Name ||
          productMetadata?.ProductName ||
          "Premium Product",
        MinPrice: productMetadata?.MinPrice || productMetadata?.Price || 0,
        MaxPrice: productMetadata?.MaxPrice || productMetadata?.Price || 0,
        ProductImage:
          productMetadata?.ProductImages?.[0]?.OriginalImagePath || "",
        InStock: productMetadata?.InStock ?? true,
      };

      setItems((prev) => [...prev, structuralPlaceholder]);

      try {
        const response = await wishlistApi.addToWishlist(
          productId,
          productDetailId,
        );
        if (response?.StatusCode === 0 || response?.Data) {
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
          fetchWishlist();
        }
      } catch (err) {
        setItems(originalItems);
        setTimedWishMessage("Could not save item to wishlist.");
      }
    } else {
      setItems((prev) => prev.filter((item) => item.ProductId !== productId));

      try {
        await wishlistApi.removeById(targetWishlistItem.wishListId);
      } catch (err) {
        try {
          await wishlistApi.removeByProductDetailId(productDetailId);
        } catch (deepErr) {
          setItems(originalItems);
          setTimedWishMessage("Could not remove item.");
        }
      }
    }

    setProcessingIds((prev) => {
      const next = new Set(prev);
      next.delete(productId);
      return next;
    });
  };

  return {
    items,
    wishlistMap,
    isProcessing: (id: number) => processingIds.has(id),
    fetchWishlist,
    toggleWishlist,
    wishMessage,
  };
};
