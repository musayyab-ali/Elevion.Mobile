import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import {
  configureForegroundNotifications,
  registerForPushNotifications,
} from "../services/pushService";
import { targetForNotification } from "../utils/pushRules";

configureForegroundNotifications();

/**
 * Registers the phone for push notifications while a customer is signed in, and opens the right screen when a
 * notification is tapped. Mount once, high in the tree.
 */
export function usePushNotifications(isAuthenticated: boolean) {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      void registerForPushNotifications();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const target = targetForNotification(response.notification.request.content.data);
      if (target && isAuthenticated) {
        router.push(target.pathname);
      }
    });
    return () => subscription.remove();
  }, [isAuthenticated, router]);
}
