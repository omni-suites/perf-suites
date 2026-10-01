import http from 'k6/http';
import { ENV } from '@core/config/env';
import { check } from 'k6';

const BASE_URL = ENV.getBaseUrls().order;

export function createOrder(payload: any) {
  const res = http.post(`${BASE_URL}/orders`, JSON.stringify(payload), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, {
    'order created successfully (201)': (r) => r.status === 201 || r.status === 200,
  });

  return res;
}
