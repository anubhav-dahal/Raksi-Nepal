import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { useT } from '../i18n';
import * as staff from '../models/api/staff';
import { toast } from '../models/stores/toastStore';
import { localize } from '../utils/format';
import { errorMessage } from './errors';
import { withAuth } from './orderControllers';
import { useAsync } from './useAsync';

// ---- Photos -------------------------------------------------------------------------

/**
 * Pick a photo from the phone and upload it. Returns the URL path to save
 * (/static/uploads/...), or null if cancelled or it failed (a toast explains).
 */
export const usePhotoUpload = () => {
  const t = useT();
  const [uploading, setUploading] = useState(false);

  const pick = async (aspect: [number, number]): Promise<string | null> => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect,
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return null;

    const asset = result.assets[0];
    const type = asset.mimeType ?? 'image/jpeg';
    const ext = type === 'image/png' ? 'png' : type === 'image/webp' ? 'webp' : 'jpg';
    setUploading(true);
    try {
      return await withAuth((token) =>
        staff.uploadImage(token, { uri: asset.uri, name: asset.fileName ?? `photo.${ext}`, type })
      );
    } catch (e) {
      toast(errorMessage(e, t), 'error');
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { uploading, pick };
};

// ---- Categories ---------------------------------------------------------------------

/** All categories, for pickers. */
export const useCategoryOptions = () => useAsync(() => withAuth(staff.fetchAdminCategories), []);

export const useAdminCategories = () => {
  const categories = useAsync(() => withAuth(staff.fetchAdminCategories), []);
  return {
    categories,
    openNew: () => router.push({ pathname: '/admin/category/[id]', params: { id: 'new' } }),
    open: (id: string) => router.push({ pathname: '/admin/category/[id]', params: { id } }),
  };
};

/** New (id === 'new') or edit a category, and list its products. */
export const useCategoryForm = (id: string) => {
  const t = useT();
  const isNew = id === 'new';
  const categories = useAsync(() => withAuth(staff.fetchAdminCategories), []);
  const products = useAsync(() => (isNew ? Promise.resolve([]) : withAuth(staff.fetchAdminProducts)), [isNew]);
  const existing = categories.data?.find((c) => c.id === id);
  const photo = usePhotoUpload();

  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [alcoholic, setAlcoholic] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!existing) return;
    setName(localize(existing.name));
    setImage(existing.image);
    setAlcoholic(existing.alcoholic);
    setIsActive(existing.isActive);
  }, [existing]);

  const save = async () => {
    if (name.trim().length < 2) return setError(t('admin.nameRequired'));
    setError(undefined);
    setSaving(true);
    try {
      const body = { name: name.trim(), image, alcoholic, isActive };
      if (isNew) {
        const created = await withAuth((token) => staff.createCategory(token, body));
        toast(t('admin.saved'));
        router.replace({ pathname: '/admin/category/[id]', params: { id: created.id } });
      } else {
        await withAuth((token) => staff.updateCategory(token, id, body));
        toast(t('admin.saved'));
        categories.reload();
      }
    } catch (e) {
      toast(errorMessage(e, t), 'error');
    } finally {
      setSaving(false);
    }
  };

  return {
    isNew,
    loading: !isNew && !existing && categories.loading,
    notFound: !isNew && !!categories.data && !existing,
    name,
    setName,
    image,
    alcoholic,
    setAlcoholic,
    isActive,
    setIsActive,
    error,
    saving,
    uploading: photo.uploading,
    changePhoto: async () => {
      const url = await photo.pick([4, 3]);
      if (url) setImage(url);
    },
    save,
    products: (products.data ?? []).filter((p) => p.category.id === id),
    addProduct: () => router.push({ pathname: '/admin/product/new', params: { categoryId: id } }),
    openProduct: (productId: string) => router.push({ pathname: '/admin/product/[id]', params: { id: productId } }),
  };
};

// ---- New product ----------------------------------------------------------------------

export type SizeRow = { label: string; price: string; stock: string };
const emptyRow = (): SizeRow => ({ label: '', price: '', stock: '' });

export const useNewProduct = (preselectedCategoryId?: string) => {
  const t = useT();
  const categories = useAsync(() => withAuth(staff.fetchAdminCategories), []);
  const photo = usePhotoUpload();
  const [categoryId, setCategoryId] = useState(preselectedCategoryId ?? '');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [sizes, setSizes] = useState<SizeRow[]>([emptyRow()]);
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState(false);

  const updateSize = (i: number, field: keyof SizeRow, value: string) =>
    setSizes((rows) => rows.map((r, j) => (j === i ? { ...r, [field]: value } : r)));

  const save = async () => {
    const whole = (v: string) => /^\d+$/.test(v.trim());
    if (!categoryId) return setError(t('admin.chooseCategory'));
    if (name.trim().length < 2) return setError(t('admin.nameRequired'));
    if (!sizes.length || sizes.some((r) => !r.label.trim() || !whole(r.price) || !whole(r.stock))) {
      return setError(t('admin.sizesInvalid'));
    }
    setError(undefined);
    setSaving(true);
    try {
      const product = await withAuth((token) =>
        staff.createProduct(token, {
          categoryId,
          name: name.trim(),
          description: description.trim(),
          image,
          variants: sizes.map((r) => ({ label: r.label.trim(), price: Number(r.price), stock: Number(r.stock) })),
        })
      );
      toast(t('admin.saved'));
      router.replace({ pathname: '/admin/product/[id]', params: { id: product.id } });
    } catch (e) {
      toast(errorMessage(e, t), 'error');
    } finally {
      setSaving(false);
    }
  };

  return {
    categories,
    categoryId,
    setCategoryId,
    name,
    setName,
    description,
    setDescription,
    image,
    uploading: photo.uploading,
    changePhoto: async () => {
      const url = await photo.pick([1, 1]);
      if (url) setImage(url);
    },
    sizes,
    updateSize,
    addSize: () => setSizes((rows) => [...rows, emptyRow()]),
    removeSize: (i: number) => setSizes((rows) => rows.filter((_, j) => j !== i)),
    error,
    saving,
    save,
  };
};
