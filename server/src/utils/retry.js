// server/src/utils/retry.js
export async function withRetry(operation, options = {}) {
  const {
    maxAttempts = 3,
    backoffMs = 200,
    shouldRetry = (error) => true,
  } = options;

  let attempt = 0;
  let lastError;

  while (attempt < maxAttempts) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      attempt++;

      if (attempt >= maxAttempts || !shouldRetry(error)) {
        break;
      }

      await new Promise((resolve) =>
        setTimeout(resolve, backoffMs * Math.pow(2, attempt - 1))
      );
    }
  }

  const retryError = new Error(
    `Operation failed after ${maxAttempts} attempts`
  );
  retryError.originalError = lastError;
  retryError.retriesExhausted = true;
  throw retryError;
}
