import Constants from 'expo-constants';

// Base URL of the backend.
// 1. EXPO_PUBLIC_API_URL if set (see .env.example)
// 2. In development: the PC running Expo (same IP as Metro), port 5000,
//    so a phone on the same Wi-Fi reaches the local API with no setup.
const resolveBaseUrl = (): string => {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');

  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  return `http://${host ?? 'localhost'}:5000`;
};

export const API_URL = resolveBaseUrl();

const TIMEOUT_MS = 12_000;

/** Error with the API's error code, or NETWORK / TIMEOUT for connection problems. */
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: { field: string; message: string }[]
  ) {
    super(message);
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  token?: string | null;
  headers?: Record<string, string>;
};

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${API_URL}/api${path}`, {
      method: options.method ?? 'GET',
      headers: {
        Accept: 'application/json',
        ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
        ...options.headers,
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });
  } catch (e) {
    const aborted = e instanceof Error && e.name === 'AbortError';
    throw new ApiError(
      0,
      aborted ? 'TIMEOUT' : 'NETWORK',
      aborted ? 'The server took too long to respond' : 'Cannot reach the server'
    );
  } finally {
    clearTimeout(timer);
  }

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const err = json?.error;
    throw new ApiError(res.status, err?.code ?? 'HTTP_ERROR', err?.message ?? `Request failed (${res.status})`, err?.details);
  }
  return json as T;
}
