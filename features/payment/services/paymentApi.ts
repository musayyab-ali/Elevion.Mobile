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

  cancelCustomerOrder: async (orderId: string) => {
    const formData = new FormData();

    // 🌟 FIX: Swagger marks 'files' array as a REQUIRED part of the request body.
    // We append an empty blob/string to satisfy the multipart structural requirement.
    formData.append("files", "");

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

  verifyPayment: async (invoiceId: string | number) => {
    // If the server expects an Int64, ensure it's parsed to a numeric value
    const numericId = Number(invoiceId);

    // Wrap in requestDto context since the server threw a validation error asking for it
    const response = await apiClient.post("/Payment/VerifyPayment", {
      InvoiceId: numericId,
      requestDto: {
        InvoiceId: numericId,
      },
    });
    return response.data;
  },

  verifyLogPayment: async (invoiceLogId: string | number) => {
    const numericLogId = Number(invoiceLogId);
    const response = await apiClient.post("/Payment/VerifyLogPayment", {
      InvoiceLogId: numericLogId,
      requestDto: {
        InvoiceLogId: numericLogId,
      },
    });
    return response.data;
  },

  checkOrderPaymentStatus: async (orderId: number, formData: FormData) => {
    const response = await apiClient.post(
      `/Payment/CheckOrderPaymentStatus`,
      formData, // Pass the native form data payload here directly
      {
        params: { orderId },
        headers: {
          "Content-Type": "multipart/form-data",
        },
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
