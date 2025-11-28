import { NestFactory } from '@nestjs/core';
import { UsersAppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(UsersAppModule);

  // Configure TCP microservice for inter-service communication
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: parseInt(process.env.USERS_SERVICE_TCP_PORT ?? '4001'),
    },
  });

  const config = new DocumentBuilder()
    .setTitle('Users Service')
    .setDescription('The users service API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.startAllMicroservices();
  await app.listen(process.env.USERS_SERVICE_PORT ?? 3001);
  
  console.log(`🚀 Users Service - HTTP: ${process.env.USERS_SERVICE_PORT ?? 3001}, TCP: ${process.env.USERS_SERVICE_TCP_PORT ?? 4001}`);
}
bootstrap();
