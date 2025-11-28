import { NestFactory } from '@nestjs/core';
import { OrderItemsAppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(OrderItemsAppModule);

  // Configure TCP microservice for inter-service communication
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: parseInt(process.env.ORDER_ITEMS_SERVICE_TCP_PORT ?? '4005'),
    },
  });

  const config = new DocumentBuilder()
    .setTitle('OrderItems Service')
    .setDescription('The order items service API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.startAllMicroservices();
  await app.listen(process.env.ORDER_ITEMS_SERVICE_PORT ?? 3005);
  
  console.log(`🚀 OrderItems Service - HTTP: ${process.env.ORDER_ITEMS_SERVICE_PORT ?? 3005}, TCP: ${process.env.ORDER_ITEMS_SERVICE_TCP_PORT ?? 4005}`);
}
bootstrap();
