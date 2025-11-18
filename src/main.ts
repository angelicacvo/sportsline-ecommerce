import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from './common/http-exception/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // Apply global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Apply global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Apply global response interceptor
  app.useGlobalInterceptors(new ResponseInterceptor());

  app.enableCors();

  // Create a configuration object with API metadata
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Sportsline E-commerce API')           
    .setDescription('REST API for sports e-commerce platform with authentication, products, orders, and user management')  // API description
    .setVersion('1.0')                              
    
    // Add JWT authentication scheme
    // This tells Swagger that routes can be protected with JWT Bearer tokens
    .addBearerAuth(
      {
        type: 'http',           // Authentication type (http, apiKey, oauth2, etc.)
        scheme: 'bearer',       // Scheme name (bearer, basic, etc.)
        bearerFormat: 'JWT',    // Token format
        name: 'Authorization',  // Header name
        description: 'Enter JWT token',  // Description shown in UI
        in: 'header',           // Where to send the token (header, query, cookie)
      },
      'JWT-auth',  // Reference name to use in controllers with @ApiBearerAuth('JWT-auth')
    )
    
    // Add API tags for grouping endpoints
    .addTag('Authentication', 'User registration, login, and profile management')
    .addTag('Users', 'User CRUD operations (Admin only)')
    .addTag('Products', 'Product catalog management')
    .addTag('Clients', 'Client information management')
    .addTag('Orders', 'Order processing and management')
    .addTag('Order Items', 'Individual items within orders')
    
    // Add contact information (optional)
    .setContact(
      'Riwi Development Team',
      'https://riwi.io',
      'support@riwi.io'
    )
    
    .build();  // Build the configuration object

  // STEP 2: Generate the Swagger document
  // SwaggerModule.createDocument() scans all controllers and generates OpenAPI spec
  const document = SwaggerModule.createDocument(app, swaggerConfig);

  // STEP 3: Setup Swagger UI
  // SwaggerModule.setup(path, app, document) creates the UI at the specified path
  // Access it at: http://localhost:3000/api/docs
  SwaggerModule.setup('docs', app, document, {
    // Swagger UI options
    swaggerOptions: {
      persistAuthorization: true,  // Keep authorization token after page refresh
      docExpansion: 'none',         // Collapse all sections by default ('none', 'list', 'full')
      filter: true,                 // Enable search/filter boxs
      showRequestDuration: true,    // Show how long requests take
    },
  });

  const port = config.get<number>('PORT') || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation available at: http://localhost:${port}/api/docs`);
}
bootstrap();
