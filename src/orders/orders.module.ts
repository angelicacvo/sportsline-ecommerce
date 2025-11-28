import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersMessageController } from './orders.message.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    ClientsModule.register([
      {
        name: 'USERS_SERVICE',
        transport: Transport.TCP,
        options: { host: '0.0.0.0', port: 3001 },
      },
    ]),
  ],
  controllers: [OrdersMessageController],
  providers: [OrdersService],
})
export class OrdersModule {}
