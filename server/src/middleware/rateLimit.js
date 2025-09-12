// server/src/middleware/rateLimit.js
import rateLimit from 'express-rate-limit';
import config from '../config.js';

// General rate limiter for all requests
export const generalRateLimiter = rateLimit({
  windowMs: config.rateLimit?.windowMs || 15 * 60 * 1000, // 15 minutes
  max: config.rateLimit?.max || 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'RateLimitExceeded',
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// stricter limiter for authentication endpoints
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: {
    error: 'RateLimitExceeded',
    message: 'Too many login attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for order creation
export const createOrderRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 order creations per minute
  message: {
    error: 'RateLimitExceeded',
    message: 'Too many order creation attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
