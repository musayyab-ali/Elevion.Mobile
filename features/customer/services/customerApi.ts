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

  /**
   * Updates user profile information.
   * @param profileData - The updated profile object
   */
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

  getOrders: async (pageNumber: number = 1, pageSize: number = 10) => {
    // Note: parameters are query params as per your image
    const endpoint = `/Customer/orders?PageNumber=${pageNumber}&PageSize=${pageSize}`;
    return await apiClient.get(endpoint);
  },

  getAddresses: async (pageSize = 10, pageNumber = 1) => {
    return await apiClient.get(
      `/Customer/addresses?PageSize=${pageSize}&PageNumber=${pageNumber}`,
    );
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

  // Get rating distribution for a specific product
  getProductRatings: async (productId: number) => {
    return await apiClient.get(`/Customer/ratings?productId=${productId}`);
  },

  deactivateAccount: async () => {
    return await apiClient.post(`/Customer/account/deactivate`);
  },
};
