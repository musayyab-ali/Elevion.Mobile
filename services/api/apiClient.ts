import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { emitLogout } from "../../utils/authEvents";
import { API_KEY, API_TIMEOUT_MS, API_URL } from "../../constants/config";

const BASE_URL = API_URL;
const SECURITY_KEY = API_KEY;

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "api-security-key": SECURITY_KEY,
  },
});

// Queue variables to handle concurrent API 401 blockages securely
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

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

    // Strict validation verification checking
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If a refresh process is already in mid-flight, hold back additional concurrent requests
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const accessToken = await SecureStore.getItemAsync("accessToken");
      const refreshToken = await SecureStore.getItemAsync("refreshToken");

      if (!accessToken || !refreshToken) {
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
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
        if (
          response.status === 200 &&
          response.data?.StatusCode === 200 &&
          response.data?.Data
        ) {
          const freshNewAccessToken = response.data.Data.AccessToken;
          const freshNewRefreshToken = response.data.Data.RefreshToken;

          await SecureStore.setItemAsync("accessToken", freshNewAccessToken);
          await SecureStore.setItemAsync("refreshToken", freshNewRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${freshNewAccessToken}`;

          // Release all stalled requests waiting in line with the fresh token
          processQueue(null, freshNewAccessToken);
          isRefreshing = false;

          return apiClient(originalRequest);
        } else {
          // Fallthrough handler for 200 responses that contain functional backend errors
          throw new Error("Invalid token refresh payload structure");
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;

        console.log(
          "Session expired completely. Clearing application state instances.",
        );

        await SecureStore.deleteItemAsync("accessToken");
        await SecureStore.deleteItemAsync("refreshToken");
        await SecureStore.deleteItemAsync("user_name");
        await SecureStore.deleteItemAsync("full_name");
        await SecureStore.deleteItemAsync("user_email");
        await SecureStore.deleteItemAsync("user_phone");
        await SecureStore.deleteItemAsync("phone_code");

        emitLogout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
