import { useT, type StringKey } from '../../i18n';
import type { OrderStatus } from '../../models/types';
import { Badge } from './Badge';

// Colours from design/component-inventory.md (Badge: order status).
const tone = {
  pending: 'warning',
  confirmed: 'warning',
  preparing: 'warning',
  out_for_delivery: 'accent',
  delivered: 'success',
  cancelled: 'error',
  payment_failed: 'error',
} as const;

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const t = useT();
  return <Badge tone={tone[status]} label={t(`status.${status}` as StringKey)} />;
}
