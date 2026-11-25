import type { Localized } from '../models/types';
import type { Language } from '../models/stores/prefsStore';

/** 2450 -> "NPR 2,450" (Indian digit grouping, as used in Nepal). */
export const formatNpr = (amount: number): string => {
  const [whole] = Math.round(amount).toString().split('.');
  const last3 = whole.slice(-3);
  const rest = whole.slice(0, -3);
  const grouped = rest ? `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',')},${last3}` : last3;
  return `NPR ${grouped}`;
};

/** Picks the text for the current language, falling back to English. */
export const localize = (text: Localized | undefined, language: Language = 'en'): string =>
  (language === 'ne' && text?.ne) || text?.en || '';
