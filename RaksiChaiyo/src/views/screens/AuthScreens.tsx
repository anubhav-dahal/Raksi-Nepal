import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, Text, View } from 'react-native';
import { useLoginController, useRegisterController } from '../../controllers/authController';
import { useT } from '../../i18n';
import { AppHeader } from '../components/AppHeader';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Eyebrow, Screen } from '../components/Layout';
import { Logo } from '../components/Logo';

function AuthLayout({ eyebrow, title, body, children }: { eyebrow: string; title: string; body: string; children: ReactNode }) {
  return (
    <Screen>
      <AppHeader back showCart={false} />
      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <ScrollView contentContainerClassName="gap-4 px-6 pb-10" keyboardShouldPersistTaps="handled">
          <View className="items-center gap-2">
            <Logo size={64} />
            <Eyebrow>{eyebrow}</Eyebrow>
            <Text className="text-center font-display text-heading text-text">{title}</Text>
            <Text className="text-center font-body text-body text-muted">{body}</Text>
          </View>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <View className="rounded-md border border-error bg-error/10 p-3">
      <Text className="font-body text-label text-error">{message}</Text>
    </View>
  );
}

export function LoginScreen() {
  const t = useT();
  const c = useLoginController();
  return (
    <AuthLayout eyebrow={t('auth.loginEyebrow')} title={t('auth.loginTitle')} body={t('auth.loginBody')}>
      <FormError message={c.errors.form} />
      <Input label={t('auth.phone')} type="phone" placeholder="98XXXXXXXX" value={c.phone} onChangeText={c.setPhone} error={c.errors.phone} />
      <Input
        label={t('auth.password')}
        type="password"
        value={c.password}
        onChangeText={c.setPassword}
        error={c.errors.password}
        returnKeyType="go"
        onSubmitEditing={c.submit}
      />
      <Button label={t('auth.login')} loading={c.submitting} onPress={c.submit} />
      <Pressable onPress={c.goRegister} className="items-center py-2">
        <Text className="font-body-bold text-label text-accent">{t('auth.noAccount')}</Text>
      </Pressable>
    </AuthLayout>
  );
}

export function RegisterScreen() {
  const t = useT();
  const c = useRegisterController();
  return (
    <AuthLayout eyebrow={t('auth.registerEyebrow')} title={t('auth.registerTitle')} body={t('auth.registerBody')}>
      <FormError message={c.errors.form} />
      <Input label={t('auth.name')} value={c.name} onChangeText={c.setName} error={c.errors.name} autoComplete="name" />
      <Input label={t('auth.phone')} type="phone" placeholder="98XXXXXXXX" value={c.phone} onChangeText={c.setPhone} error={c.errors.phone} />
      <Input label={t('auth.email')} type="email" value={c.email} onChangeText={c.setEmail} error={c.errors.email} />
      <Input
        label={t('auth.password')}
        type="password"
        hint={t('auth.passwordHint')}
        value={c.password}
        onChangeText={c.setPassword}
        error={c.errors.password}
        autoComplete="new-password"
      />
      <Button label={t('auth.register')} loading={c.submitting} onPress={c.submit} />
      <Pressable onPress={c.goLogin} className="items-center py-2">
        <Text className="font-body-bold text-label text-accent">{t('auth.haveAccount')}</Text>
      </Pressable>
    </AuthLayout>
  );
}
