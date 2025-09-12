// server/src/utils/errors.js
export class AppError extends Error {
  constructor(message, statusCode = 500, errorCode = 'INTERNAL_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed', errorCode = 'AUTH_ERROR') {
    super(message, 401, errorCode);
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Access denied', errorCode = 'FORBIDDEN') {
    super(message, 403, errorCode);
  }
}

export class ValidationError extends AppError {
  constructor(
    message = 'Invalid input',
    details = [],
    errorCode = 'VALIDATION_ERROR'
  ) {
    super(message, 400, errorCode);
    this.details = details;
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found', errorCode = 'NOT_FOUND') {
    super(message, 404, errorCode);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict', errorCode = 'CONFLICT') {
    super(message, 409, errorCode);
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests', errorCode = 'RATE_LIMITED') {
    super(message, 429, errorCode);
  }
}
