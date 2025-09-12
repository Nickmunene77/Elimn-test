// server/src/middleware/validation.js
import { validationResult } from 'express-validator';
import { ValidationError } from '../utils/errors.js';

export function validateRequest(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new ValidationError('Invalid input data', errors.array());
  }

  next();
}
