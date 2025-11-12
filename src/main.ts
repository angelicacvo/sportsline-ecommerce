import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { FakeUserMiddleware } from './common/middleware/fake-user.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🧩 Middleware global: se ejecuta ANTES de los guards
  app.use(new FakeUserMiddleware().use);

  // ⚙️ Filtro global para manejar excepciones
  app.useGlobalFilters(new GlobalExceptionFilter());

  // 🧾 Interceptor global para logs de peticiones
  app.useGlobalInterceptors(new LoggingInterceptor());

  // 🚀 Iniciar servidor
  await app.listen(3000);
  console.log('✅ Servidor corriendo en http://localhost:3000');
}

bootstrap();
