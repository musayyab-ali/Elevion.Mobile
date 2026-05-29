import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { emitLogout } from "../../utils/authEvents";
// Using your environment variables for safety
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

/**
 * REQUEST INTERCEPTOR
 * Automatically attaches the AccessToken to every outgoing request.
 */
apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * RESPONSE INTERCEPTOR
 * The "Bouncer": If an API returns 401, it attempts to refresh the token
 * and retry the original request once.
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 (Unauthorized) and we haven't retried this request yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const accessToken = await SecureStore.getItemAsync("accessToken");
        const refreshToken = await SecureStore.getItemAsync("refreshToken");

        // Call your specific refresh endpoint
        // URL: /api/v1/oauth/token/refresh
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

          // 1. Store the fresh tokens
          await SecureStore.setItemAsync("accessToken", AccessToken);
          await SecureStore.setItemAsync("refreshToken", RefreshToken);

          // 2. Update the Authorization header of the failed request
          originalRequest.headers.Authorization = `Bearer ${AccessToken}`;

          // 3. Retry the original request with the new token
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.log("Session expired. Forcing logout.");

        // Clear tokens from storage
        await SecureStore.deleteItemAsync("accessToken");
        await SecureStore.deleteItemAsync("refreshToken");

        // Notify the AuthContext that the user is no longer authenticated
        emitLogout();

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
