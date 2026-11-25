import { request } from './client';
import type { Category, Product } from '../types';

export const fetchCategories = async () =>
  (await request<{ data: Category[] }>('/categories')).data;

export const fetchProducts = async (category?: string) =>
  (await request<{ data: Product[] }>(`/products${category ? `?category=${encodeURIComponent(category)}` : ''}`)).data;

export const fetchProduct = async (id: string) =>
  (await request<{ data: Product }>(`/products/${encodeURIComponent(id)}`)).data;
