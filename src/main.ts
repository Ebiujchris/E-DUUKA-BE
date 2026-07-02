import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for allowed frontends
  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
    : [
        'http://localhost:5173',
        'http://localhost:3000',
        'http://localhost:8081',
        'http://localhost:8082',
        'http://localhost:8083',
        'exp://localhost:8081',
        'https://e-duuka-fe.vercel.app',
      ];

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization,Accept',
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
  
  // Enable validation pipes
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  // Set global prefix for API routes
  app.setGlobalPrefix('api', {
    exclude: ['/', 'health'],
  });
  
  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`🚀 E-Duuka API is running on: http://localhost:${port}`);
  console.log(`📱 Mobile API endpoints: http://localhost:${port}/api`);
  console.log(`🏠 Homepage: http://localhost:${port}`);
}
bootstrap();
