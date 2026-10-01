import { Options } from 'k6/options';
import { createOrder } from '@modules/order/api';
import { generateOrderPayload } from '@modules/order/payloads';
import { ENV } from '@core/config/env';

export const options: Options = {
  vus: ENV.DEFAULT_VUS,
  duration: ENV.DEFAULT_DURATION,
};

export default function () {
  createOrder(generateOrderPayload());
}
