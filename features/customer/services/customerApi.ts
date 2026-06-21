import apiClient from "../../../services/api/apiClient";

export const customerApi = {
  getProfile: async () => {
    try {
      const response = await apiClient.get("/Customer/GetProfile");
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  updateProfile: async (profileData: any) => {
    try {
      const response = await apiClient.put(
        "/Customer/UpdateProfile",
        profileData,
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  getOrders: async (pageSize: number, pageNumber: number) => {
    try {
      const responce = await apiClient.get("/Customer/orders", {
        params: { PageSize: pageSize, PageNumber: pageNumber },
      });
      return responce.data;
    } catch (error: any) {
      console.log("orders fetching error:", error);
      throw error.response?.data || error.message;
    }
  },

  getAddresses: async (pageSize = 10, pageNumber = 1) => {
    return await apiClient.get(
      `/Customer/addresses?PageSize=${pageSize}&PageNumber=${pageNumber}`,
    );
  },

  getCountries: async () => {
    return await apiClient.get("/Common/countries");
  },

  getStates: async (countryId: string | number) => {
    return await apiClient.get(`/Common/states`, {
      params: { CountryId: countryId },
    });
  },

  getCities: async (stateId: string | number) => {
    return await apiClient.get(`/Common/cities`, {
      params: { StateId: stateId },
    });
  },

  getAreas: async (cityId: string | number) => {
    return await apiClient.get(`/Common/areas`, {
      params: { CityId: cityId },
    });
  },

  getBranches: async (cityId: string | number) => {
    return await apiClient.get(`/Common/branches`, {
      params: { CityId: cityId },
    });
  },

  saveAddress: async (addressData: any) => {
    return await apiClient.post(`/Customer/address/save`, addressData);
  },

  deleteAddress: async (addressBookId: number) => {
    return await apiClient.delete(
      `/Customer/DeleteAddress/addresses/${addressBookId}`,
    );
  },

  // Paginated reviews for the current customer
  getCustomerReviews: async (pageNumber = 1, pageSize = 10) => {
    return await apiClient.get(
      `/Customer/reviews?PageNumber=${pageNumber}&PageSize=${pageSize}`,
    );
  },

  // All reviews (no pagination)
  getAllReviews: async () => {
    return await apiClient.get(`/Customer/reviews/all`);
  },

  getProductRatings: async (productId: number) => {
    return await apiClient.get(`/Customer/ratings?productId=${productId}`);
  },

  // 2. FIXED: Aligned exactly with Swagger's PascalCase configuration parameters
  getDetailedReviews: async (
    productId: number,
    pageNumber = 1,
    pageSize = 10,
  ) => {
    return await apiClient.get(
      `/Product/ratings?ProductId=${productId}&IsApproved=true&PageNumber=${pageNumber}&PageSize=${pageSize}&SortBy="thelink"`,
    );
  },

  // 3. Submits your user review data payload object structure
  saveProductRating: async (payload: {
    Rating: number;
    Review: string;
    ProductId: number;
  }) => {
    return await apiClient.post(`/Product/save/rating`, payload);
  },

  deactivateAccount: async () => {
    return await apiClient.post(`/Customer/account/deactivate`);
  },
};
