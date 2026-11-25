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

export type Role = 'customer' | 'admin' | 'rider';

export type Address = {
  name: string;
  phone: string;
  address: string;
  landmark?: string;
  note?: string;
};

export type User = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: Role;
  lastAddress: Address | null;
};

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'payment_failed';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'cod' | 'esewa';

export type OrderLine = {
  product: string;
  sku: string;
  name: string;
  label: string;
  image: string;
  price: number;
  quantity: number;
  lineTotal: number;
};

export type QuoteProblem = { sku: string; code: 'NOT_AVAILABLE' | 'OUT_OF_STOCK'; available?: number; message: string };

export type Quote = {
  items: OrderLine[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  problems: QuoteProblem[];
};

export type Order = {
  id: string;
  orderNumber: string;
  user: string;
  items: OrderLine[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  address: Address;
  status: OrderStatus;
  statusHistory: { status: OrderStatus; at: string; note?: string }[];
  payment: { method: PaymentMethod; status: PaymentStatus; reference?: string | null; paidAt?: string | null };
  rider: { id: string; name: string; phone: string } | null;
  createdAt: string;
  updatedAt: string;
};

/** Orders as staff see them: the customer is populated. */
export type StaffOrder = Omit<Order, 'user'> & { user: { id: string; name: string; phone: string } };

export type AdminSummary = {
  active: Partial<Record<OrderStatus, number>>;
  todayOrders: number;
  todayRevenue: number;
  lowStockProducts: number;
  awaitingPayment: number;
};

export type Rider = User & { activeOrders: number };

export type AdminCategory = Category & { isActive: boolean; productCount: number };

export type AdminProduct = Omit<Product, 'category'> & {
  category: { id: string; name: Localized; slug: string };
  isActive: boolean;
};

export type StockReason = 'order' | 'order_cancelled' | 'restock' | 'adjustment' | 'damaged';

export type StockMovement = {
  id: string;
  sku: string;
  delta: number;
  stockAfter: number;
  reason: StockReason;
  note: string;
  by: { id: string; name: string; role: Role } | null;
  order: { id: string; orderNumber: string } | null;
  createdAt: string;
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
