import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { GatewayModule } from './gateway.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { LoggerMiddleware } from './middleware/logger.middleware';

async function bootstrap() {
  const app = await NestFactory.create(GatewayModule);
  
  // Enable CORS
  app.enableCors();
  
  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Apply logger middleware
  app.use((req, res, next) => {
    const middleware = new LoggerMiddleware();
    middleware.use(req, res, next);
  });

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Sportsline API Gateway')
    .setDescription(`
      HTTP facade for microservices (users, products, categories, orders, order-items).
      
      **Test Credentials:**
      - Admin: admin@sportsline.com / admin123
      - User: user@sportsline.com / user123
      
      **How to authenticate:**
      1. Use POST /auth/login with test credentials
      2. Copy the "accessToken" from the response
      3. Click "Authorize" button (top right)
      4. Enter: Bearer <your-access-token>
      5. Test protected endpoints
    `)
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'Authorization',
      description: 'Enter JWT token from /auth/login',
      in: 'header',
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  
  await app.listen(3000, '0.0.0.0');
  console.log('Gateway HTTP running on port 3000');
  console.log('Swagger available at /docs');
}
bootstrap();
