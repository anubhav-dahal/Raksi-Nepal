// Shapes of the data the API returns. Keep in sync with backend/README.md.

export type Localized = { en: string; ne?: string };

export type Category = {
  id: string;
  slug: string;
  name: Localized;
  subtitle: Localized;
  image: string;
  alcoholic: boolean;
  sortOrder: number;
};

export type Variant = {
  id: string;
  sku: string;
  label: string;
  /** Whole NPR */
  price: number;
  stock: number;
};

export type Product = {
  id: string;
  slug: string;
  name: Localized;
  description: Localized;
  /** Category id, or the populated category on the detail endpoint */
  category: string | Pick<Category, 'id' | 'slug' | 'name' | 'alcoholic'>;
  image: string;
  alcoholic: boolean;
  variants: Variant[];
};

export type CartItem = {
  productId: string;
  sku: string;
  name: string;
  label: string;
  image: string;
  /** Whole NPR, as last seen in the catalogue. The server recalculates at checkout. */
  price: number;
  quantity: number;
  /** Stock when the item was added; caps the quantity stepper. */
  maxQuantity: number;
};
