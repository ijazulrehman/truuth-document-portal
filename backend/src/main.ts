import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
  origin: '*',
  credentials: false,
});

  // Global prefix for all routes
  app.setGlobalPrefix('api');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global response transform interceptor
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger API documentation
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Truuth Document Portal API')
      .setDescription('Backend API for the Applicant Document Submission Portal')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication endpoints')
      .addTag('documents', 'Document management endpoints')
      .addTag('health', 'Health check endpoints')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   TRUUTH DOCUMENT PORTAL - BACKEND SERVER');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Server running on: http://localhost:${port}`);
  console.log(`   API endpoint: http://localhost:${port}/api`);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`   Swagger docs: http://localhost:${port}/api/docs`);
  }
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
}

bootstrap();
