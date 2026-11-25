import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { request } from '../models/api/client';
import { useAuthStore } from '../models/stores/authStore';

// Show notifications while the app is open too.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * Gets this device's Expo push token. Needs a real device and an EAS project id
 * (app.json > extra.eas.projectId, set by `eas init`). Remote push does not
 * work in Expo Go on Android; use a development build to test it.
 */
const getPushToken = async (): Promise<string | null> => {
  const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
  if (!Device.isDevice || !projectId) return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('orders', {
      name: 'Order updates',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  let { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') status = (await Notifications.requestPermissionsAsync()).status;
  if (status !== 'granted') return null;

  return (await Notifications.getExpoPushTokenAsync({ projectId })).data;
};

/** Registers for order-update pushes after login; opens the order when a push is tapped. */
export const usePushNotifications = () => {
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!token) return;
    getPushToken()
      .then((pushToken) =>
        pushToken ? request('/users/me/push-token', { method: 'POST', token, body: { token: pushToken } }) : null
      )
      // Push is a nice-to-have: never bother the user if it fails.
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const orderId = response.notification.request.content.data?.orderId;
      if (typeof orderId === 'string') router.push({ pathname: '/order/[id]', params: { id: orderId } });
    });
    return () => sub.remove();
  }, []);
};
