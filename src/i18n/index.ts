import { getLocales, useLocales } from 'expo-localization';

import { en, type Strings } from '@/i18n/en';
import { vi } from '@/i18n/vi';

export type Language = 'en' | 'vi';

const STRINGS: Record<Language, Strings> = { en, vi };

/** Ngôn ngữ app theo ngôn ngữ máy; ngoài tiếng Việt thì dùng tiếng Anh (mặc định). */
const resolveLanguage = (languageCode: string | null | undefined): Language =>
  languageCode === 'vi' ? 'vi' : 'en';

/** Chuỗi theo ngôn ngữ máy, re-render khi người dùng đổi ngôn ngữ hệ thống. Dùng trong component. */
const useStrings = (): Strings => {
  const [locale] = useLocales();
  return STRINGS[resolveLanguage(locale?.languageCode)];
};

/** Bản không phải hook, cho code ngoài component. */
const getStrings = (): Strings => STRINGS[resolveLanguage(getLocales()[0]?.languageCode)];

export type { Strings };

export { getStrings, resolveLanguage, useStrings };
