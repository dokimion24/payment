'use client';

import { type ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';

import type { CountryCode } from '@/lib/payment/types';
import { getLocaleFromCountry, type Locale } from './config';

import ko from '../../../messages/ko.json';
import en from '../../../messages/en.json';

const messages: Record<Locale, typeof ko> = { ko, en };

interface I18nProviderProps {
  country: CountryCode;
  children: ReactNode;
}

export function I18nProvider({ country, children }: I18nProviderProps) {
  const locale = getLocaleFromCountry(country);

  return (
    <NextIntlClientProvider locale={locale} messages={messages[locale]}>
      {children}
    </NextIntlClientProvider>
  );
}
