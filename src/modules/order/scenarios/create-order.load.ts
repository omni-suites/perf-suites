import { Options } from 'k6/options';
import { createOrder } from '@modules/order/api';
import { generateOrderPayload } from '@modules/order/payloads';

export const options: Options = {
  vus: 50,
  duration: '1m',
};

export default function () {
  createOrder(generateOrderPayload());
}
