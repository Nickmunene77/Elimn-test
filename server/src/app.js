// server/src/app.js
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';

import authRoutes from './routes/auth.js';
import orderRoutes from './routes/orders.js';
import { metricsHandler } from './metrics.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/orders', orderRoutes);

// Metrics endpoint
app.get('/metrics', metricsHandler);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling (must be last)
app.use(errorHandler);

export default app;
