import apiClient from "../../../services/api/apiClient";

export interface PayInvoicePayload {
  OrderId: number;
  OrderAmount: number;
  TenantPaymentGatewayId: number;
  PaymentGateway: number;
}

export const paymentApi = {
  // Fetch order invoice parameters & matching payment gateways
  getPaymentSetup: async (orderId: string) => {
    console.log("Fetching payment setup for Order ID:", orderId);
    const response = await apiClient.get(`/Order/SelectPayment`, {
      params: { OrderId: orderId },
    });
    console.log("Payment Setup Response:", response.data);
    return response.data;
  },

  // Authorize & Process checkout invoice to return a portal redirect URL
  payInvoice: async (payload: PayInvoicePayload) => {
    const response = await apiClient.post("/Payment/payinvoice", payload);
    return response.data;
  },

  // Apply promo marketing coupons (Pass parameters as query strings; pass body fallback as null)
  redeemPromo: async (code: string, orderId: number) => {
    const response = await apiClient.post(`/Payment/RedeemPromo`, null, {
      params: { Code: code, OrderId: orderId },
    });
    return response.data;
  },

  // Remove applied promo code from order reference tracking metrics
  cancelPromo: async (orderId: number, campaignId: number) => {
    const response = await apiClient.post(`/Payment/CancelPromo`, null, {
      params: { OrderId: orderId, CampaignId: campaignId },
    });
    return response.data;
  },

  // Burn a precise number of system loyalty points against net balances
  redeemPoints: async (points: number, orderId: number) => {
    const response = await apiClient.post(`/Payment/RedeemPoints`, null, {
      params: { RedeemPoints: points, OrderId: orderId },
    });
    return response.data;
  },

  // Cancel Customer Order completely before payment authorization triggers
  cancelCustomerOrder: async (orderId: number) => {
    const formData = new FormData(); // strictly mapped to multipart/form-data requirements
    const response = await apiClient.post(
      `/Order/CancelCustomerOrder`,
      formData,
      {
        params: { OrderId: orderId },
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },

  verifyPayment: async (invoiceId: string) => {
    const response = await apiClient.post("/Payment/VerifyPayment", {
      InvoiceId: invoiceId,
    });
    return response.data;
  },

  // 2. Alternative Fallback Transaction Log Verification Engine
  verifyLogPayment: async (invoiceLogId: string) => {
    const response = await apiClient.post("/Payment/VerifyLogPayment", {
      InvoiceLogId: invoiceLogId,
    });
    return response.data;
  },

  // checkOrderPaymentStatus: async (orderId: number) => {
  //   const response = await apiClient.post(
  //     `/Payment/CheckOrderPaymentStatus`,
  //     null,
  //     {
  //       params: { orderId },
  //     },
  //   );
  //   return response.data;
  // },

  // checkOrderPaymentStatus: async (orderId: number) => {
  //   // Creating a FormData instance safely satisfies the multi-part/array expectation on the backend
  //   const data = new FormData();

  //   const response = await apiClient.post(
  //     `/Payment/CheckOrderPaymentStatus`,
  //     data,
  //     {
  //       params: { orderId },
  //       headers: {
  //         "Content-Type": "multipart/form-data",
  //       },
  //     },
  //   );
  //   return response.data;
  // },

  checkOrderPaymentStatus: async (orderId: number) => {
    const response = await apiClient.post(
      `/Payment/CheckOrderPaymentStatus`,
      [], // Send an empty array directly in the JSON body payload to satisfy files * array<string>
      {
        params: { orderId },
      },
    );
    return response.data;
  },

  // 2. Lock final order values on server side before parsing payment instruments
  confirmOrder: async (payload: {
    OrderId: number;
    RedeemPoints: number;
    CampaignId: number;
  }) => {
    const response = await apiClient.post(`/Order/ConfirmOrder`, payload);
    return response.data;
  },
};
