import type { BaseLocale, ImportedLocales, Scopes } from 'international-types';
import { createT } from '../../common/create-t';
import type { I18nServerConfig, LocaleContext } from '../../types';
import { getLocaleCache } from './get-locale-cache';
import { flattenLocale } from '../../common/flatten-locale';

export function createGetScopedI18n<Locales extends ImportedLocales, Locale extends BaseLocale>(
  locales: Locales,
  config: I18nServerConfig,
) {
  const localeCache = new Map<string, ReturnType<typeof createT<Locale, undefined>>>();

  return async function getScopedI18n<Scope extends Scopes<Locale>>(scope: Scope) {
    const locale = getLocaleCache();
    const cacheKey = `${locale}-${scope}`;
    const cached = localeCache.get(cacheKey);

    if (cached) {
      return cached;
    }

    const localeFn = createT(
      {
        localeContent: flattenLocale((await locales[locale]()).default),
        fallbackLocale: config.fallbackLocale ? flattenLocale(config.fallbackLocale) : undefined,
        locale,
      } as LocaleContext<Locale>,
      scope,
    );

    localeCache.set(cacheKey, localeFn);

    return localeFn;
  };
}
