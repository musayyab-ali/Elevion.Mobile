import apiClient from "../../../services/api/apiClient";
import {
  CategoryResponse,
  CategoryQueryParams,
  Product,
  ProductByCategoryResponse,
  LandingPageData,
  BannerResponse,
} from "../types/shopTypes";

export const shopApi = {
  // Existing Category Logic
  getCategories: async (
    params: CategoryQueryParams,
  ): Promise<CategoryResponse> => {
    const response = await apiClient.get("/Category/current", {
      params: { ...params, Status: params.Status ?? -1 },
    });
    return response.data;
  },

  // 1. Updated: Home Page Mobile Banners
  getMobileBanners: async (): Promise<BannerResponse> => {
    const response = await apiClient.get("/TenantLanding/banners");
    return response.data;
  },

  // 2. Category Landing Sections
  getLandingPageProducts: async (): Promise<{ Data: LandingPageData[] }> => {
    const response = await apiClient.get("/Product/landing-page");
    return response.data;
  },

  // 3. Category Product List (CRITICAL FIX FOR SUB-CATEGORIES)
  getProductsByCategory: async (
    categoryId: number,
    page: number = 1,
  ): Promise<ProductByCategoryResponse> => {
    const response = await apiClient.get("/Product/by-category", {
      params: {
        CategoryId: categoryId,
        PageNumber: page,
        PageSize: 10, // Increased page size for a better premium catalog feel
        BrandId: -1,
        SortBy: "theLink",
      },
    });
    return response.data;
  },

  getProductDetails: async (
    productId: number,
    productDetailId?: number,
  ): Promise<{ Data: any }> => {
    const response = await apiClient.get("/Product/details", {
      params: {
        ProductId: productId,
        ProductDetailId: productDetailId,
      },
    });
    return response.data;
  },
};
