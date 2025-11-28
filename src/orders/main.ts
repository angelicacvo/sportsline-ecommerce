import { NestFactory } from '@nestjs/core';
import { OrdersAppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(OrdersAppModule);

  // Configure TCP microservice for inter-service communication
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: parseInt(process.env.ORDERS_SERVICE_TCP_PORT ?? '4003'),
    },
  });

  const config = new DocumentBuilder()
    .setTitle('Orders Service')
    .setDescription('The orders service API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.startAllMicroservices();
  await app.listen(process.env.ORDERS_SERVICE_PORT ?? 3003);
  
  console.log(`🚀 Orders Service - HTTP: ${process.env.ORDERS_SERVICE_PORT ?? 3003}, TCP: ${process.env.ORDERS_SERVICE_TCP_PORT ?? 4003}`);
}
bootstrap();
