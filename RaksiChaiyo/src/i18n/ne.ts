import type { StringKey } from './en';

// Nepali translations. Missing keys fall back to English, so this can be
// filled in gradually (full translation is a Phase 7 task).
export const ne: Partial<Record<StringKey, string>> = {
  tagline: 'पेय, खाजा र राम्रा पलहरू',
  location: 'नेपालगञ्ज, नेपाल',
  'common.retry': 'फेरि प्रयास गर्नुहोस्',
  'common.back': 'पछाडि',
  'home.eyebrow': 'नेपालगञ्जमा डेलिभरी',
  'product.addToCart': 'कार्टमा राख्नुहोस्',
  'product.buyNow': 'अहिले किन्नुहोस्',
  'cart.title': 'तपाईंको कार्ट',
  'cart.checkout': 'चेकआउट',
};
