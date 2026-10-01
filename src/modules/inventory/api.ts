import http from 'k6/http';
import { ENV } from '@core/config/env';
import { check } from 'k6';

const BASE_URL = ENV.getBaseUrls().inventory;

export function deductStock(itemId: string, quantity: number) {
  const payload = { itemId, quantity };
  const res = http.post(`${BASE_URL}/inventory/deduct`, JSON.stringify(payload), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, {
    'stock deducted successfully (200/201)': (r) => r.status === 200 || r.status === 201,
  });

  return res;
}
