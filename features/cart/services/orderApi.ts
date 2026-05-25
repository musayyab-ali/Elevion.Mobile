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
};
