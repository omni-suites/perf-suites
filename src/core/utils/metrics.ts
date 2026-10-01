import { Trend, Rate } from 'k6/metrics';

export const orderCreationTrend = new Trend('order_creation_time');
export const inventoryDeductionTrend = new Trend('inventory_deduction_time');
export const errorRate = new Rate('errors');
