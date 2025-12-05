import { Module } from '@nestjs/common';
import { APP_GUARD, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ClientsModule } from '@nestjs/microservices';
import { ConfigModule } from '@nestjs/config';
import { MICROSERVICES_CONFIG } from '../microservices.config';
import { UsersController } from './controllers/users/users.controller';
import { ProductsController } from './controllers/products/products.controller';
import { CategoriesController } from './controllers/categories/categories.controller';
import { OrdersController } from './controllers/orders/orders.controller';
import { OrderItemsController } from './controllers/order-items/order-items.controller';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { ApiKeyGuard } from './guards/api-key.guard';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { RpcExceptionFilter } from './filters/rpc-exception.filter';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { envValidationSchema } from '../config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: envValidationSchema,
    }),
    ClientsModule.register([
      MICROSERVICES_CONFIG.USERS_SERVICE,
      MICROSERVICES_CONFIG.PRODUCTS_SERVICE,
      MICROSERVICES_CONFIG.ORDERS_SERVICE,
      MICROSERVICES_CONFIG.ORDER_ITEMS_SERVICE,
      MICROSERVICES_CONFIG.CATEGORIES_SERVICE,
    ]),
    AuthModule,
  ],
  controllers: [
    UsersController,
    ProductsController,
    CategoriesController,
    OrdersController,
    OrderItemsController,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ApiKeyGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: RpcExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class GatewayModule {}
