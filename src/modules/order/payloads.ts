export function generateOrderPayload() {
  return {
    itemId: 'item-123', // Static for now, could be randomized
    quantity: Math.floor(Math.random() * 5) + 1,
    customerId: `user_${Math.floor(Math.random() * 1000)}`,
  };
}
