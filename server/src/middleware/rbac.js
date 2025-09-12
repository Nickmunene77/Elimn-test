// server/src/middleware/rbac.js
import { AuthorizationError } from '../utils/errors.js';

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'ADMIN') {
    throw new AuthorizationError('Administrator privileges required');
  }
  next();
}

export function requireRole(role) {
  return (req, res, next) => {
    if (req.user?.role !== role) {
      throw new AuthorizationError(`Required role: ${role}`);
    }
    next();
  };
}