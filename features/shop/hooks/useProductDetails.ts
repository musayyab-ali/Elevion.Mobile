// Create features/shop/hooks/useProductDetails.ts
import { useState, useEffect } from "react";
import { shopApi } from "../services/shopApi";
import { addRecentlyViewed } from "../utils/recentlyViewed";

export const useProductDetails = (productId: string | undefined) => {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  useEffect(() => {
    if (!productId) return;

    const fetchDetails = async () => {
      setLoading(true);
      try {
        const response = await shopApi.getProductDetails(Number(productId));
        const data = response?.Data;
        setProduct(data);

        if (data?.ProductId) {
          void addRecentlyViewed({
            ProductId: data.ProductId,
            ProductName: data.Name ?? "",
            MinPrice: Number(data.MinPrice) || 0,
            ThumbnailImagePath: data.ProductImages?.[0]?.LargeImagePath || data.ProductImages?.[0]?.IconImagePath || undefined,
          });
        }

        // Auto-select the default SKU variant array combination if available
        if (
          data?.ProductVariantDetail?.productVariantCombinationList?.length > 0
        ) {
          const defaultVariant =
            data.ProductVariantDetail.productVariantCombinationList.find(
              (v: any) => v.SKU === data.DefaultSKU,
            ) || data.ProductVariantDetail.productVariantCombinationList[0];

          setSelectedVariant(defaultVariant);
        }
      } catch (error) {
        console.log("Error fetching product details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [productId]);

  return { product, loading, selectedVariant, setSelectedVariant };
};
