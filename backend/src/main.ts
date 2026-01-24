import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: [
      'http://localhost:5173',
      'https://restaurant-reservation-system-blond.vercel.app',
      /vercel\.app$/, // allow all Vercel subdomains
    ],
    credentials: true,
  });
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  await app.listen(port);
}

void bootstrap();
