import { API_URL } from '../models/api/client';

/** Turns an image from the API into a usable URL: "/static/..." is served by our backend; "" means none. */
export const imageUrl = (src: string | undefined | null): string | null => {
  if (!src) return null;
  return src.startsWith('/') ? `${API_URL}${src}` : src;
};
