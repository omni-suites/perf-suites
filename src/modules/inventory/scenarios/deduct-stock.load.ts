import { Options } from 'k6/options';
import { deductStock } from '@modules/inventory/api';

export const options: Options = {
  vus: 50,
  duration: '1m',
};

export default function () {
  deductStock('item-123', 1);
}
