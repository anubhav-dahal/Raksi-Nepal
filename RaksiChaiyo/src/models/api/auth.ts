import { request } from './client';
import type { User } from '../types';

type AuthResult = { token: string; user: User };

export const login = async (phone: string, password: string) =>
  (await request<{ data: AuthResult }>('/users/login', { method: 'POST', body: { phone, password } })).data;

export const register = async (input: { name: string; phone: string; email?: string; password: string }) =>
  (await request<{ data: AuthResult }>('/users/register', { method: 'POST', body: input })).data;

export const fetchMe = async (token: string) => (await request<{ data: User }>('/users/me', { token })).data;
