import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),

  DATABASE_HOST: Joi.string().required(),
  DATABASE_PORT: Joi.number().default(5432),
  DATABASE_USER: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),

  JWT_SECRET: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),

  GOOGLE_CLIENT_ID: Joi.string().allow('', null),
  GOOGLE_CLIENT_SECRET: Joi.string().allow('', null),
  GOOGLE_CALLBACK_URL: Joi.string().uri().allow('', null),

  USERS_SERVICE_HOST: Joi.string().default('localhost'),
  PRODUCTS_SERVICE_HOST: Joi.string().default('localhost'),
  ORDERS_SERVICE_HOST: Joi.string().default('localhost'),
  CATEGORIES_SERVICE_HOST: Joi.string().default('localhost'),
  ORDER_ITEMS_SERVICE_HOST: Joi.string().default('localhost'),
});
