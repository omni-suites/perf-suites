import { Options } from 'k6/options';
import { sleep } from 'k6';
import { deductStock } from '@modules/inventory/api';
import { createOrder } from '@modules/order/api';
import { getNotifications } from '@modules/notification/api';
import { generateOrderPayload } from '@modules/order/payloads';
import { orderCreationTrend, inventoryDeductionTrend, errorRate } from '@core/utils/metrics';
import { ENV } from '@core/config/env';

export const options: Options = {
  scenarios: {
    checkout_flow_load: {
      executor: 'constant-vus',
      vus: ENV.DEFAULT_VUS,
      duration: ENV.DEFAULT_DURATION,
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500'], 
    errors: ['rate<0.01'], // less than 1% errors
  },
};

export default function () {
  const orderData = generateOrderPayload();

  // 1. Check/Deduct Inventory
  const startTimeInv = new Date().getTime();
  const inventoryRes = deductStock(orderData.itemId, orderData.quantity);
  inventoryDeductionTrend.add(new Date().getTime() - startTimeInv);

  if (inventoryRes.status !== 200 && inventoryRes.status !== 201) {
    errorRate.add(1);
    return;
  }

  // 2. Create Order
  const startTimeOrd = new Date().getTime();
  const orderRes = createOrder(orderData);
  orderCreationTrend.add(new Date().getTime() - startTimeOrd);

  if (orderRes.status !== 200 && orderRes.status !== 201) {
    errorRate.add(1);
    return;
  }

  // 3. Verify Notification (Simulating UI polling or checking)
  const notifRes = getNotifications();
  if (notifRes.status !== 200) {
    errorRate.add(1);
  }

  sleep(1);
}
