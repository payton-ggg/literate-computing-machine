import { getRequestConfig } from "next-intl/server";

export const SUPPORTED_LOCALES = ["en", "ru"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "ru";
export const LOCALE_COOKIE = "castdev-lang";

export default getRequestConfig(async () => {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;

  const locale: Locale =
    cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale as Locale)
      ? (cookieLocale as Locale)
      : DEFAULT_LOCALE;

  // Explicit map required — webpack cannot resolve fully dynamic import paths.
  // Path is relative to this file (src/lib/i18n/) → root messages/ = ../../../messages/
  const messageLoaders: Record<string, () => Promise<{ default: Record<string, unknown> }>> = {
    en: () => import("../../../messages/en.json"),
    ru: () => import("../../../messages/ru.json"),
  };

  const messages = await (messageLoaders[locale] ?? messageLoaders.ru)();

  return {
    locale,
    messages: messages.default,
  };
});
