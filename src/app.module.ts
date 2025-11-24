import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { ClientModule } from './client/client.module';
import { OrderModule } from './order/order.module';
import { OrderItemsModule } from './order-items/order-items.module';
import { AuthModule } from './auth/auth.module';
import { RoleModule } from './role/role.module';
import { PermissionModule } from './permission/permission.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { ValidationMiddleware } from './common/middleware/validation.middleware';

@Module({
  imports: [
    DatabaseModule, 
    UserModule, 
    ProductModule, 
    ClientModule, 
    OrderModule, 
    OrderItemsModule, 
    AuthModule,
    RoleModule,        // ← Nuevo módulo de roles
    PermissionModule,  // ← Nuevo módulo de permisos
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ValidationMiddleware, LoggerMiddleware)
      .forRoutes('*');
  }
}
