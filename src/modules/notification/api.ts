import http from 'k6/http';
import { ENV } from '@core/config/env';
import { check } from 'k6';

const BASE_URL = ENV.getBaseUrls().notification;

export function getNotifications() {
  const res = http.get(`${BASE_URL}/notifications`);
  check(res, {
    'notifications fetched (200)': (r) => r.status === 200,
  });
  return res;
}
