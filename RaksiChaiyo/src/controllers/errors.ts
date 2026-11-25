import { API_URL, ApiError } from '../models/api/client';
import type { TFunction } from '../i18n';

/** Friendly text for any error thrown by the API layer. */
export const errorMessage = (error: unknown, t: TFunction): string => {
  if (error instanceof ApiError) {
    // Show the address tried, so a wrong IP or a blocked port is easy to spot.
    if (error.code === 'NETWORK') return t('error.network', { url: API_URL });
    if (error.code === 'TIMEOUT') return t('error.timeout');
    return error.message;
  }
  return t('common.error');
};
