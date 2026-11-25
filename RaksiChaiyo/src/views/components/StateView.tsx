import { Text, View } from 'react-native';
import { errorMessage } from '../../controllers/errors';
import { useT } from '../../i18n';
import { useColors } from '../theme';
import { Button } from './Button';
import { Icon, type IconName } from './Icon';

/** Skeleton block for loading states. */
export function Skeleton({ className = '' }: { className?: string }) {
  return <View className={`rounded-xl bg-card opacity-70 ${className}`} />;
}

type EmptyProps = { icon?: IconName; title: string; hint?: string; actionLabel?: string; onAction?: () => void };

/** Empty state (component inventory #13). */
export function EmptyState({ icon = 'box', title, hint, actionLabel, onAction }: EmptyProps) {
  const colors = useColors();
  return (
    <View className="flex-1 items-center justify-center gap-3 px-8 py-16">
      <View className="h-16 w-16 items-center justify-center rounded-pill bg-card">
        <Icon name={icon} size={28} color={colors.muted} />
      </View>
      <Text className="text-center font-heading text-[17px] text-text">{title}</Text>
      {hint ? <Text className="text-center font-body text-body text-muted">{hint}</Text> : null}
      {actionLabel && onAction ? <Button variant="ghost" label={actionLabel} onPress={onAction} /> : null}
    </View>
  );
}

/** Error state with retry (component inventory #13). */
export function ErrorState({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  const t = useT();
  const colors = useColors();
  return (
    <View className="flex-1 items-center justify-center gap-3 px-8 py-16">
      <Icon name="alert" size={36} color={colors.muted} />
      <Text className="text-center font-heading text-[17px] text-text">{t('common.error')}</Text>
      <Text className="text-center font-body text-body text-muted">{errorMessage(error, t)}</Text>
      <Button variant="secondary" icon="refresh" label={t('common.retry')} onPress={onRetry} />
    </View>
  );
}
