import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { emitLogout } from "../../utils/authEvents";

// const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
// const SECURITY_KEY = process.env.EXPO_PUBLIC_API_KEY;
const BASE_URL = "http://thelink.innovex.biz/api/v1";
const SECURITY_KEY = "0786FDD1-THEL-4A14-BDE9-AF3B9E5CM0785";
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "api-security-key": SECURITY_KEY,
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const accessToken = await SecureStore.getItemAsync("accessToken");
      const refreshToken = await SecureStore.getItemAsync("refreshToken");

      if (!accessToken || !refreshToken) {
        return Promise.reject(error);
      }

      try {
        console.log("Attempting Token Refresh Process Workflow Step...");
        const response = await axios.post(
          `${BASE_URL}/oauth/token/refresh`,
          {
            AccessToken: accessToken,
            RefreshToken: refreshToken,
          },
          {
            headers: { "api-security-key": SECURITY_KEY },
          },
        );

        if (response.status === 200 && response.data?.Data) {
          const { AccessToken, RefreshToken } = response.data.Data;

          await SecureStore.setItemAsync("accessToken", AccessToken);
          await SecureStore.setItemAsync("refreshToken", RefreshToken);

          console.log("Tokens synchronized successfully.");
          originalRequest.headers.Authorization = `Bearer ${AccessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.log(
          "Session expired completely. Clearing application state instances.",
        );

        await SecureStore.deleteItemAsync("accessToken");
        await SecureStore.deleteItemAsync("refreshToken");
        await SecureStore.deleteItemAsync("user_name");
        await SecureStore.deleteItemAsync("full_name");
        await SecureStore.deleteItemAsync("user_email");
        await SecureStore.deleteItemAsync("user_phone");

        emitLogout(); // Emits forceLogout back out to global layout context instances
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
