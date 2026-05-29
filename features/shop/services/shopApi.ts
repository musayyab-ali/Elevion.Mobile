import apiClient from "../../../services/api/apiClient";
import {
  CategoryResponse,
  CategoryQueryParams,
  Product,
  ProductByCategoryResponse,
  LandingPageData,
} from "../types/shopTypes";

export const shopApi = {
  // Existing Category Logic
  getCategories: async (
    params: CategoryQueryParams,
  ): Promise<CategoryResponse> => {
    const response = await apiClient.get("/Category/current", {
      params: { ...params, Status: params.Status ?? 1 },
    });
    return response.data;
  },

  // 1. Home Page Banners
  getFeaturedProducts: async (): Promise<{ Data: Product[] }> => {
    const response = await apiClient.get("/Product/featured", {
      params: { IsNew: true, IsFeatured: true }, // as seen in image_a1fe90.png
    });
    return response.data;
  },

  // 2. Category Landing Banners
  getLandingPageProducts: async (): Promise<{ Data: LandingPageData[] }> => {
    const response = await apiClient.get("/Product/landing-page");
    return response.data;
  },

  // 3. Category Product List
  getProductsByCategory: async (
    categoryId: number,
    page: number = 1,
  ): Promise<ProductByCategoryResponse> => {
    const response = await apiClient.get("/Product/by-category", {
      params: {
        CategoryId: categoryId,
        PageNumber: page,
        PageSize: 10,
        BrandId: -1, // as seen in image_a1a3c1.png
      },
    });
    return response.data;
  },

  // Inside services/shopApi.ts

  getProductDetails: async (
    productId: number,
    productDetailId?: number,
  ): Promise<{ Data: any }> => {
    const response = await apiClient.get("/Product/details", {
      params: {
        ProductId: productId,
        ProductDetailId: productDetailId, // Fallback default example from image_7c9347.png
      },
    });
    // console.log("dirsct details products :", response.data);
    return response.data;
  },
};
