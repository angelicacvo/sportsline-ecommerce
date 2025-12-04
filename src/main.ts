import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🔹 Filtro global de excepciones
  app.useGlobalFilters(new GlobalExceptionFilter());

  // 🔹 Interceptor global para logs
  app.useGlobalInterceptors(new LoggingInterceptor());

  // 🔹 Configuración Swagger
  const config = new DocumentBuilder()
    .setTitle('SportsLine API')
    .setDescription(
      'Documentación de autenticación JWT, Roles y OAuth2 con Google',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token de acceso JWT',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(3000);

  console.log('Servidor corriendo en http://localhost:3000');
  console.log('Swagger: http://localhost:3000/docs');
}

bootstrap();
