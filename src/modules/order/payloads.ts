import { getTargetSku, getRandomUser } from '@core/data';

export interface CreateOrderPayload {
  itemId: string;
  quantity: number;
  customerId?: string;
}

export function generateOrderPayload(customSku?: string, quantity?: number): CreateOrderPayload {
  const user = getRandomUser();
  return {
    itemId: customSku || getTargetSku(),
    quantity: quantity || Math.floor(Math.random() * 5) + 1,
    customerId: user ? user.id : `user_${Math.floor(Math.random() * 1000)}`,
  };
}
