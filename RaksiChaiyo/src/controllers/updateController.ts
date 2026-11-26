import Constants from 'expo-constants';
import { useEffect } from 'react';
import { Alert, AppState, Linking, Platform } from 'react-native';
import { translate } from '../i18n';
import { request } from '../models/api/client';
import { usePrefsStore } from '../models/stores/prefsStore';

type LatestBuild = {
  version: string;
  versionCode: number;
  notes: string | null;
  required: boolean;
  downloadUrl: string;
};

// versionCode baked into this APK from app.json at build time.
const installedCode = Constants.expoConfig?.android?.versionCode ?? 0;

// Only installed Android builds update this way (not Expo Go, dev or web).
const enabled = Platform.OS === 'android' && !__DEV__ && installedCode > 0;

let prompting = false;
let dismissedCode = 0;

const checkForUpdate = async () => {
  if (prompting) return;
  let latest: LatestBuild | null;
  try {
    latest = (await request<{ data: LatestBuild | null }>('/app/version')).data;
  } catch {
    return; // Server offline: try again next time the app opens.
  }
  if (!latest || latest.versionCode <= installedCode) return;
  if (!latest.required && latest.versionCode <= dismissedCode) return;

  const language = usePrefsStore.getState().language;
  const t = (key: Parameters<typeof translate>[1], vars?: Record<string, string>) => translate(language, key, vars);
  const message = [t('update.message', { version: latest.version }), latest.notes].filter(Boolean).join('\n\n');
  const download = () => {
    prompting = false;
    // Opens the browser, which downloads the APK; tap it to install over this version.
    Linking.openURL(latest.downloadUrl);
  };

  prompting = true;
  Alert.alert(
    t('update.title'),
    message,
    latest.required
      ? [{ text: t('update.install'), onPress: download }]
      : [
          {
            text: t('update.later'),
            style: 'cancel',
            onPress: () => {
              prompting = false;
              dismissedCode = latest.versionCode;
            },
          },
          { text: t('update.install'), onPress: download },
        ],
    { cancelable: !latest.required, onDismiss: () => (prompting = false) }
  );
};

/** Asks to install a newer local build when the backend has one (see tools/build-local.mjs). */
export const useUpdateCheck = () => {
  useEffect(() => {
    if (!enabled) return;
    checkForUpdate();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') checkForUpdate();
    });
    return () => sub.remove();
  }, []);
};
