// server/src/routes/payments.js
import { Router } from 'express';
import { body, param } from 'express-validator';
import { prisma } from '../db.js';
import config from '../config.js';
import { authRequired } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { verifySignature } from '../utils/hmac.js';
import { cacheInvalidate } from '../middleware/cache.js';
import { paymentWebhooks } from '../metrics.js';
import { withRetry } from '../utils/retry.js';
import {
  ValidationError,
  AuthenticationError,
  AuthorizationError,
} from '../utils/errors.js';

const router = Router();

// POST /payments/initiate - Create payment intent
router.post(
  '/initiate',
  authRequired,
  [
    body('order_id').isInt().withMessage('Order ID must be an integer'),
    validateRequest,
  ],
  async (req, res, next) => {
    try {
      const orderId = parseInt(req.body.order_id);

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) {
        throw new ValidationError('Order not found', 404);
      }

      if (req.user.role !== 'ADMIN' && order.userId !== req.user.id) {
        throw new AuthorizationError('Access to this order is denied');
      }

      if (order.status !== 'PENDING') {
        throw new ValidationError('Only pending orders can be paid');
      }

      const amount = order.items.reduce(
        (total, item) => total + item.qty * 100,
        0
      );

      const payment = await prisma.payment.create({
        data: {
          orderId: order.id,
          amount,
          status: 'INITIATED',
        },
      });

      // Simulate payment provider response
      const redirect_url = `https://payments.example.com/pay/${payment.id}`;

      res.json({
        payment_id: payment.id,
        order_id: order.id,
        amount,
        redirect_url,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /payments/webhook - Payment provider webhook
router.post('/webhook', async (req, res, next) => {
  try {
    const signature = req.headers['x-signature'];
    const secret = config.payment.webhookSecret;

    if (!verifySignature(secret, req.body, signature)) {
      paymentWebhooks.inc({ status: 'invalid_signature' });
      throw new AuthenticationError('Invalid webhook signature');
    }

    const { payment_id, order_id, status } = req.body;

    // Process with retry logic
    const result = await withRetry(
      async () => {
        return await prisma.$transaction(async (tx) => {
          const payment = await tx.payment.findUnique({
            where: { id: payment_id },
            include: { order: true },
          });

          if (!payment) {
            throw new ValidationError('Payment not found');
          }

          const updatedPayment = await tx.payment.update({
            where: { id: payment_id },
            data: { status },
          });

          // Update order status if payment succeeded
          if (status === 'SUCCESS') {
            await tx.order.update({
              where: { id: order_id },
              data: {
                status: 'PAID',
                version: { increment: 1 },
              },
            });
            await cacheInvalidate(`GET:/orders/${order_id}`);
          }

          return updatedPayment;
        });
      },
      {
        maxAttempts: 3,
        backoffMs: 200,
      }
    );

    paymentWebhooks.inc({ status: 'success' });
    res.json({ status: 'processed', payment_status: result.status });
  } catch (error) {
    paymentWebhooks.inc({ status: 'error' });
    next(error);
  }
});

export default router;
