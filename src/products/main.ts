import { NestFactory } from '@nestjs/core';
import { ProductsAppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(ProductsAppModule);

  // Configure TCP microservice for inter-service communication
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: parseInt(process.env.PRODUCTS_SERVICE_TCP_PORT ?? '4002'),
    },
  });

  const config = new DocumentBuilder()
    .setTitle('Products Service')
    .setDescription('The products service API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.startAllMicroservices();
  await app.listen(process.env.PRODUCTS_SERVICE_PORT ?? 3002);
  
  console.log(`🚀 Products Service - HTTP: ${process.env.PRODUCTS_SERVICE_PORT ?? 3002}, TCP: ${process.env.PRODUCTS_SERVICE_TCP_PORT ?? 4002}`);
}
bootstrap();
