import apiClient from "../../../services/api/apiClient";

export interface CartResponse {
  Message: string;
  Type: string;
  HttpStatusCode: number;
  Data: {
    CartItemList: any[];
    TotalPrice: number;
    TotalDiscount: number;
    NetTotal: number;
    HomeDeliveryEnable: boolean;
    CartCount?: number;
  };
}

export interface AddToCartResponse {
  Message: string;
  Type: string;
  HttpStatusCode: number;
  Data: {
    CartCount: number;
  };
}

export const cartApi = {
  // 1. Authenticated Add to Cart (Uses URL Query Parameters)
  addToCart: async (
    productId: number,
    productDetailId: number,
    quantity: number,
  ): Promise<AddToCartResponse> => {
    const response = await apiClient.post(
      "/Cart/AddToCart/add-product",
      {},
      {
        params: {
          ProductId: productId,
          ProductDetailId: productDetailId,
          Quantity: quantity,
        },
      },
    );
    return response.data;
  },

  // 2. Guest Add to Cart (Uses URL Path + Query Parameters)
  addToCartGuest: async (
    sessionId: string,
    productId: number,
    productDetailId: number,
    quantity: number,
  ): Promise<AddToCartResponse> => {
    const response = await apiClient.post(
      `/Cart/AddToCartGuest/session/${sessionId}/add`,
      {},
      {
        params: {
          ProductId: productId,
          ProductDetailId: productDetailId,
          Quantity: quantity,
        },
      },
    );
    return response.data;
  },

  // 3. Get Authenticated Cart
  getCart: async (): Promise<CartResponse> => {
    const response = await apiClient.get("/Cart/GetCart/current");
    // console.log("API Response for Get Cart:", response.data);
    return response.data;
  },

  // 4. Get Guest Cart
  getCartGuest: async (sessionId: string): Promise<CartResponse> => {
    const response = await apiClient.get(`/Cart/GetCart/session/${sessionId}`);
    console.log("API Response for Get Cart session:", response.data);
    return response.data;
  },

  // Add these function structures inside your cartApi object in cartApi.ts

  // 5. Update Cart Quantity (Combines Path Parameter + Query Parameter)
  updateQuantity: async (
    cartId: number,
    quantity: number,
  ): Promise<{ Message: string; Data: string }> => {
    const response = await apiClient.patch(
      `/Cart/UpdateCart/update-quantity/${cartId}`,
      {},
      {
        params: { quantity },
      },
    );
    return response.data;
  },

  // 6. Delete Item From Cart
  deleteItem: async (
    cartId: number,
  ): Promise<{ Message: string; Data: { CartCount: number } }> => {
    const response = await apiClient.delete(
      `/Cart/DeleteItemFromCart/remove/${cartId}`,
    );
    return response.data;
  },

  checkout: async (fileUris: string[] = []): Promise<any> => {
    // ✅ FIX: If no attachments are passed, don't use FormData at all!
    if (fileUris.length === 0) {
      const response = await apiClient.post("/Cart/Checkout/checkout", null, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    }

    // Fallback to Multipart handling only if files actually exist
    const formData = new FormData();
    fileUris.forEach((uri, index) => {
      const fileType = uri.split(".").pop();
      formData.append("files", {
        uri,
        name: `attachment_${index}.${fileType}`,
        type: `image/${fileType === "pdf" ? "pdf" : "jpeg"}`,
      } as any);
    });

    const response = await apiClient.post("/Cart/Checkout/checkout", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  checkoutGuest: async (
    sessionId: string,
    fileUris: string[] = [],
  ): Promise<any> => {
    // ✅ FIX: Guest route option check if attachments array is empty
    if (fileUris.length === 0) {
      const response = await apiClient.post(
        `/Cart/Checkout/session/${sessionId}/checkout`,
        null,
        {
          headers: { "Content-Type": "application/json" },
        },
      );
      return response.data;
    }

    const formData = new FormData();
    fileUris.forEach((uri, index) => {
      const fileType = uri.split(".").pop();
      formData.append("files", {
        uri,
        name: `attachment_${index}.${fileType}`,
        type: `image/${fileType === "pdf" ? "pdf" : "jpeg"}`,
      } as any);
    });

    const response = await apiClient.post(
      `/Cart/Checkout/session/${sessionId}/checkout`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },
};
