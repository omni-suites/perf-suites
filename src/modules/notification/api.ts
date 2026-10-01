import http from 'k6/http';
import { ENV } from '@core/config/env';
import { check } from 'k6';

export function getNotifications() {
  const url = `${ENV.getBaseUrls().notification}/notifications`;
  const res = http.get(url);

  check(res, {
    'notifications fetched (200)': (r) => r.status === 200,
  });

  return res;
}

export function sendNotification(recipient: string, message: string, channel?: string) {
  const url = `${ENV.getBaseUrls().notification}/notifications`;
  const payload = { recipient, message, channel: channel || 'email' };
  const res = http.post(url, JSON.stringify(payload), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, {
    'notification sent (200/201)': (r) => r.status === 200 || r.status === 201,
  });

  return res;
}
