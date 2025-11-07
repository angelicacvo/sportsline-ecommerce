import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { ClientModule } from './client/client.module';
import { OrderModule } from './order/order.module';
import { OrderItemsModule } from './order-items/order-items.module';

@Module({
  imports: [DatabaseModule, UserModule, ProductModule, ClientModule, OrderModule, OrderItemsModule],
})
export class AppModule {}
