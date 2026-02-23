import type { CountryCode } from '@/lib/payment/types';

export type Locale = 'ko' | 'en';

export function getLocaleFromCountry(country: CountryCode): Locale {
  return country === 'KR' ? 'ko' : 'en';
}
