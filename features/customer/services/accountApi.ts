import apiClient from "../../../services/api/apiClient";

export const accountApi = {
  changePassword: async (payload: {
    OldPassword?: string;
    NewPassword?: string;
  }) => {
    try {
      const response = await apiClient.post("/Account/ChangePassword", payload);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  changeEmail: async (payload: { NewEmail: string }) => {
    try {
      const response = await apiClient.post("/Account/ChangeEmail", payload);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  deleteAccount: async () => {
    try {
      const response = await apiClient.delete("/Customer/account/delete");
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },

  restoreAccount: async (payload: { UserName: string; Email: string }) => {
    try {
      const response = await apiClient.post(
        "/Customer/account/restore",
        payload,
      );
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error.message;
    }
  },
};
