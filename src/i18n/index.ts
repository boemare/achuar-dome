import { es } from './es';

export type Translations = typeof es;
export type TranslationKey = keyof Translations;

const translations: Translations = es;

export function t<K extends TranslationKey>(
  key: K,
  ...args: Translations[K] extends (...params: infer P) => any ? P : []
): string {
  const value = translations[key];
  if (typeof value === 'function') {
    return (value as (...params: any[]) => string)(...args);
  }
  return value as string;
}
