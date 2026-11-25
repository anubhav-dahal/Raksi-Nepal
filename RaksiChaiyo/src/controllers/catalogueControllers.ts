import { router } from 'expo-router';
import { useState } from 'react';
import { fetchCategories, fetchProduct, fetchProducts } from '../models/api/catalogue';
import { useT } from '../i18n';
import { useCartStore } from '../models/stores/cartStore';
import { usePrefsStore } from '../models/stores/prefsStore';
import { toast } from '../models/stores/toastStore';
import type { Category, Product } from '../models/types';
import { localize } from '../utils/format';
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
  const t = useT();
  const products = useAsync(() => fetchProducts(slug), [slug]);
  const categories = useAsync(fetchCategories, []);
  const category = categories.data?.find((c) => c.slug === slug);
  const addToCart = useCartStore((s) => s.add);

  /** The card's + button: one of the first in-stock size. */
  const quickAdd = (product: Product) => {
    const variant = product.variants.find((v) => v.stock > 0);
    if (!variant) return;
    const inCart = useCartStore.getState().items.find((i) => i.sku === variant.sku)?.quantity ?? 0;
    if (inCart >= variant.stock) {
      toast(t('product.maxReached', { count: variant.stock }), 'error');
      return;
    }
    addToCart({
      productId: product.id,
      sku: variant.sku,
      name: localize(product.name),
      label: variant.label,
      image: product.image,
      price: variant.price,
      quantity: 1,
      maxQuantity: variant.stock,
    });
    toast(t('product.added', { name: localize(product.name) }));
  };

  return {
    category,
    products,
    quickAdd,
    openProduct: (id: string) => router.push({ pathname: '/product/[id]', params: { id } }),
  };
};

export const useProductQuery = (id: string) => useAsync(() => fetchProduct(id), [id]);
