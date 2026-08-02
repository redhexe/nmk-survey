import en from '@/locales/en.json';
import ko from '@/locales/ko.json';
import zh from '@/locales/zh.json';
import ja from '@/locales/ja.json';
import es from '@/locales/es.json';
import fr from '@/locales/fr.json';

import isoCountries from 'i18n-iso-countries';
import enCountries from 'i18n-iso-countries/langs/en.json';
import koCountries from 'i18n-iso-countries/langs/ko.json';
import zhCountries from 'i18n-iso-countries/langs/zh.json';
import jaCountries from 'i18n-iso-countries/langs/ja.json';
import esCountries from 'i18n-iso-countries/langs/es.json';
import frCountries from 'i18n-iso-countries/langs/fr.json';

// 국가 이름 다국어 초기화
isoCountries.registerLocale(enCountries);
isoCountries.registerLocale(koCountries);
isoCountries.registerLocale(zhCountries);
isoCountries.registerLocale(jaCountries);
isoCountries.registerLocale(esCountries);
isoCountries.registerLocale(frCountries);

export const getCountries = (lang: string) => {
  const langMap: Record<string, string> = {
    en: 'en',
    ko: 'ko',
    zh: 'zh',
    ja: 'ja',
    es: 'es',
    fr: 'fr'
  };
  const targetLang = langMap[lang] || 'en';
  const countriesObj = isoCountries.getNames(targetLang, { select: 'official' });
  
  return Object.entries(countriesObj).map(([code, name]) => ({
    value: code,
    label: name
  })).sort((a, b) => a.label.localeCompare(b.label));
};

export const translations: Record<string, any> = {
  en,
  ko,
  zh,
  ja,
  es,
  fr
};
