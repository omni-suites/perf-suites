import http from 'k6/http';
import { ENV } from '@core/config/env';
import { check } from 'k6';
import { CreateOrderPayload } from './payloads';

export function listOrders() {
  const url = `${ENV.getBaseUrls().order}/orders`;
  const res = http.get(url);

  check(res, {
    'orders listed successfully (200)': (r) => r.status === 200,
  });

  return res;
}

export function createOrder(payload: CreateOrderPayload) {
  const url = `${ENV.getBaseUrls().order}/orders`;
  const res = http.post(url, JSON.stringify(payload), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, {
    'order created successfully (200/201)': (r) => r.status === 201 || r.status === 200,
  });

  return res;
}
