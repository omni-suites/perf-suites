import http from 'k6/http';
import { ENV } from '@core/config/env';
import { check } from 'k6';

export function listInventory() {
  const url = `${ENV.getBaseUrls().inventory}/inventory`;
  const res = http.get(url);

  check(res, {
    'inventory listed successfully (200)': (r) => r.status === 200,
  });

  return res;
}

export function deductStock(sku: string, quantity: number) {
  const url = `${ENV.getBaseUrls().inventory}/inventory/deduct`;
  const payload = { sku, quantity };
  const res = http.post(url, JSON.stringify(payload), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, {
    'stock deducted successfully (200/201)': (r) => r.status === 200 || r.status === 201,
  });

  return res;
}
