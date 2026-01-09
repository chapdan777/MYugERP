import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
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
  
  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('Production ERP API')
    .setDescription('API документация для системы управления производством')
    .setVersion('1.0')
    .addTag('auth', 'Аутентификация и авторизация')
    .addTag('users', 'Управление пользователями')
    .addTag('products', 'Управление продуктами')
    .addTag('properties', 'Управление свойствами')
    .addTag('pricing', 'Ценообразование')
    .addTag('configuration', 'Конфигурация заказов')
    .addTag('orders', 'Управление заказами')
    .addTag('work-orders', 'Заказ-наряды и производственные задания')
    .addTag('kanban', 'Канбан-доски')
    .addTag('production', 'Производственные процессы')
    .addTag('workforce', 'Управление трудовыми ресурсами')
    .addTag('accounting', 'Бухгалтерия и платежи')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Введите JWT токен',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });
  
  const port = configService.get<number>('app.port', 3000);
  await app.listen(port);
  
  console.log(`✅ ERP-сервер запущен на порту: ${port}`);
  console.log(`📡 API доступен по адресу: http://localhost:${port}/api`);
  console.log(`📚 API документация: http://localhost:${port}/api/docs`);
}

bootstrap();
