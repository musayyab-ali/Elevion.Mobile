import { useState, useEffect, useCallback } from "react";
import { wishlistApi } from "../services/wishlistApi";

export const useWishlist = () => {
  const fakeWishlistItem = [
    {
      WishListId: 101,
      ProductId: 5002,
      ProductName: "Classic White Sneakers",
      ProductImage:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbHEInk3t4--SMgIM6LDOArLUp-jzMijXtIw&s",
      ProductDetailId: 202,
      ProductVariants: "Size: 42, Color: White",
      IsCampaignApplied: false,
      Quantity: 1,
      Price: 120.0,
      DiscountedPrice: 85.0,
      TotalAmount: 85.0,
      IsPromotional: true,
      Discount: 35.0,
      InStock: true,
      Seo: {
        MetaTitle: "Classic White Sneakers - Premium Quality",
        MetaDescription: "Comfortable leather sneakers for everyday wear.",
        UrlSlug: "classic-white-sneakers",
        MetaKeywords: "shoes, sneakers, white, leather",
      },
      Category: {
        CategoryId: 10,
        CategoryName: "Footwear",
        CategoryDescription: "Shoes and sneakers for men and women",
        Seo: {
          MetaTitle: "Footwear - Shop Online",
          UrlSlug: "footwear",
        },
      },
      ComingSoon: false,
    },
    {
      WishListId: 102,
      ProductId: 5004,
      ProductName: "Black Hoody",
      ProductImage:
        "data:image/jpeg;base64,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",
      ProductDetailId: 202,
      ProductVariants: "Size: 42, Color: White",
      IsCampaignApplied: false,
      Quantity: 1,
      Price: 120.0,
      DiscountedPrice: 250.0,
      TotalAmount: 220.0,
      IsPromotional: true,
      Discount: 35.0,
      InStock: true,
      Seo: {
        MetaTitle: "Classic White Sneakers - Premium Quality",
        MetaDescription: "Comfortable leather sneakers for everyday wear.",
        UrlSlug: "classic-white-sneakers",
        MetaKeywords: "shoes, sneakers, white, leather",
      },
      Category: {
        CategoryId: 10,
        CategoryName: "Footwear",
        CategoryDescription: "Shoes and sneakers for men and women",
        Seo: {
          MetaTitle: "Headwear - Shop Online",
          UrlSlug: "footwear",
        },
      },
      ComingSoon: false,
    },
  ];
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [apiMessage, setApiMessage] = useState<string | null>(null);
  const fetchWishlist = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const result = await wishlistApi.getWishlist(100, 1); // Fetching first 100 items
      // setItems(result.Data?.WishItemList || [fakeWishlistItem]);
      setItems(fakeWishlistItem);
    } catch (error) {
      console.log("Wishlist Fetch Error:", error);
      setApiMessage("There was an error fetching your wishlist.");
    } finally {
      setTimeout(() => setApiMessage(null), 3000);
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const removeFromWishlist = async (wishListId: number) => {
    try {
      // Optimistic Update: Remove from UI immediately
      const previousItems = [...items];
      setItems(items.filter((item) => item.WishListId !== wishListId));

      await wishlistApi.removeById(wishListId);
    } catch (error) {
      fetchWishlist(); // Rollback if API fails
      console.log("Remove Error:", error);
      setApiMessage("There is something wrong, please try again.");
    } finally {
      setTimeout(() => setApiMessage(null), 3000);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  return {
    items,
    loading,
    refreshing,
    fetchWishlist,
    removeFromWishlist,
    apiMessage,
  };
};
