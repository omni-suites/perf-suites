import testUsers from './test-users.json';
import testItems from './test-items.json';

export interface TestUser {
  id: string;
  name: string;
}

export interface TestItem {
  sku: string;
  name: string;
  price: number;
}

export function getRandomUser(): TestUser {
  const users = testUsers as TestUser[];
  return users[Math.floor(Math.random() * users.length)];
}

export function getRandomItem(): TestItem {
  const items = testItems as TestItem[];
  return items[Math.floor(Math.random() * items.length)];
}

export function getRandomSku(): string {
  return getRandomItem().sku;
}

export function getTargetSku(): string {
  return getRandomSku();
}
