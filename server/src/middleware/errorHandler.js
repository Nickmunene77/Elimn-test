// server/src/middleware/errorHandler.js
import { logger } from '../logger.js';

export function errorHandler(err, req, res, next) {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  // Custom error handling
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: err.errorCode || 'Error',
      message: err.message,
      ...(err.details && { details: err.details }),
    });
  }

  // Default error
  res.status(500).json({
    error: 'InternalServerError',
    message:
      process.env.NODE_ENV === 'development'
        ? err.message
        : 'Internal server error',
  });
}
