// server/src/middleware/auth.js
import jwt from 'jsonwebtoken';
import config from '../config.js';
import { authAttempts } from '../metrics.js';
import { AuthenticationError } from '../utils/errors.js';

export function authRequired(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  
  if (!token) {
    authAttempts.inc({ type: 'token', status: 'missing' });
    throw new AuthenticationError('Authentication token required');
  }

  try {
    // I'm using HS256 algorithm as specified in requirements
    const payload = jwt.verify(token, config.jwt.secret, { algorithms: ['HS256'] });
    req.user = payload;
    authAttempts.inc({ type: 'token', status: 'success' });
    next();
  } catch (error) {
    authAttempts.inc({ type: 'token', status: 'invalid' });
    throw new AuthenticationError('Invalid or expired authentication token');
  }
}