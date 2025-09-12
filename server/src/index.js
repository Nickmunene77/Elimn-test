// server/src/index.js
import app from './app.js';
import config from './config.js';
import { logger } from './logger.js';

const port = config.port || 4000;

app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
  logger.info(`Environment: ${config.env}`);
  logger.info(`Metrics: http://localhost:${port}/metrics`);
  logger.info(`Health: http://localhost:${port}/health`);
  logger.info(`Auth API: http://localhost:${port}/auth`);
  logger.info(`Orders API: http://localhost:${port}/orders`);
});
