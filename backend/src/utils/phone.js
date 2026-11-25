import { z } from 'zod';

// Nepali mobile numbers: 10 digits starting with 96, 97 or 98
// (Smart Telecom 961/962/988, Nepal Telecom 974-976/984-986, Ncell 980-982).
export const PHONE_PATTERN = /^9[678]\d{8}$/;

/** "+977 984-1234567" -> "9841234567". Removes spaces, dashes and the country code. */
export const normalizePhone = (value) => {
    const digits = String(value ?? '').replace(/\D/g, '');
    return digits.length === 13 && digits.startsWith('977') ? digits.slice(3) : digits;
};

export const phoneField = () =>
    z
        .string()
        .transform(normalizePhone)
        .pipe(z.string().regex(PHONE_PATTERN, 'must be a 10-digit Nepali mobile number (96, 97 or 98)'));
