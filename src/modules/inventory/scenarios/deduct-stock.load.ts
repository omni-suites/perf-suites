import { Options } from 'k6/options';
import { deductStock } from '@modules/inventory/api';
import { getTargetSku } from '@core/data';
import { ENV } from '@core/config/env';

export const options: Options = {
  vus: ENV.DEFAULT_VUS,
  duration: ENV.DEFAULT_DURATION,
};

export default function () {
  deductStock(getTargetSku(), 1);
}
