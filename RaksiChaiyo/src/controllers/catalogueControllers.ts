import { router } from 'expo-router';
import { useState } from 'react';
import { fetchCategories, fetchProduct, fetchProducts } from '../models/api/catalogue';
import { usePrefsStore } from '../models/stores/prefsStore';
import type { Category } from '../models/types';
import { useAsync } from './useAsync';

/** Home: categories + the 18+ gate before opening an alcoholic category. */
export const useHomeController = () => {
  const categories = useAsync(fetchCategories, []);
  const ageConfirmed = usePrefsStore((s) => s.ageConfirmed);
  const confirmAge = usePrefsStore((s) => s.confirmAge);
  const [pendingCategory, setPendingCategory] = useState<Category | null>(null);

  const go = (category: Category) =>
    router.push({ pathname: '/category/[slug]', params: { slug: category.slug } });

  const openCategory = (category: Category) => {
    if (category.alcoholic && !ageConfirmed) setPendingCategory(category);
    else go(category);
  };

  const confirmAndOpen = () => {
    confirmAge();
    const category = pendingCategory;
    setPendingCategory(null);
    if (category) go(category);
  };

  return {
    categories,
    openCategory,
    ageGate: {
      visible: pendingCategory !== null,
      confirm: confirmAndOpen,
      decline: () => setPendingCategory(null),
    },
  };
};

/** Product list for one category. Category info comes from the categories call. */
export const useCategoryController = (slug: string) => {
  const products = useAsync(() => fetchProducts(slug), [slug]);
  const categories = useAsync(fetchCategories, []);
  const category = categories.data?.find((c) => c.slug === slug);

  return {
    category,
    products,
    openProduct: (id: string) => router.push({ pathname: '/product/[id]', params: { id } }),
  };
};

export const useProductQuery = (id: string) => useAsync(() => fetchProduct(id), [id]);
