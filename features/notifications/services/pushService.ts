import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import apiClient from "../../../services/api/apiClient";
import { isExpoPushToken, shouldAskForPermission } from "../utils/pushRules";

const TOKEN_KEY = "push_token";
const ASKED_KEY = "push_permission_asked";

/** Shows a notification that arrives while the app is open (as a banner) instead of dropping it. */
export function configureForegroundNotifications() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

async function ensureAndroidChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync("default", {
    name: "Order updates",
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

/**
 * Gets this phone's Expo push token (asking for permission once if needed) and tells the server, so order
 * updates reach the phone. Returns the token, or null when pushes are not possible (simulator, refused, offline).
 * Never throws: a missing notification must not get in the way of the app.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  try {
    if (!Device.isDevice) return null; // simulators have no push token

    await ensureAndroidChannel();

    const current = await Notifications.getPermissionsAsync();
    let status = current.status as "granted" | "denied" | "undetermined";

    const alreadyAsked = (await SecureStore.getItemAsync(ASKED_KEY)) === "1";
    if (shouldAskForPermission(status, alreadyAsked)) {
      await SecureStore.setItemAsync(ASKED_KEY, "1");
      status = (await Notifications.requestPermissionsAsync()).status as typeof status;
    }
    if (status !== "granted") return null;

    const projectId = (Constants.expoConfig?.extra as any)?.eas?.projectId ?? (Constants as any).easConfig?.projectId;
    if (!projectId) return null;

    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    if (!isExpoPushToken(token)) return null;

    await apiClient.post("/CustomerDevices/RegisterDevice", {
      token,
      platform: Platform.OS,
      appVersion: Constants.expoConfig?.version,
    });
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    return token;
  } catch {
    return null;
  }
}

/**
 * Stops pushes to this phone for the signed-in customer. Call it BEFORE the login tokens are deleted on logout
 * (the request needs them); on failure the server's own cleanup (a dead token is switched off) still applies.
 */
export async function unregisterPushNotifications(): Promise<void> {
  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (!token) return;
    await apiClient.post("/CustomerDevices/UnregisterDevice", { token });
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    // Offline at logout: the next customer to log in on this phone takes the token over server-side.
  }
}
