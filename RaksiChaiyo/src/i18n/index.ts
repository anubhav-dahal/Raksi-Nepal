import { useCallback } from 'react';
import { usePrefsStore, type Language } from '../models/stores/prefsStore';
import { en, type StringKey } from './en';
import { ne } from './ne';

const dictionaries: Record<Language, Partial<Record<StringKey, string>>> = { en, ne };

export type TFunction = (key: StringKey, vars?: Record<string, string | number>) => string;

export const translate = (language: Language, key: StringKey, vars?: Record<string, string | number>) => {
  const text = dictionaries[language][key] ?? en[key];
  return vars ? text.replace(/\{(\w+)\}/g, (_, name) => String(vars[name] ?? `{${name}}`)) : text;
};

/** t() for the current language. Re-renders when the language changes. */
export const useT = (): TFunction => {
  const language = usePrefsStore((s) => s.language);
  return useCallback((key, vars) => translate(language, key, vars), [language]);
};

export type { StringKey };
