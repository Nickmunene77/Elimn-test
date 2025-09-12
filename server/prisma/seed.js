// server/prisma/seed.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);

  // --- Users ---
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password,
      role: 'ADMIN',
    },
  });

  const user1 = await prisma.user.upsert({
    where: { email: 'user1@example.com' },
    update: {},
    create: {
      email: 'user1@example.com',
      password,
      role: 'USER',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'user2@example.com' },
    update: {},
    create: {
      email: 'user2@example.com',
      password,
      role: 'USER',
    },
  });

  // --- Orders with nested items ---
  await prisma.order.create({
    data: {
      userId: user1.id,
      status: 'PENDING',
      clientToken: 'token-user1-001',
      items: {
        create: [
          { sku: 'SKU-101', qty: 2 },
          { sku: 'SKU-102', qty: 1 },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      userId: user1.id,
      status: 'PAID',
      clientToken: 'token-user1-002',
      items: {
        create: [{ sku: 'SKU-103', qty: 1 }],
      },
    },
  });

  await prisma.order.create({
    data: {
      userId: user2.id,
      status: 'PENDING',
      clientToken: 'token-user2-001',
      items: {
        create: [{ sku: 'SKU-201', qty: 5 }],
      },
    },
  });

  await prisma.order.create({
    data: {
      userId: user2.id,
      status: 'CANCELLED', // ✅ replaced SHIPPED
      clientToken: 'token-user2-002',
      items: {
        create: [
          { sku: 'SKU-202', qty: 3 },
          { sku: 'SKU-203', qty: 2 },
        ],
      },
    },
  });

  console.log('✅ Database seeded with admin, users, and sample orders');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
