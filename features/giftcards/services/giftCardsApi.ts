import apiClient from "../../../services/api/apiClient";
import { camelize } from "../../rewards/services/rewardsApi";

/** Customer gift cards: stored-value cards added by code and spent on orders. camelCase shapes for the screens. */

export interface GiftCardTransaction {
  type: number;
  typeName: string;
  amount: number;
  balanceAfter: number;
  orderId: number | null;
  note: string | null;
  createdOn: string;
}

export interface GiftCard {
  giftCardId: number;
  maskedCode: string;
  initialAmount: number;
  balance: number;
  statusName: string;
  isUsable: boolean;
  expiresOn: string | null;
  createdOn: string;
  /** What this card pays on the order that was asked about (0 otherwise). */
  appliedToOrder: number;
  transactions: GiftCardTransaction[];
}

export const giftCardsApi = {
  getMyGiftCards: async (orderId?: number): Promise<GiftCard[]> => {
    const response = await apiClient.get("/CustomerGiftCards/GetMyGiftCards", { params: orderId ? { orderId } : undefined });
    return camelize<GiftCard[]>(response.data?.Data ?? []);
  },

  /** Rejects with the API's own message ("This gift card code is not valid.", "Too many wrong codes ..."). */
  addGiftCard: async (code: string): Promise<GiftCard> => {
    const response = await apiClient.post("/CustomerGiftCards/AddGiftCard", { Code: code.trim() });
    return camelize<GiftCard>(response.data?.Data);
  },

  applyGiftCard: async (orderId: number, giftCardId: number, amount: number) => {
    const response = await apiClient.post("/CustomerGiftCards/ApplyGiftCard", { OrderId: orderId, GiftCardId: giftCardId, Amount: amount });
    return response.data;
  },

  removeGiftCard: async (orderId: number, giftCardId: number) => {
    const response = await apiClient.post("/CustomerGiftCards/RemoveGiftCard", { OrderId: orderId, GiftCardId: giftCardId, Amount: 0 });
    return response.data;
  },
};
