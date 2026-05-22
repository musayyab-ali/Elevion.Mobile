// import apiClient from "../../../services/api/apiClient";

// export const wishlistApi = {
//   // 1. Get All Wishlist Items
//   getWishlist: async (pageSize: number, pageNumber: number) => {
//     try {
//       const response = await apiClient.get("/Customer/wishlist", {
//         params: { PageSize: pageSize, PageNumber: pageNumber },
//       });
//       return response.data;
//     } catch (error: any) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // 2. Add Item to Wishlist (Handles FormData Automatically)
//   addToWishlist: async (productId: number, productDetailId: number) => {
//     try {
//       const formData = new FormData();
//       // Even if empty, Axios correctly sets the boundary for multipart/form-data
//       const response = await apiClient.post(
//         "/Customer/wishlist/items",
//         formData,
//         {
//           params: { ProductId: productId, ProductDetailId: productDetailId },
//         },
//       );
//       return response.data;
//     } catch (error: any) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // 3. Remove by WishListId
//   removeById: async (wishListId: number) => {
//     try {
//       const response = await apiClient.delete(
//         `/Customer/wishlist/items/${wishListId}`,
//         {
//           params: { WishListId: wishListId },
//         },
//       );
//       return response.data;
//     } catch (error: any) {
//       throw error.response?.data || error.message;
//     }
//   },

//   // 4. Remove by ProductDetailId
//   removeByProductDetailId: async (productDetailId: number) => {
//     try {
//       const response = await apiClient.delete(
//         `/Customer/wishlist/items/product/${productDetailId}`,
//         {
//           params: { ProductDetailId: productDetailId },
//         },
//       );
//       return response.data;
//     } catch (error: any) {
//       throw error.response?.data || error.message;
//     }
//   },
// };

import apiClient from "../../../services/api/apiClient";

export interface WishlistResponse {
  Message: string;
  StatusCode: number;
  Data: {
    TotalRecords: number;
    WishItemList: any[];
  };
}

export const wishlistApi = {
  // 1. Get All Wishlist Items (Paginated)
  getWishlist: async (
    pageSize: number,
    pageNumber: number,
  ): Promise<WishlistResponse> => {
    try {
      const response = await apiClient.get("/Customer/wishlist", {
        params: { PageSize: pageSize, PageNumber: pageNumber },
      });
      console.log("Wishlist API Response:", response.data);
      return response.data;
    } catch (error: any) {
      console.log("fucked twice");
      console.error("Wishlist API Error:", error);
      throw error.response?.data || error.message;
    }
  },

  // 2. Add Item to Wishlist (Handles FormData requirements seamlessly)
  addToWishlist: async (productId: number, productDetailId: number) => {
    try {
      const formData = new FormData();
      // Even if empty, Axios sets boundaries for multipart/form-data as per endpoint spec
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

  // 3. Remove by WishListId (Matching exact query parameter requirement)
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

  // 4. Remove by ProductDetailId (Corrected to match Swagger controller path)
  removeByProductDetailId: async (productDetailId: number) => {
    try {
      const response = await apiClient.delete(
        `/Customer/RemoveFromWishlistByProduct/wishlist/items/product/${productDetailId}`,
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },
};
