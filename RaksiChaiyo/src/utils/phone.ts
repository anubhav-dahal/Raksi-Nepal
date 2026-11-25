// Same rules as backend/src/utils/phone.js. Keep them in sync.

/** Nepali mobile: 10 digits starting with 96, 97 or 98. */
export const PHONE_PATTERN = /^9[678]\d{8}$/;

/** "+977 984-1234567" -> "9841234567". */
export const normalizePhone = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  return digits.length === 13 && digits.startsWith('977') ? digits.slice(3) : digits;
};

export const isValidPhone = (value: string) => PHONE_PATTERN.test(normalizePhone(value));
