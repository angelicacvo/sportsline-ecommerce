import { NestFactory } from '@nestjs/core';
import { CategoriesAppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(CategoriesAppModule);

  // Configure TCP microservice for inter-service communication
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: parseInt(process.env.CATEGORIES_SERVICE_TCP_PORT ?? '4004'),
    },
  });

  const config = new DocumentBuilder()
    .setTitle('Categories Service')
    .setDescription('The categories service API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.startAllMicroservices();
  await app.listen(process.env.CATEGORIES_SERVICE_PORT ?? 3004);
  
  console.log(`🚀 Categories Service - HTTP: ${process.env.CATEGORIES_SERVICE_PORT ?? 3004}, TCP: ${process.env.CATEGORIES_SERVICE_TCP_PORT ?? 4004}`);
}
bootstrap();
