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

  getCustomerOrders: async (params: {
    FromDate: string;
    ToDate?: string;
    OrderStatus?: number;
    UtcOffset?: number;
  }) => {
    const response = await apiClient.get("/Order/GetCustomerOrders", {
      params,
    });
    return response.data;
  },

  // Fetch complete details for a single order context
  getCustomerOrderDetails: async (orderId: string) => {
    const response = await apiClient.get("/Order/GetCustomerOrderDetails", {
      params: { OrderId: orderId },
    });
    return response.data;
  },

  // Cancel order via multipart/form-data POST mapping
  cancelCustomerOrder: async (orderId: string) => {
    const formData = new FormData(); // Required by multipart backend context signature
    const response = await apiClient.post(
      `/Order/CancelCustomerOrder`,
      formData,
      {
        params: { OrderId: orderId },
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },

  // 1. Fetch historical orders list using dates/status queries
  // getCustomerOrders: async (params: {
  //   FromDate: string;
  //   ToDate?: string;
  //   OrderStatus?: number;
  //   UtcOffset?: number;
  // }) => {
  //   const response = await apiClient.get("/Order/GetCustomerOrders", {
  //     params,
  //   });
  //   return response.data;
  // },

  // // 2. Fetch standalone full detailed object for a specific single order context
  // getCustomerOrderDetails: async (orderId: string) => {
  //   const response = await apiClient.get("/Order/GetCustomerOrderDetails", {
  //     params: { OrderId: orderId },
  //   });
  //   return response.data;
  // },

  // // 3. Cancel order via multipart/form-data POST mapping
  // cancelCustomerOrder: async (orderId: string) => {
  //   const formData = new FormData(); // Required by multipart backend context signature
  //   const response = await apiClient.post(
  //     `/Order/CancelCustomerOrder`,
  //     formData,
  //     {
  //       params: { OrderId: orderId },
  //       headers: {
  //         "Content-Type": "multipart/form-data",
  //       },
  //     },
  //   );
  //   return response.data;
  // },
};
