// const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
// const SECURITY_KEY = process.env.EXPO_PUBLIC_API_KEY;
const BASE_URL = "http://thelink.innovex.biz/api/v1";
const SECURITY_KEY = "0786FDD1-THEL-4A14-BDE9-AF3B9E5CM0785";

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

export const authApi = {
  // --- AUTH SERVICE (OAuth) ---
  getToken: (credentials: any) =>
    fetch(`${BASE_URL}/oauth/token`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(credentials),
    }).then(handleResponse),

  refreshToken: (token: string) =>
    fetch(`${BASE_URL}/oauth/token/refresh`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ token }),
    }).then(handleResponse),

  // --- ACCOUNT SERVICE ---
  register: (data: any) =>
    fetch(`${BASE_URL}/Account/Register`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  verifyPhoneOtp: (data: { phoneNumber: string; otp: string }) =>
    fetch(`${BASE_URL}/Account/VerifyPhoneOtp`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  resendPhoneOtp: (phoneNumber: string) =>
    fetch(`${BASE_URL}/Account/ResendPhoneOtp`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ phoneNumber }),
    }).then(handleResponse),

  isUserNameUnique: (userName: string) =>
    fetch(`${BASE_URL}/Account/IsUserNameUnique?UserName=${userName}`, {
      method: "GET",
      headers: getHeaders(),
    }).then(handleResponse),
  // Logic Separation: Moved fetch logic here
  login: (credentials: { UserName: string; Password: string }) => {
    // 1. Remove the Form Data encoding logic
    // 2. Send as standard JSON to satisfy the server's Media Type requirements
    return fetch(`${BASE_URL}/oauth/token`, {
      method: "POST",
      headers: getHeaders(), // This uses "Content-Type": "application/json"
      body: JSON.stringify(credentials),
    }).then(handleResponse);
  },

  // Added this for your client's email testing requirement
  verifyEmailOtp: (data: { email: string; otp: string }) =>
    fetch(`${BASE_URL}/Account/VerifyEmailOtp`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  // Body: { OTP, PhoneCode, PhoneNumber, UpdateAuthToken }
  verifyOtp: (payload: {
    otp: string;
    phoneNumber?: string; // Optional now
    userName?: string; // Optional now
    phoneCode: number;
  }) =>
    fetch(`${BASE_URL}/Account/VerifyOTP`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        OTP: payload.otp,
        PhoneCode: payload.phoneCode,
        PhoneNumber: payload.phoneNumber || "", // Backend accepts empty string if Username is provided
        Username: payload.userName || "", // Backend accepts empty string if Phone is provided
        UpdateAuthToken: true,
      }),
    }).then(handleResponse),

  // Body: { UserName } - Note: Ensure you pass the username here now
  resendOtp: (userName: string) =>
    fetch(`${BASE_URL}/Account/ResendOTP`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ UserName: userName }),
    }).then(handleResponse),

  sendForgotPasswordEmail: (username: string) =>
    fetch(`${BASE_URL}/Account/SendForgotPasswordEmail`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ Username: username }),
    }).then(handleResponse),

  resetPassword: (payload: any) =>
    fetch(`${BASE_URL}/Account/ResetPassword`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    }).then(handleResponse),
};
