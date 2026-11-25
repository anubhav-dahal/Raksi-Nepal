import { request, upload, type UploadFile } from './client';
import type { AdminCategory, AdminProduct, AdminSummary, OrderStatus, Rider, Role, StaffOrder, StockMovement, User } from '../types';

// ---- Admin -------------------------------------------------------------------

export type OrderFilter = 'active' | 'all' | OrderStatus;

export const fetchSummary = async (token: string) => (await request<{ data: AdminSummary }>('/admin/summary', { token })).data;

export const fetchAdminOrders = async (token: string, status: OrderFilter) =>
  (await request<{ data: StaffOrder[] }>(`/admin/orders?status=${status}`, { token })).data;

export const fetchRiders = async (token: string) => (await request<{ data: Rider[] }>('/admin/riders', { token })).data;

export const assignRider = async (token: string, orderId: string, riderId: string) =>
  (await request<{ data: StaffOrder }>(`/admin/orders/${orderId}/assign`, { method: 'POST', token, body: { riderId } })).data;

export const setOrderStatus = async (token: string, orderId: string, status: OrderStatus, note?: string) =>
  (await request<{ data: StaffOrder }>(`/orders/${orderId}/status`, { method: 'PATCH', token, body: { status, note } })).data;

export const fetchAdminProducts = async (token: string) =>
  (await request<{ data: AdminProduct[] }>('/admin/products', { token })).data;

export type ProductUpdate = { isActive?: boolean; name?: string; description?: string; image?: string; categoryId?: string };

export const updateProduct = async (token: string, id: string, body: ProductUpdate) =>
  (await request<{ data: AdminProduct }>(`/admin/products/${id}`, { method: 'PATCH', token, body })).data;

export type VariantInput = { label: string; price: number; stock: number };

export const createProduct = async (
  token: string,
  body: { categoryId: string; name: string; description: string; image: string; variants: VariantInput[] }
) => (await request<{ data: AdminProduct }>('/admin/products', { method: 'POST', token, body })).data;

export const addVariant = async (token: string, id: string, body: VariantInput) =>
  (await request<{ data: AdminProduct }>(`/admin/products/${id}/variants`, { method: 'POST', token, body })).data;

/** Uploads a photo; returns its URL path (/static/uploads/...) to save on a category or product. */
export const uploadImage = async (token: string, file: UploadFile) =>
  (await upload<{ data: { url: string } }>('/admin/uploads', 'image', file, token)).data.url;

// ---- Admin: categories ----------------------------------------------------------

export type CategoryInput = { name: string; image: string; alcoholic: boolean; isActive: boolean };

export const fetchAdminCategories = async (token: string) =>
  (await request<{ data: AdminCategory[] }>('/admin/categories', { token })).data;

export const createCategory = async (token: string, body: CategoryInput) =>
  (await request<{ data: AdminCategory }>('/admin/categories', { method: 'POST', token, body })).data;

export const updateCategory = async (token: string, id: string, body: Partial<CategoryInput>) =>
  (await request<{ data: AdminCategory }>(`/admin/categories/${id}`, { method: 'PATCH', token, body })).data;

export const updatePrice = async (token: string, id: string, sku: string, price: number) =>
  (await request<{ data: AdminProduct }>(`/admin/products/${id}/variants/${encodeURIComponent(sku)}`, { method: 'PATCH', token, body: { price } })).data;

export const adjustStock = async (
  token: string,
  id: string,
  sku: string,
  body: { delta: number; reason: 'restock' | 'adjustment' | 'damaged'; note?: string }
) =>
  (await request<{ data: { sku: string; stock: number } }>(`/admin/products/${id}/variants/${encodeURIComponent(sku)}/stock`, {
    method: 'POST',
    token,
    body,
  })).data;

export const fetchStockMovements = async (token: string, id: string) =>
  (await request<{ data: StockMovement[] }>(`/admin/products/${id}/stock-movements`, { token })).data;

export const setStaffRole = async (token: string, phone: string, role: Role) =>
  (await request<{ data: User }>('/admin/staff', { method: 'POST', token, body: { phone, role } })).data;

// ---- Rider -------------------------------------------------------------------

export const fetchDeliveries = async (token: string) => (await request<{ data: StaffOrder[] }>('/rider/orders', { token })).data;

export const setDeliveryStatus = async (token: string, orderId: string, status: 'out_for_delivery' | 'delivered') =>
  (await request<{ data: StaffOrder }>(`/rider/orders/${orderId}/status`, { method: 'POST', token, body: { status } })).data;
