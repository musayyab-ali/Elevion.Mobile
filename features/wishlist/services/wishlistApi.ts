import apiClient from "../../../services/api/apiClient";

export const wishlistApi = {
  // 1. Get All Wishlist Items
  getWishlist: async (pageSize: number, pageNumber: number) => {
    try {
      const response = await apiClient.get("/Customer/wishlist", {
        params: { PageSize: pageSize, PageNumber: pageNumber },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  // 2. Add Item to Wishlist (Handles FormData Automatically)
  addToWishlist: async (productId: number, productDetailId: number) => {
    try {
      const formData = new FormData();
      // Even if empty, Axios correctly sets the boundary for multipart/form-data
      const response = await apiClient.post(
        "/Customer/wishlist/items",
        formData,
        {
          params: { ProductId: productId, ProductDetailId: productDetailId },
        },
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  // 3. Remove by WishListId
  removeById: async (wishListId: number) => {
    try {
      const response = await apiClient.delete(
        `/Customer/wishlist/items/${wishListId}`,
        {
          params: { WishListId: wishListId },
        },
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  // 4. Remove by ProductDetailId
  removeByProductDetailId: async (productDetailId: number) => {
    try {
      const response = await apiClient.delete(
        `/Customer/wishlist/items/product/${productDetailId}`,
        {
          params: { ProductDetailId: productDetailId },
        },
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },
};
