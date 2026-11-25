import { router } from 'expo-router';
import { useState } from 'react';
import { useT } from '../i18n';
import { ApiError } from '../models/api/client';
import { useAuthStore } from '../models/stores/authStore';
import { toast } from '../models/stores/toastStore';
import { isValidPhone, normalizePhone } from '../utils/phone';
import { errorMessage } from './errors';

export { PHONE_PATTERN } from '../utils/phone';

type Errors = Partial<Record<'name' | 'phone' | 'email' | 'password' | 'form', string>>;

/** Map API validation details (body.phone ...) onto form fields. */
const fieldErrors = (e: unknown): Errors => {
  if (!(e instanceof ApiError) || !e.details) return {};
  const out: Errors = {};
  for (const d of e.details) {
    const field = d.field.replace(/^body\./, '') as keyof Errors;
    out[field] = d.message;
  }
  return out;
};

/** After login/register: go back to where the user came from (e.g. checkout). */
const leave = () => (router.canGoBack() ? router.back() : router.replace('/'));

export const useLoginController = () => {
  const t = useT();
  const login = useAuthStore((s) => s.login);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    const next: Errors = {};
    if (!isValidPhone(phone)) next.phone = t('auth.phoneInvalid');
    if (!password) next.password = t('auth.passwordRequired');
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      const user = await login(normalizePhone(phone), password);
      toast(t('auth.welcome', { name: user.name.split(' ')[0] }));
      leave();
    } catch (e) {
      setErrors({ ...fieldErrors(e), form: errorMessage(e, t) });
    } finally {
      setSubmitting(false);
    }
  };

  return {
    phone,
    setPhone,
    password,
    setPassword,
    errors,
    submitting,
    submit,
    goRegister: () => router.replace('/register'),
  };
};

export const useRegisterController = () => {
  const t = useT();
  const register = useAuthStore((s) => s.register);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    const next: Errors = {};
    if (name.trim().length < 2) next.name = t('auth.nameRequired');
    if (!isValidPhone(phone)) next.phone = t('auth.phoneInvalid');
    if (email && !/^\S+@\S+\.\S+$/.test(email.trim())) next.email = t('auth.emailInvalid');
    if (password.length < 8) next.password = t('auth.passwordShort');
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    try {
      const user = await register({
        name: name.trim(),
        phone: normalizePhone(phone),
        email: email.trim() || undefined,
        password,
      });
      toast(t('auth.welcome', { name: user.name.split(' ')[0] }));
      leave();
    } catch (e) {
      setErrors({ ...fieldErrors(e), form: errorMessage(e, t) });
    } finally {
      setSubmitting(false);
    }
  };

  return {
    name,
    setName,
    phone,
    setPhone,
    email,
    setEmail,
    password,
    setPassword,
    errors,
    submitting,
    submit,
    goLogin: () => router.replace('/login'),
  };
};
