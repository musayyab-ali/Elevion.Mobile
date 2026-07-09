import apiClient from "../../../services/api/apiClient"; // Adjust to your setup path

export interface CreateOrderPayload {
  IsGiftOrder: boolean;
  ShippingDetail: {
    FullName: string;
    EmailAddress: string;
    Phone: string;
    Country: string;
    CityId: number;
    Address: string;
    City: string;
    AddressBookId: number;
    Longitude: string;
    Latitude: string;
  };
  BillingDetail: {
    EmailAddress: string;
    Phone: string;
    FullName: string;
  };
  SessionId?: string;
  BranchId: number;
  DeliveryDate: string;
  IsAddNewAddress: boolean;
  DeliveryOption: number; // DeliveryTypeId from courier options API
  SpecialInstructions: string;
  DeliveryInstructions: string;
  OrderSource: number; // 1 for Mobile App
  CityId: number;
  CountryId: number;
}

export const orderApi = {
  createOrder: async (payload: CreateOrderPayload) => {
    const response = await apiClient.post("/Order/create", payload);
    return response.data;
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

  getCustomerOrderDetails: async (orderId: string) => {
    const response = await apiClient.get("/Order/GetCustomerOrderDetails", {
      params: { OrderId: orderId },
    });
    return response.data;
  },

  // Add these to your orderApi mapping structure
  getOrderCancellationReasons: async () => {
    return await apiClient.get(`/Common/orderreason`);
  },

  cancelCustomerOrder: async (orderId: string, reasonValue: string) => {
    // Pass both OrderId query param and the reason data context requested by the backend
    return await apiClient.post(
      `/Order/CancelCustomerOrder?OrderId=${orderId}`,
      {
        ReasonValue: reasonValue,
        Files: [],
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
  },
};
