import { ActivityIndicator, Pressable, Switch, Text, View } from 'react-native';
import { useT } from '../../i18n';
import { status, useColors } from '../theme';
import { Icon } from './Icon';
import { ProductImage } from './ProductImage';

type PhotoFieldProps = {
  image: string;
  name: string;
  uploading: boolean;
  onPress: () => void;
  /** "wide" for category photos (shown as tiles/banners), "square" for products. */
  shape?: 'wide' | 'square';
};

/** Shows the current photo with an Add/Change button; tapping picks and uploads a new one. */
export function PhotoField({ image, name, uploading, onPress, shape = 'square' }: PhotoFieldProps) {
  const t = useT();
  return (
    <Pressable
      onPress={onPress}
      disabled={uploading}
      accessibilityRole="button"
      accessibilityLabel={image ? t('admin.changePhoto') : t('admin.addPhoto')}
      className={`overflow-hidden rounded-xl border border-border bg-card-2 ${shape === 'wide' ? 'h-[170px]' : 'h-[200px]'}`}
    >
      {image ? <ProductImage src={image} name={name || '?'} fit={shape === 'wide' ? 'cover' : 'contain'} /> : null}
      <View className={`absolute inset-0 items-center justify-center ${image ? 'bg-black/25' : ''}`}>
        <View className="flex-row items-center gap-2 rounded-pill bg-black/55 px-4 py-2.5">
          {uploading ? <ActivityIndicator color="#ffffff" /> : <Icon name={image ? 'refresh' : 'plus'} size={16} color="#ffffff" />}
          <Text className="font-body-bold text-label text-white">
            {uploading ? t('admin.uploading') : image ? t('admin.changePhoto') : t('admin.addPhoto')}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

/** A label with an on/off switch. */
export function SwitchRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  const colors = useColors();
  return (
    <View className="flex-row items-center justify-between rounded-md border border-border bg-card px-4 py-3">
      <Text className="font-body-semibold text-body text-text">{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.card2, true: colors.accent }}
        thumbColor={status.onAccent}
      />
    </View>
  );
}
