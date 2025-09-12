// server/tests/helpers.js
import { prisma } from '../src/db.js';

export async function clearDatabase() {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('clearDatabase should only be used in test environment');
  }

  const tables = [
    'WebhookEvent',
    'Payment', 
    'OrderItem',
    'Order',
    'RefreshToken',
    'User',
  ];

  // Using raw SQL for faster cleanup in tests
  for (const table of tables) {
    await prisma.$executeRawUnsafe(`DELETE FROM "${table}"`);
  }
}

export async function createTestUser(userData = {}) {
  return prisma.user.create({
    data: {
      email: userData.email || `test${Date.now()}@example.com`,
      password: '$2b$12$K3V/BT.6UZ7a6V7a8N9ZzO', // pre-hashed "password"
      role: userData.role || 'USER',
    },
  });
}