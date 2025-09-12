// server/src/db.js
import { PrismaClient } from '@prisma/client';

// I'm creating a singleton Prisma client instance
// This ensures we don't create multiple connections
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// Connection handling - important for production readiness
prisma.$connect().catch((error) => {
  console.error('Database connection error:', error);
  process.exit(1);
});

// Cleanup on exit - prevents connection leaks
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export { prisma };