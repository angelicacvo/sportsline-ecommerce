import { Transport, ClientProviderOptions } from '@nestjs/microservices';

// Para conectarse desde el gateway a los microservicios:
// - En Docker: usar nombres de servicios (users-service, products-service, etc.)
// - Local: usar localhost
const getServiceHost = (serviceName: string): string => {
  return process.env[`${serviceName}_HOST`] || 'localhost';
};

export const MICROSERVICES_CONFIG: Record<string, ClientProviderOptions> = {
  USERS_SERVICE: {
    name: 'USERS_SERVICE',
    transport: Transport.TCP,
    options: {
      host: getServiceHost('USERS_SERVICE'),
      port: 4001,
    },
  },
  PRODUCTS_SERVICE: {
    name: 'PRODUCTS_SERVICE',
    transport: Transport.TCP,
    options: {
      host: getServiceHost('PRODUCTS_SERVICE'),
      port: 4002,
    },
  },
  ORDERS_SERVICE: {
    name: 'ORDERS_SERVICE',
    transport: Transport.TCP,
    options: {
      host: getServiceHost('ORDERS_SERVICE'),
      port: 4003,
    },
  },
  CATEGORIES_SERVICE: {
    name: 'CATEGORIES_SERVICE',
    transport: Transport.TCP,
    options: {
      host: getServiceHost('CATEGORIES_SERVICE'),
      port: 4004,
    },
  },
  ORDER_ITEMS_SERVICE: {
    name: 'ORDER_ITEMS_SERVICE',
    transport: Transport.TCP,
    options: {
      host: getServiceHost('ORDER_ITEMS_SERVICE'),
      port: 4005,
    },
  },
};
