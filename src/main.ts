import { Options, Scenario } from 'k6/options';
import { sleep } from 'k6';
import { deductStock } from '@modules/inventory/api';
import { createOrder } from '@modules/order/api';
import { getNotifications } from '@modules/notification/api';
import { generateOrderPayload } from '@modules/order/payloads';
import { getTargetSku } from '@core/data';
import { ENV } from '@core/config/env';
import { orderCreationTrend, inventoryDeductionTrend, errorRate } from '@core/utils/metrics';

/**
 * ---------------------------------------------------------------------------
 * Scenario Functions (Workout Routines)
 * k6 assigns virtual users to call these functions based on the scenario 'exec'
 * ---------------------------------------------------------------------------
 */

export function runCheckoutFlow() {
  const orderData = generateOrderPayload();

  // 1. Deduct Stock
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

  // 3. Verify Notification
  const notifRes = getNotifications();
  if (notifRes.status !== 200) {
    errorRate.add(1);
  }

  sleep(1);
}

export function runOrderCreate() {
  const payload = generateOrderPayload();
  const res = createOrder(payload);
  if (res.status !== 200 && res.status !== 201) {
    errorRate.add(1);
  }
  sleep(1);
}

export function runInventoryDeduct() {
  const res = deductStock(getTargetSku(), 1);
  if (res.status !== 200 && res.status !== 201) {
    errorRate.add(1);
  }
  sleep(1);
}

export function runNotificationList() {
  const res = getNotifications();
  if (res.status !== 200) {
    errorRate.add(1);
  }
  sleep(1);
}

/**
 * ---------------------------------------------------------------------------
 * Scenario Registry & Dynamic Filtering
 * ---------------------------------------------------------------------------
 */

const scenarioCatalog: Record<string, Scenario> = {
  checkout_flow: {
    executor: 'constant-vus',
    vus: ENV.DEFAULT_VUS,
    duration: ENV.DEFAULT_DURATION,
    exec: 'runCheckoutFlow',
  },
  order_create: {
    executor: 'constant-vus',
    vus: ENV.DEFAULT_VUS,
    duration: ENV.DEFAULT_DURATION,
    exec: 'runOrderCreate',
  },
  inventory_deduct: {
    executor: 'constant-vus',
    vus: ENV.DEFAULT_VUS,
    duration: ENV.DEFAULT_DURATION,
    exec: 'runInventoryDeduct',
  },
  notification_list: {
    executor: 'constant-vus',
    vus: Math.max(2, Math.floor(ENV.DEFAULT_VUS / 2)),
    duration: ENV.DEFAULT_DURATION,
    exec: 'runNotificationList',
  },
};

function resolveActiveScenarios(): Record<string, Scenario> {
  const filter = (ENV.SCENARIO_FILTER || 'all').trim().toLowerCase();

  // If 'all' or empty, run all registered microservice scenarios
  if (!filter || filter === 'all') {
    return scenarioCatalog;
  }

  // Filter down to requested comma-separated scenario names (e.g. SCENARIO=order_create,inventory_deduct)
  const requested = filter.split(',').map((s) => s.trim().toLowerCase());
  const selected: Record<string, Scenario> = {};

  for (const name of requested) {
    if (scenarioCatalog[name]) {
      selected[name] = scenarioCatalog[name];
    } else {
      console.warn(`[k6 warning] Scenario "${name}" requested but not found in catalog.`);
    }
  }

  if (Object.keys(selected).length === 0) {
    console.warn(`[k6 warning] No matching scenarios found for filter "${filter}". Available: ${Object.keys(scenarioCatalog).join(', ')}. Falling back to all.`);
    return scenarioCatalog;
  }

  return selected;
}

export const options: Options = {
  scenarios: resolveActiveScenarios(),
  thresholds: {
    // Realistic cloud staging latency SLA: 95% under 1500ms
    http_req_duration: ['p(95)<1500'],
    // Error rate must stay below 5%
    errors: ['rate<0.05'],
  },
};

// Default export as fallback if single execution without scenarios is invoked
export default function () {
  runCheckoutFlow();
}
