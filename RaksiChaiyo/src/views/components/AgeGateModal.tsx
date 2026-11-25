import { Modal, Text, View } from 'react-native';
import { useT } from '../../i18n';
import { Button } from './Button';
import { Eyebrow } from './Layout';

type Props = { visible: boolean; onConfirm: () => void; onDecline: () => void };

/** 18+ confirmation before alcohol categories. */
export function AgeGateModal({ visible, onConfirm, onDecline }: Props) {
  const t = useT();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDecline}>
      <View className="flex-1 items-center justify-center bg-black/60 px-6">
        <View className="w-full max-w-[360px] items-center gap-3 rounded-2xl border border-border bg-card p-6">
          <View className="h-16 w-16 items-center justify-center rounded-pill bg-card-2">
            <Text className="font-display text-heading text-accent">18+</Text>
          </View>
          <Eyebrow>{t('age.eyebrow')}</Eyebrow>
          <Text className="text-center font-display text-heading text-text">{t('age.title')}</Text>
          <Text className="text-center font-body text-body text-muted">{t('age.body')}</Text>
          <View className="mt-2 w-full gap-2">
            <Button label={t('age.confirm')} onPress={onConfirm} />
            <Button variant="ghost" label={t('age.decline')} onPress={onDecline} />
          </View>
        </View>
      </View>
    </Modal>
  );
}
