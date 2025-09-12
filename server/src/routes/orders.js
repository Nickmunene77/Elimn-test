// server/src/routes/orders.js
import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { prisma } from '../db.js';
import { authRequired } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/rbac.js';
import { validateRequest } from '../middleware/validation.js';
import { ordersCreated } from '../metrics.js';
import {
  ValidationError,
  ConflictError,
  AuthorizationError,
} from '../utils/errors.js';

const router = Router();

/**
 * POST /orders - Create order with idempotency
 */
router.post(
  '/',
  authRequired,
  [
    body('items')
      .isArray({ min: 1 })
      .withMessage('At least one item is required'),
    body('items.*.sku')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('SKU is required'),
    body('items.*.qty')
      .isInt({ min: 1 })
      .toInt()
      .withMessage('Quantity must be at least 1'),
    body('client_token')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Client token is required'),
    validateRequest,
  ],
  async (req, res, next) => {
    try {
      const { items, client_token } = req.body;

      // Idempotency check
      const existingOrder = await prisma.order.findFirst({
        where: { userId: req.user.id, clientToken: client_token },
        include: { items: true },
      });

      if (existingOrder) {
        return res.json(existingOrder);
      }

      // Create new order
      const order = await prisma.order.create({
        data: {
          userId: req.user.id,
          clientToken: client_token,
          status: 'PENDING',
          items: {
            create: items.map((item) => ({
              sku: item.sku,
              qty: item.qty,
            })),
          },
        },
        include: { items: true },
      });

      ordersCreated.inc({ status: order.status });
      res.status(201).json(order);
    } catch (error) {
      if (error.code === 'P2002') {
        const existingOrder = await prisma.order.findFirst({
          where: { userId: req.user.id, clientToken: req.body.client_token },
          include: { items: true },
        });
        return res.json(existingOrder);
      }
      next(error);
    }
  }
);

/**
 * GET /orders - List orders with pagination and search
 */
router.get(
  '/',
  authRequired,
  [
    query('status').optional().isIn(['PENDING', 'PAID', 'CANCELLED']),
    query('q').optional().isString().trim(),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    validateRequest,
  ],
  async (req, res, next) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const { status, q } = req.query;

      const whereBase =
        req.user.role === 'ADMIN' ? {} : { userId: req.user.id };

      const where = {
        AND: [
          whereBase,
          status ? { status } : {},
          q
            ? { items: { some: { sku: { contains: q, mode: 'insensitive' } } } }
            : {},
        ],
      };

      const [total, orders] = await Promise.all([
        prisma.order.count({ where }),
        prisma.order.findMany({
          where,
          include: { items: true },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
      ]);

      res.json({
        data: orders,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /orders/:id - Get order details
 */
router.get(
  '/:id',
  authRequired,
  [
    param('id').isInt().withMessage('Order ID must be an integer').toInt(),
    validateRequest,
  ],
  async (req, res, next) => {
    try {
      const orderId = parseInt(req.params.id);

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

      res.json(order);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PATCH /orders/:id/status - Update order status with optimistic locking
 */
router.patch(
  '/:id/status',
  authRequired,
  requireAdmin,
  [
    param('id').isInt().withMessage('Order ID must be an integer').toInt(),
    body('status')
      .isIn(['PENDING', 'PAID', 'CANCELLED'])
      .withMessage('Invalid status'),
    body('version')
      .isInt({ min: 1 })
      .toInt()
      .withMessage('Version must be a positive integer'),
    validateRequest,
  ],
  async (req, res, next) => {
    try {
      const orderId = parseInt(req.params.id);
      const { status, version } = req.body;

      const order = await prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        throw new ValidationError('Order not found', 404);
      }

      if (order.version !== version) {
        throw new ConflictError('Order has been modified by another process');
      }

      const updatedOrder = await prisma.order.update({
        where: {
          id: orderId,
          version, // optimistic lock
        },
        data: {
          status,
          version: { increment: 1 },
        },
        include: { items: true },
      });

      res.json(updatedOrder);
    } catch (error) {
      if (error.code === 'P2025') {
        throw new ConflictError('Order has been modified by another process');
      }
      next(error);
    }
  }
);

export default router;
