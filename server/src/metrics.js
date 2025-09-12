// server/src/metrics.js
import client from 'prom-client';

const register = new client.Registry();
client.collectDefaultMetrics({ register });

// Authentication metrics
export const authAttempts = new client.Counter({
  name: 'auth_attempts_total',
  help: 'Total authentication attempts',
  labelNames: ['type', 'status'],
});

// Orders metrics
export const ordersCreated = new client.Counter({
  name: 'orders_created_total',
  help: 'Total number of orders created',
  labelNames: ['status'],
});

// Payment metrics - ADD THIS
export const paymentWebhooks = new client.Counter({
  name: 'payment_webhooks_total',
  help: 'Total payment webhook events',
  labelNames: ['status'],
});

// Register all metrics
register.registerMetric(authAttempts);
register.registerMetric(ordersCreated);
register.registerMetric(paymentWebhooks); // ADD THIS

export const metricsHandler = async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
};

export default {
  authAttempts,
  ordersCreated,
  paymentWebhooks, // ADD THIS
  metricsHandler,
};
