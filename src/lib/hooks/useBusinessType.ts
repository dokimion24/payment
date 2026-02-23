'use client';

import { useCallback, useSyncExternalStore } from 'react';

import type { BusinessType } from '../payment/types';

const STORAGE_KEY = 'businessType';
const DEFAULT_VALUE: BusinessType = 'NONE';

// 브라우저 외 환경(SSR)에서 안전하게 동작하도록 분리
function getSnapshot(): BusinessType {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'INDIVIDUAL' || stored === 'CORPORATE' || stored === 'NONE') {
    return stored;
  }
  return DEFAULT_VALUE;
}

function getServerSnapshot(): BusinessType {
  return DEFAULT_VALUE;
}

// storage 이벤트를 통한 탭 간 동기화 지원
function subscribe(callback: () => void) {
  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback();
  };
  window.addEventListener('storage', handler);
  return () => window.removeEventListener('storage', handler);
}

export function useBusinessType() {
  const businessType = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setBusinessType = useCallback((type: BusinessType) => {
    localStorage.setItem(STORAGE_KEY, type);
    // 같은 탭 내에서도 리렌더링을 위해 storage 이벤트를 수동 발생
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY }));
  }, []);

  return { businessType, setBusinessType } as const;
}
