import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

/**
 * Точка входа в приложение ERP-сервера
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  
  const configService = app.get(ConfigService);
  
  // Глобальная валидация с class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Удаляет свойства, не указанные в DTO
      forbidNonWhitelisted: true, // Выбрасывает ошибку при лишних свойствах
      transform: true, // Автоматическое преобразование типов
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  
  // CORS для фронтенда
  app.enableCors({
    origin: true, // TODO: Указать конкретные домены в production
    credentials: true,
  });
  
  // Глобальный префикс API
  app.setGlobalPrefix('api');
  
  const port = configService.get<number>('app.port', 3000);
  await app.listen(port);
  
  console.log(`✅ ERP-сервер запущен на порту: ${port}`);
  console.log(`📡 API доступен по адресу: http://localhost:${port}/api`);
}

bootstrap();
