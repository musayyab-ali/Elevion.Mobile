import apiClient from "../../../services/api/apiClient";
import { camelize } from "../../rewards/services/rewardsApi";

/**
 * Customer returns (RMA): ask to send back items of a delivered order and follow the request.
 * The API answers in PascalCase inside { Message, StatusCode, Data }; screens use the camelCase shapes below.
 */

export interface ReturnableItem {
  orderProductId: number;
  productId: number;
  productName: string | null;
  ordered: number;
  alreadyRequested: number;
  returnable: number;
  unitAmount: number;
}

export interface ReturnableOrder {
  orderId: number;
  orderNumber: string | null;
  canReturn: boolean;
  reason: string | null;
  returnByDate: string | null;
  items: ReturnableItem[];
  reasons: { code: number; name: string }[];
}

export interface ReturnRequestDto {
  returnId: number;
  reference: string;
  orderId: number;
  orderNumber: string | null;
  status: number;
  statusName: string;
  resolution: number;
  resolutionName: string;
  reasonName: string;
  comments: string | null;
  refundAmount: number;
  createdOn: string;
  decisionNote: string | null;
  canCancel: boolean;
  items: { orderProductId: number; productName: string | null; quantity: number; unitAmount: number }[];
  timeline: { status: number; statusName: string; note: string | null; createdOn: string }[];
}

export const RESOLUTIONS = [
  { value: 1, label: "Refund", hint: "Get your money back" },
  { value: 2, label: "Replacement", hint: "Get the same item again" },
  { value: 3, label: "Store credit", hint: "Get a gift card with the value" },
] as const;

export interface CreateReturnPayload {
  orderId: number;
  reasonCode: number;
  resolution: number;
  comments?: string;
  items: { orderProductId: number; quantity: number }[];
}

export const returnsApi = {
  getReturnableOrder: async (orderId: number): Promise<ReturnableOrder> => {
    const response = await apiClient.get("/CustomerReturns/GetReturnableOrder", { params: { orderId } });
    return camelize<ReturnableOrder>(response.data?.Data);
  },

  createReturn: async (payload: CreateReturnPayload): Promise<ReturnRequestDto> => {
    const response = await apiClient.post("/CustomerReturns/CreateReturn", {
      OrderId: payload.orderId,
      ReasonCode: payload.reasonCode,
      Resolution: payload.resolution,
      Comments: payload.comments?.trim() || null,
      Items: payload.items.map((i) => ({ OrderProductId: i.orderProductId, Quantity: i.quantity })),
    });
    return camelize<ReturnRequestDto>(response.data?.Data);
  },

  getMyReturns: async (): Promise<ReturnRequestDto[]> => {
    const response = await apiClient.get("/CustomerReturns/GetMyReturns");
    return camelize<ReturnRequestDto[]>(response.data?.Data ?? []);
  },

  cancelReturn: async (returnId: number): Promise<ReturnRequestDto> => {
    const response = await apiClient.post("/CustomerReturns/CancelReturn", null, { params: { returnId } });
    return camelize<ReturnRequestDto>(response.data?.Data);
  },
};
