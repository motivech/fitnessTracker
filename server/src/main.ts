import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import 'dotenv/config';
import { json } from 'express';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger('Bootstrap');
  
  // Глобальный обработчик исключений для отладки
  app.useGlobalFilters({
    catch(exception: any, host: any) {
      logger.error(`Глобальная ошибка: ${exception.message}`, exception.stack);
      const ctx = host.switchToHttp();
      const response = ctx.getResponse();
      const request = ctx.getRequest();
      
      const status = exception.getStatus ? exception.getStatus() : 500;
      
      response.status(status).json({
        statusCode: status,
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        message: exception.message || 'Внутренняя ошибка сервера',
        error: exception.name || 'InternalServerError',
      });
    },
  });
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));
  
  // Настройка для корректной обработки JSON
  app.use(json({ limit: '10mb' }));
  
  // Настройка статических файлов
  app.useStaticAssets(path.join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });
  
  // Настройка Swagger
  const config = new DocumentBuilder()
    .setTitle('Фитнес-приложение API')
    .setDescription('API для фитнес-приложения с функциями отслеживания тренировок, вызовов, достижений и метрик здоровья')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  // Расширенные настройки CORS для решения проблем с аутентификацией
  app.enableCors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], // Разрешенные источники
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // Разрешить передачу куки и заголовков авторизации
    allowedHeaders: 'Origin,X-Requested-With,Content-Type,Accept,Authorization,Access-Control-Allow-Headers',
    exposedHeaders: 'Authorization,Access-Control-Allow-Origin',
    maxAge: 86400, // 24 часа
  });
  
  // Логируем переменные окружения для отладки
  logger.log(`JWT_SECRET установлен: ${process.env.JWT_SECRET ? 'Да' : 'Нет (используется значение по умолчанию)'}`);
  logger.log(`JWT_EXPIRES_IN: ${process.env.JWT_EXPIRES_IN || '24h (по умолчанию)'}`);
  
  const port = process.env.PORT || 8000;
  await app.listen(port);
  console.log(`Приложение запущено: http://localhost:${port}`);
  console.log(`Документация API: http://localhost:${port}/api/docs`);
}

bootstrap();
