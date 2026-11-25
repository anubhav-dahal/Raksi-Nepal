import { isRunningInExpoGo } from 'expo';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { request } from '../models/api/client';
import { useAuthStore } from '../models/stores/authStore';

// Remote push needs a development or store build: Expo Go (since SDK 53) and the
// web preview don't support it, and merely loading expo-notifications there
// prints warnings/errors. So the module is only loaded where push can work.
const pushSupported = Platform.OS !== 'web' && !isRunningInExpoGo() && Device.isDevice;

type NotificationsModule = typeof import('expo-notifications');
let notifications: NotificationsModule | null = null;
const loadNotifications = (): NotificationsModule | null => {
  if (!pushSupported) return null;
  if (!notifications) {
    notifications = require('expo-notifications') as NotificationsModule;
    // Show notifications while the app is open too.
    notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }
  return notifications;
};

/** This device's Expo push token. Needs an EAS project id (app.json > extra.eas.projectId, from `eas init`). */
const getPushToken = async (): Promise<string | null> => {
  const Notifications = loadNotifications();
  const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
  if (!Notifications || !projectId) return null;

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
    const Notifications = loadNotifications();
    if (!Notifications) return;
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const orderId = response.notification.request.content.data?.orderId;
      if (typeof orderId === 'string') router.push({ pathname: '/order/[id]', params: { id: orderId } });
    });
    return () => sub.remove();
  }, []);
};
