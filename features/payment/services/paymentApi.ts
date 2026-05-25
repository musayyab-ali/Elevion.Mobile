import apiClient from "../../../services/api/apiClient";

export interface PayInvoicePayload {
  OrderId: number;
  OrderAmount: number;
  TenantPaymentGatewayId: number;
  PaymentGateway: number;
}

export const paymentApi = {
  // 1. Fetch Order Details & Gateways via SelectPayment endpoint
  getPaymentSetup: async (orderId: string) => {
    const response = await apiClient.get(`/Order/SelectPayment`, {
      params: { OrderId: orderId },
    });
    console.log("Payment Setup Response:", response.data);
    return response.data;
  },

  // 2. Process Invoice / Generate payment gateway URL
  payInvoice: async (payload: PayInvoicePayload) => {
    const response = await apiClient.post("/Payment/payinvoice", payload);
    return response.data;
  },

  // 3. Redeem Promo Code
  redeemPromo: async (code: string, orderId: number) => {
    const response = await apiClient.post(`/Payment/RedeemPromo`, null, {
      params: { Code: code, OrderId: orderId },
    });
    return response.data;
  },

  // 4. Cancel Promo Code
  cancelPromo: async (orderId: number, campaignId: number) => {
    const response = await apiClient.post(`/Payment/CancelPromo`, null, {
      params: { OrderId: orderId, CampaignId: campaignId },
    });
    return response.data;
  },

  // 5. Redeem Loyalty Points
  redeemPoints: async (points: number, orderId: number) => {
    const response = await apiClient.post(`/Payment/RedeemPoints`, null, {
      params: { RedeemPoints: points, OrderId: orderId },
    });
    return response.data;
  },

  // 6. Verify Payment Status
  verifyPayment: async (invoiceId: number) => {
    const response = await apiClient.post("/Payment/VerifyPayment", {
      InvoiceId: invoiceId,
    });
    return response.data;
  },
};
