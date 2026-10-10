import { API_KEY, API_TIMEOUT_MS, API_URL, API_URL_V2 } from "../../../constants/config";

const BASE_URL = API_URL;
const BASE_URL_TWO = API_URL_V2;
const SECURITY_KEY = API_KEY;

/** fetch with a timeout, so a dead connection fails with a clear error instead of hanging. */
const fetchWithTimeout = async (url: string, init: RequestInit = {}): Promise<Response> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error: any) {
    if (error?.name === "AbortError") {
      throw { Message: "The server took too long to respond. Please try again.", StatusCode: 408 };
    }
    throw { Message: "Unable to connect to the server. Please check your internet and try again.", StatusCode: 0 };
  } finally {
    clearTimeout(timer);
  }
};

const handleResponse = async (response: Response) => {
  const contentType = response.headers.get("content-type");

  if (contentType && contentType.includes("application/json")) {
    const result = await response.json();

    if (!response.ok) {
      // LOG internal error for the developer, don't show this raw object to user
      console.log(
        `[API Error] ${response.status}:`,
        JSON.stringify(result, null, 2),
      );
      throw result;
    }
    return result;
  } else {
    const text = await response.text();
    // LOG non-JSON errors (like IIS 404/500 HTML pages)
    console.log(`[Server Error] ${response.status}:`, text);

    throw {
      Message: "Something went wrong. Please try again later.",
      StatusCode: response.status,
    };
  }
};

// Reusable headers object to keep the code DRY
const getHeaders = () => ({
  "Content-Type": "application/json",
  Accept: "application/json",
  "api-security-key": SECURITY_KEY || "", // Using the fixed GUID key
});
const getAuthHeaders = (token: string) => ({
  ...getHeaders(),
  Authorization: `Bearer ${token}`,
});

export const authApi = {
  // --- AUTH SERVICE (OAuth) ---
  getToken: (credentials: any) =>
    fetchWithTimeout(`${BASE_URL}/oauth/token`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(credentials),
    }).then(handleResponse),

  refreshToken: (token: string) =>
    fetchWithTimeout(`${BASE_URL}/oauth/token/refresh`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ token }),
    }).then(handleResponse),

  // --- ACCOUNT SERVICE ---
  register: (data: any) =>
    fetchWithTimeout(`${BASE_URL}/Account/Register`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  isUserUnique: (value: string, type: "userName" | "email" | "phone") =>
    fetchWithTimeout(
      `${BASE_URL_TWO}/Account/IsUserUnique?Value=${encodeURIComponent(value)}&Type=${type}`,
      {
        method: "GET",
        headers: getHeaders(),
      },
    ).then(handleResponse),

  login: (credentials: { UserName: string; Password: string }) => {
    return fetchWithTimeout(`${BASE_URL}/oauth/token`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(credentials),
    }).then(handleResponse);
  },

  // Body: { OTP, PhoneCode, PhoneNumber, UpdateAuthToken }
  verifyOtp: (payload: {
    otp: string;
    phoneNumber?: string; // Optional now
    userName?: string; // Optional now
    phoneCode?: number;
  }) =>
    fetchWithTimeout(`${BASE_URL}/Account/VerifyOTP`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        OTP: payload.otp,
        PhoneCode: payload.phoneCode,
        PhoneNumber: payload.phoneNumber || "",
        Username: payload.userName || "",
        UpdateAuthToken: true,
      }),
    }).then(handleResponse),

  verifyPhoneOtp: (data: { UserName: string; Otp: string }) =>
    fetchWithTimeout(`${BASE_URL}/Account/VerifyPhoneOtp`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  // Body: { UserName } - Note: Ensure you pass the username here now
  resendOtp: (userName: string) =>
    fetchWithTimeout(`${BASE_URL}/Account/ResendOTP`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ UserName: userName }),
    }).then(handleResponse),

  sendForgotPasswordEmail: (username: string) =>
    fetchWithTimeout(`${BASE_URL_TWO}/Account/SendForgotPasswordEmail`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ Username: username }),
    }).then(handleResponse),

  forgotPassword: (payload: any) =>
    fetchWithTimeout(`${BASE_URL_TWO}/Account/ResetPassword`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    }).then(handleResponse),

  resetPassword: (payload: any) =>
    fetchWithTimeout(`${BASE_URL}/Account/ResetPassword`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    }).then(handleResponse),

  getDeletionStatus: (token: string) =>
    fetchWithTimeout(`${BASE_URL}/Customer/account/deletion-status`, {
      method: "GET",
      headers: getAuthHeaders(token),
    }).then(handleResponse),

  verifyDeletedPhone: (payload: {
    UserName: string;
    PhoneCode: string;
    PhoneNumber: string;
  }) =>
    fetchWithTimeout(`${BASE_URL}/Account/account/verify-deleted-phone`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    }).then(handleResponse),

  sendOtpToPhone: (payload: { PhoneNumber: string; PhoneCode: number }) =>
    fetchWithTimeout(`${BASE_URL}/Account/SendOTP`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    }).then(handleResponse),

  restoreDeletedAccount: (token: string) =>
    fetchWithTimeout(`${BASE_URL}/Customer/account/restore`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify({ files: [] }), // explicit payload compatibility fallback
    }).then(handleResponse),
};
