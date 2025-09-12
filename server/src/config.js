// server/src/config.js
import Joi from 'joi';

const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(4000),
  JWT_SECRET: Joi.string().min(32).required().description('JWT secret key'),
  DATABASE_URL: Joi.string().required().description('Database connection URL'),
  PAYMENT_WEBHOOK_SECRET: Joi.string()
    .optional()
    .description('Payment webhook secret'),
})
  .unknown()
  .required();

const { value: envVars, error } = envVarsSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export default {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  jwt: {
    secret: envVars.JWT_SECRET,
    expiresIn: '2h',
  },
  database: {
    url: envVars.DATABASE_URL,
  },
  payment: {
    webhookSecret: envVars.PAYMENT_WEBHOOK_SECRET || 'default-webhook-secret',
  },
};
