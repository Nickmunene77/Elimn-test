// server/src/routes/auth.js
import { Router } from 'express';
import { body } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';
import config from '../config.js';
import { authAttempts } from '../metrics.js';
import { validateRequest } from '../middleware/validation.js';
import { AuthenticationError, ValidationError } from '../utils/errors.js';

const router = Router();

// POST /auth/signup
router.post(
  '/signup',
  [
    body('email').isEmail().normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
    body('role').optional().isIn(['ADMIN', 'USER']),
    validateRequest,
  ],
  async (req, res, next) => {
    try {
      const { email, password, role = 'USER' } = req.body;

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        throw new ValidationError('Email already registered');
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: role === 'ADMIN' ? 'ADMIN' : 'USER',
        },
        select: { id: true, email: true, role: true, createdAt: true },
      });

      authAttempts.inc({ type: 'signup', status: 'success' });
      res.status(201).json(user);
    } catch (error) {
      authAttempts.inc({ type: 'signup', status: 'error' });
      next(error);
    }
  }
);

// POST /auth/login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').exists().withMessage('Password is required'),
    validateRequest,
  ],
  async (req, res, next) => {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        authAttempts.inc({ type: 'login', status: 'invalid_credentials' });
        throw new AuthenticationError('Invalid email or password');
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        authAttempts.inc({ type: 'login', status: 'invalid_credentials' });
        throw new AuthenticationError('Invalid email or password');
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        config.jwt.secret,
        { algorithm: 'HS256', expiresIn: config.jwt.expiresIn }
      );

      authAttempts.inc({ type: 'login', status: 'success' });
      res.json({
        token,
        user: { id: user.id, email: user.email, role: user.role },
      });
    } catch (error) {
      authAttempts.inc({ type: 'login', status: 'error' });
      next(error);
    }
  }
);

export default router;
