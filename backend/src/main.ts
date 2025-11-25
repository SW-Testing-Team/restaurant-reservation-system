import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
<<<<<<< HEAD
import { ValidationPipe } from '@nestjs/common';//to be able to create DTO   " npm install class-validator class-transformer"
=======
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
>>>>>>> e0e59574e334ab35b4ec9213ed98db9368d3d860

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    })
  );

  app.enableCors({
    origin: "http://localhost:5173",
    credentials: true,
  });

  await app.listen(3000);
}

bootstrap();
